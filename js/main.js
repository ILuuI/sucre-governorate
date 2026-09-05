/**
 * main.js
 * ------------------------------------------------------------------
 * Lógica principal del sitio. Responsabilidades:
 *  1. Resolver qué zona mostrar (parámetro ?zona= del QR > localStorage >
 *     GPS automático en móvil > selector manual)
 *  2. Renderizar todas las secciones a partir de ZONES[id] (data.js)
 *  3. Manejar filtros de cada sección
 *  4. Pedir geolocalización de forma respetuosa y calcular distancias
 *  5. Generar rutas "Cómo llegar" (Google/Apple Maps) hacia cada estadio
 *  6. Inicializar el mapa Leaflet con marcadores por categoría
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  const STORAGE_KEY = "escala:lastZone";

  const state = {
    zoneId: null,
    userCoords: null,      // { lat, lng } una vez concedido el permiso
    geoStatus: "idle",     // idle | requesting | ok | denied | unsupported | error
    map: null,
    mapLayers: {},
    mapFilters: { deporte: true, turismo: true, comida: true },
    filters: {
      deporte: "todos",
      interes: "todos",
      tipo: "todos",
    },
  };

  /* ------------------------------------------------------------------
   * 1. RESOLUCIÓN DE ZONA (flujo QR + GPS automático en móvil)
   * ------------------------------------------------------------------ */
  function resolveZoneId() {
    const params = new URLSearchParams(window.location.search);
    const fromQR = params.get("zona");
    if (fromQR && ZONES[fromQR]) {
      try { localStorage.setItem(STORAGE_KEY, fromQR); } catch (e) { /* almacenamiento no disponible */ }
      return fromQR;
    }

    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignorar */ }
    if (saved && ZONES[saved]) return saved;

    return null; // no hay zona resuelta todavía
  }

  function isMobileViewport() {
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    const narrow = window.matchMedia("(max-width: 820px)").matches;
    return uaMobile || narrow;
  }

  function setZone(id) {
    if (!ZONES[id]) return;
    state.zoneId = id;
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* ignorar */ }

    const url = new URL(window.location.href);
    url.searchParams.set("zona", id);
    window.history.replaceState({}, "", url);

    renderAll();
    closeZoneSwitcher();
    hideGeoBanner();
  }

  function setZoneQuiet(id) {
    state.zoneId = id;
    const url = new URL(window.location.href);
    url.searchParams.set("zona", id);
    window.history.replaceState({}, "", url);
  }

  /* ------------------------------------------------------------------
   * 2. HELPERS DE RENDER
   * ------------------------------------------------------------------ */
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function formatFecha(fechaISO) {
    const d = new Date(fechaISO + "T00:00:00");
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });
  }

  function getZone() {
    return ZONES[state.zoneId];
  }

  function accentVar(name) {
    if (name === "sol") return { accent: "--sol", ink: "--sol-ink" };
    if (name === "mar") return { accent: "--mar", ink: "--mar-ink" };
    if (name === "monte") return { accent: "--monte", ink: "--monte-ink" };
    return { accent: "--sol", ink: "--sol-ink" };
  }

  // Enlace de rutas: funciona tanto en Google Maps (Android/web) como
  // en el selector nativo de iOS, ya que Google Maps for iOS también
  // resuelve este esquema de URL. No requiere la ubicación del usuario:
  // la app de mapas usa el GPS del teléfono como origen automáticamente.
  function directionsUrl(coords, label) {
    const dest = `${coords.lat},${coords.lng}`;
    const q = encodeURIComponent(label || "Destino");
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=&travelmode=driving&dir_action=navigate&query=${q}`;
  }

  /* ------------------------------------------------------------------
   * 3. RENDER: cabecera / hero / footer
   * ------------------------------------------------------------------ */
  function renderHeaderFields() {
    const zone = getZone();
    document.querySelectorAll('[data-field="zoneName"]').forEach(n => n.textContent = zone.nombreCorto);
    document.querySelectorAll('[data-field="zoneNameFooter"]').forEach(n => n.textContent = zone.nombreCorto);
    document.querySelectorAll('[data-field="zoneApodo"]').forEach(n => n.textContent = zone.apodo);
    document.querySelectorAll('[data-field="zoneDescripcion"]').forEach(n => n.textContent = zone.descripcion);
    document.querySelectorAll('[data-field="codigo"]').forEach(n => n.textContent = `QR · ZONA ${zone.id}`);
    document.title = `Escala Sucre — ${zone.nombreCorto}`;

    const { accent, ink } = accentVar(zone.colorAcento);
    document.documentElement.style.setProperty("--zone-accent", `var(${accent})`);
    document.documentElement.style.setProperty("--zone-accent-ink", `var(${ink})`);

    renderCoverPhoto(zone);
  }

  function renderCoverPhoto(zone) {
    const wrap = document.querySelector("[data-cover-photo]");
    if (!wrap) return;
    wrap.innerHTML = "";

    const img = document.createElement("img");
    img.src = zone.fotoUrl;
    img.alt = `Foto de ${zone.nombreCorto}, departamento de Sucre`;
    img.loading = "eager";
    img.onerror = function () {
      wrap.innerHTML = `
        <div class="cover-card__fallback">
          <div class="pinwheel pinwheel--lg" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>`;
    };
    wrap.appendChild(img);

    const credit = document.createElement("span");
    credit.className = "cover-card__credit";
    credit.textContent = zone.fotoCredito || "";
    wrap.appendChild(credit);
  }

  /* ------------------------------------------------------------------
   * 4. RENDER: experiencias destacadas
   * ------------------------------------------------------------------ */
  function renderExperiencias() {
    const zone = getZone();
    const container = document.querySelector("[data-experiencias]");
    container.innerHTML = "";
    zone.experiencias.forEach(exp => {
      container.appendChild(el(`
        <article class="exp-card" role="listitem">
          <h3 class="exp-card__title">${exp.titulo}</h3>
          <p class="exp-card__detail">${exp.detalle}</p>
        </article>
      `));
    });
  }

  /* ------------------------------------------------------------------
   * 5. RENDER: deportes (con botón "Cómo llegar" al estadio)
   * ------------------------------------------------------------------ */
  function renderDeportes() {
    const zone = getZone();
    const list = document.querySelector("[data-deportes-list]");
    const hoy = new Date().toISOString().slice(0, 10);
    const enUnaSemana = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const filtered = zone.deportes.filter(ev => {
      if (state.filters.deporte === "hoy") return ev.fecha === hoy;
      if (state.filters.deporte === "semana") return ev.fecha >= hoy && ev.fecha <= enUnaSemana;
      return true;
    });

    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(el(`<li class="card">No hay eventos deportivos para este filtro. Prueba con "Todos".</li>`));
      return;
    }

    filtered.forEach(ev => {
      const destino = ev.estadioCoords || zone.coords;
      const ruta = directionsUrl(destino, ev.estadio);
      list.appendChild(el(`
        <li class="card card--deporte">
          <div class="card__top-row">
            <span class="card__tag">${ev.deporte}</span>
            ${ev.destacado ? '<span class="card__badge-highlight">Destacado</span>' : ""}
          </div>
          <h3 class="card__title">${ev.equipoLocal} vs ${ev.equipoVisitante}</h3>
          <div class="card__meta">
            <span>📅 <strong>${formatFecha(ev.fecha)}</strong></span>
            <span>🕒 <strong>${ev.hora}</strong></span>
            <span>📍 ${ev.estadio}</span>
          </div>
          ${ev.nota ? `<p class="card__nota">${ev.nota}</p>` : ""}
          <a class="card__route" href="${ruta}" target="_blank" rel="noopener">🧭 Cómo llegar al estadio</a>
        </li>
      `));
    });
  }

  /* ------------------------------------------------------------------
   * 6. RENDER: turismo (con distancia si hay geolocalización)
   * ------------------------------------------------------------------ */
  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180, lat2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(h));
  }

  function renderTurismo() {
    const zone = getZone();
    const list = document.querySelector("[data-turismo-list]");

    let items = zone.turismo.filter(t =>
      state.filters.interes === "todos" ? true : t.interes === state.filters.interes
    );

    if (state.userCoords) {
      items = items
        .map(t => ({ ...t, _dist: haversineKm(state.userCoords, t.coords) }))
        .sort((a, b) => a._dist - b._dist);
    }

    list.innerHTML = "";
    if (items.length === 0) {
      list.appendChild(el(`<li class="card">No hay lugares turísticos para este filtro.</li>`));
      return;
    }

    items.forEach(t => {
      const distHtml = t._dist != null
        ? `<span class="card__distance">${t._dist < 1 ? Math.round(t._dist * 1000) + " m" : t._dist.toFixed(1) + " km"}</span>`
        : "";
      list.appendChild(el(`
        <li class="card card--turismo">
          <div class="card__top-row">
            <span class="card__tag">Interés ${t.interes.toLowerCase()}</span>
            ${distHtml}
          </div>
          <h3 class="card__title">${t.nombre}</h3>
          <p class="card__desc">${t.descripcion}</p>
          <div class="card__meta"><span>🕒 <strong>${t.horario}</strong></span></div>
        </li>
      `));
    });
  }

  /* ------------------------------------------------------------------
   * 7. RENDER: comida típica
   * ------------------------------------------------------------------ */
  function renderComida() {
    const zone = getZone();
    const list = document.querySelector("[data-comida-list]");
    list.innerHTML = "";
    zone.comidaTipica.forEach(c => {
      list.appendChild(el(`
        <li class="card card--comida">
          <h3 class="card__title">${c.nombre}</h3>
          <p class="card__desc">${c.descripcion}</p>
        </li>
      `));
    });
  }

  /* ------------------------------------------------------------------
   * 8. RENDER: restaurantes / recomendaciones
   * ------------------------------------------------------------------ */
  function renderRestaurantes() {
    const zone = getZone();
    const list = document.querySelector("[data-restaurantes-list]");
    const filtered = zone.restaurantes.filter(r =>
      state.filters.tipo === "todos" ? true : r.tipo === state.filters.tipo
    );

    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(el(`<li class="card">No hay recomendaciones para este filtro.</li>`));
      return;
    }

    filtered.forEach(r => {
      list.appendChild(el(`
        <li class="card card--comida">
          <div class="card__top-row"><span class="card__tag">${r.tipo}</span></div>
          <h3 class="card__title">${r.nombre}</h3>
          <p class="card__desc">Especialidad: ${r.especialidad}</p>
        </li>
      `));
    });
  }

  /* ------------------------------------------------------------------
   * 9. Selector de destino (modal) + detección automática por GPS
   * ------------------------------------------------------------------ */
  function renderZoneSwitcherList() {
    const container = document.querySelector("[data-zone-list]");
    container.innerHTML = "";
    Object.values(ZONES).forEach(zone => {
      const { accent } = accentVar(zone.colorAcento);
      const card = el(`
        <button type="button" class="zone-card" data-select-zone="${zone.id}">
          <span class="zone-card__swatch" style="background: var(${accent})" aria-hidden="true"></span>
          <span class="zone-card__body">
            <span class="zone-card__name">${zone.nombre}</span>
            <span class="zone-card__desc">${zone.descripcion}</span>
          </span>
        </button>
      `);
      card.addEventListener("click", () => setZone(zone.id));
      container.appendChild(card);
    });
  }

  function openZoneSwitcher() {
    document.querySelector("[data-zone-switcher]").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeZoneSwitcher() {
    const panel = document.querySelector("[data-zone-switcher]");
    if (panel) panel.hidden = true;
    document.body.style.overflow = "";
  }

  function nearestZoneId(coords) {
    let bestId = null, bestDist = Infinity;
    Object.values(ZONES).forEach(zone => {
      const d = haversineKm(coords, zone.coords);
      if (d < bestDist) { bestDist = d; bestId = zone.id; }
    });
    return bestId;
  }

  /* ------------------------------------------------------------------
   * 10. Geolocalización
   * ------------------------------------------------------------------ */
  function setGeoStatus(text, statekey) {
    document.querySelectorAll("[data-geo-status], [data-geo-status-map]").forEach(n => {
      n.textContent = text;
      n.dataset.state = statekey;
    });
  }

  function showGeoBanner(text) {
    const banner = document.querySelector("[data-geo-banner]");
    if (!banner) return;
    banner.textContent = text;
    banner.hidden = false;
  }
  function hideGeoBanner() {
    const banner = document.querySelector("[data-geo-banner]");
    if (banner) banner.hidden = true;
  }

  function requestGeolocation(onSuccessExtra) {
    if (!("geolocation" in navigator)) {
      state.geoStatus = "unsupported";
      setGeoStatus("Tu navegador no soporta geolocalización. Puedes seguir explorando sin ubicación.", "denied");
      return;
    }

    state.geoStatus = "requesting";
    setGeoStatus("Pidiendo permiso de ubicación… acepta el mensaje del navegador para ver distancias reales.", "requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.geoStatus = "ok";
        setGeoStatus("Ubicación activada. Mostrando distancias reales desde donde estás.", "ok");
        renderTurismo();
        if (state.map) placeUserMarker();
        if (onSuccessExtra) onSuccessExtra(state.userCoords);
      },
      (err) => {
        state.geoStatus = "denied";
        const msg = err.code === err.PERMISSION_DENIED
          ? "No diste permiso de ubicación. Puedes seguir usando la guía sin distancias personalizadas."
          : "No pudimos obtener tu ubicación en este momento. Intenta de nuevo más tarde.";
        setGeoStatus(msg, "denied");
        if (onSuccessExtra) onSuccessExtra(null, err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  // Se ejecuta solo una vez, al arrancar en un teléfono sin zona guardada:
  // pide el GPS y redirige directo a la zona más cercana de las tres.
  function autoDetectZoneOnMobile() {
    if (!isMobileViewport() || !("geolocation" in navigator)) {
      openZoneSwitcher();
      return;
    }

    showGeoBanner("📍 Detectando tu zona por GPS…");
    openZoneSwitcher();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.geoStatus = "ok";
        const nearest = nearestZoneId(state.userCoords);
        showGeoBanner(`📍 Te ubicamos cerca de ${ZONES[nearest].nombreCorto}. Abriendo tu zona…`);
        setZone(nearest);
      },
      () => {
        hideGeoBanner();
        // Permiso denegado o no disponible: se queda en el selector manual.
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  /* ------------------------------------------------------------------
   * 11. Mapa (Leaflet + OpenStreetMap)
   * ------------------------------------------------------------------ */
  function dotIcon(cls) {
    return L.divIcon({
      className: "",
      html: `<span class="map-marker-dot ${cls}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  function initMap() {
    const zone = getZone();
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    if (state.map) { state.map.remove(); state.map = null; }

    state.map = L.map(mapEl, { scrollWheelZoom: false }).setView([zone.coords.lat, zone.coords.lng], zone.zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(state.map);

    state.mapLayers = {
      deporte: L.layerGroup().addTo(state.map),
      turismo: L.layerGroup().addTo(state.map),
      comida: L.layerGroup().addTo(state.map),
    };

    zone.deportes.forEach(ev => {
      const coords = ev.estadioCoords || zone.coords;
      const ruta = directionsUrl(coords, ev.estadio);
      L.marker([coords.lat, coords.lng], { icon: dotIcon("map-marker-dot--deporte") })
        .bindPopup(`<strong>${ev.equipoLocal} vs ${ev.equipoVisitante}</strong><br>${ev.estadio}<br>${formatFecha(ev.fecha)} · ${ev.hora}<br><a class="map-popup-route" href="${ruta}" target="_blank" rel="noopener">🧭 Cómo llegar</a>`)
        .addTo(state.mapLayers.deporte);
    });

    zone.turismo.forEach(t => {
      const ruta = directionsUrl(t.coords, t.nombre);
      L.marker([t.coords.lat, t.coords.lng], { icon: dotIcon("map-marker-dot--turismo") })
        .bindPopup(`<strong>${t.nombre}</strong><br>${t.descripcion}<br><a class="map-popup-route" href="${ruta}" target="_blank" rel="noopener">🧭 Cómo llegar</a>`)
        .addTo(state.mapLayers.turismo);
    });

    zone.restaurantes.forEach(r => {
      const ruta = directionsUrl(r.coords, r.nombre);
      L.marker([r.coords.lat, r.coords.lng], { icon: dotIcon("map-marker-dot--comida") })
        .bindPopup(`<strong>${r.nombre}</strong><br>${r.tipo} · ${r.especialidad}<br><a class="map-popup-route" href="${ruta}" target="_blank" rel="noopener">🧭 Cómo llegar</a>`)
        .addTo(state.mapLayers.comida);
    });

    if (state.userCoords) placeUserMarker();
  }

  let userMarker = null;
  function placeUserMarker() {
    if (!state.map || !state.userCoords) return;
    if (userMarker) state.map.removeLayer(userMarker);
    userMarker = L.marker([state.userCoords.lat, state.userCoords.lng], { icon: dotIcon("map-marker-dot--user") })
      .bindPopup("Estás aquí")
      .addTo(state.map);
  }

  function applyMapFilters() {
    Object.entries(state.mapFilters).forEach(([cat, visible]) => {
      const layer = state.mapLayers[cat];
      if (!layer || !state.map) return;
      if (visible) state.map.addLayer(layer);
      else state.map.removeLayer(layer);
    });
  }

  /* ------------------------------------------------------------------
   * 12. RENDER GENERAL
   * ------------------------------------------------------------------ */
  function renderAll() {
    if (!getZone()) return;
    renderHeaderFields();
    renderExperiencias();
    renderDeportes();
    renderTurismo();
    renderComida();
    renderRestaurantes();
    initMap();
    applyMapFilters();
  }

  /* ------------------------------------------------------------------
   * 13. EVENTOS DE UI
   * ------------------------------------------------------------------ */
  function bindEvents() {
    // Menú móvil
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }));

    // Selector de zona
    document.querySelectorAll("[data-open-zone-switcher]").forEach(btn =>
      btn.addEventListener("click", openZoneSwitcher)
    );
    document.querySelectorAll("[data-close-zone-switcher]").forEach(btn =>
      btn.addEventListener("click", closeZoneSwitcher)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeZoneSwitcher();
    });

    // Detección automática de zona por GPS (botón manual dentro del modal)
    const detectBtn = document.querySelector("[data-detect-zone]");
    if (detectBtn) {
      detectBtn.addEventListener("click", () => {
        showGeoBanner("📍 Detectando tu zona por GPS…");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            const nearest = nearestZoneId(state.userCoords);
            showGeoBanner(`📍 Te ubicamos cerca de ${ZONES[nearest].nombreCorto}. Abriendo tu zona…`);
            setZone(nearest);
          },
          () => {
            hideGeoBanner();
            setGeoStatus("No pudimos acceder a tu ubicación. Elige tu destino manualmente.", "denied");
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      });
    }

    // Filtros de deportes
    document.querySelectorAll("[data-filter-deporte]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-deporte]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.deporte = btn.dataset.filterDeporte;
        renderDeportes();
      });
    });

    // Filtros de turismo (interés)
    document.querySelectorAll("[data-filter-interes]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-interes]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.interes = btn.dataset.filterInteres;
        renderTurismo();
      });
    });

    // Ordenar turismo por cercanía → dispara geolocalización si no existe aún
    document.querySelector("[data-geo-sort]").addEventListener("click", () => {
      if (state.userCoords) { renderTurismo(); return; }
      requestGeolocation();
    });

    // Filtros de restaurantes
    document.querySelectorAll("[data-filter-tipo]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-tipo]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.tipo = btn.dataset.filterTipo;
        renderRestaurantes();
      });
    });

    // Filtros de capas del mapa
    document.querySelectorAll("[data-map-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.mapFilter;
        state.mapFilters[cat] = !state.mapFilters[cat];
        btn.classList.toggle("is-active", state.mapFilters[cat]);
        applyMapFilters();
      });
    });

    // Botón "usar mi ubicación" (mapa)
    document.querySelector("[data-geo-locate]").addEventListener("click", () => requestGeolocation());
  }

  /* ------------------------------------------------------------------
   * 14. ARRANQUE
   * ------------------------------------------------------------------ */
  function init() {
    bindEvents();
    renderZoneSwitcherList();

    const id = resolveZoneId();
    if (id) {
      setZoneQuiet(id);
      renderAll();
    } else {
      // Sin zona en la URL ni guardada: en móvil, intenta ubicar por GPS
      // y redirigir directo a la zona más cercana; siempre con el
      // selector manual visible como respaldo.
      autoDetectZoneOnMobile();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
