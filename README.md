# Escala Sucre — Guía departamental de deporte, turismo y gastronomía

Sitio estático (HTML + CSS + JS puro, sin frameworks ni build step) rediseñado
con la identidad visual del **Plan de Desarrollo Departamental "Sucre, Tierra
de Oportunidades" 2024–2027**: fondo crema, tipografía redondeada y festiva,
y la paleta de 5 colores del logotipo (naranja sol, azul mar, verde monte,
terracota y amarillo).

## 1. Qué cambió respecto a la versión anterior

- **Identidad visual**: de un tema oscuro tipo "boarding pass" a un fondo
  crema cálido con tipografía **Baloo 2** (títulos) + **Nunito Sans** (cuerpo),
  inspirado directamente en la portada del Plan de Desarrollo.
- **Elemento firma**: los "bloques pinwheel", el patrón de cuadros de color
  en diagonal de la portada, reutilizado en el logo, la portada de cada zona
  y el footer.
- **Contenido real**: las 3 zonas de ejemplo se reemplazaron por 3 zonas
  reales de Sucre, con lugares, gastronomía y coordenadas verificadas por
  búsqueda web (ver sección 4 para el detalle de fuentes y límites).
- **Fotografía real**: cada zona tiene una foto de portada de Wikimedia
  Commons con crédito visible, y un respaldo ilustrado (bloques de color)
  si la imagen no carga.
- **GPS → zona automática**: en móvil, si no hay zona guardada, el sitio
  pide permiso de ubicación y redirige directo a la zona más cercana de
  las tres (con botón para repetirlo manualmente en cualquier momento).
- **Ruta al estadio**: cada evento deportivo tiene un botón
  "🧭 Cómo llegar" que abre Google/Apple Maps con la ruta desde la
  ubicación del usuario hasta el estadio de ese partido específico
  (también disponible en todos los popups del mapa).

## 2. Las 3 zonas

| Zona | Municipios | Qué la define |
|---|---|---|
| 1 — Sincelejo | Sincelejo | Capital del departamento: corralejas, Plaza de Majagual, Estadio Arturo Cumplido Sierra (fútbol Dimayor y béisbol profesional) |
| 2 — Golfo de Morrosquillo | Tolú y Coveñas | Malecón, playas certificadas y salida a las Islas de San Bernardo |
| 3 — Montes de María | Ovejas y Colosó | Festival Nacional de Gaitas, Salto del Sereno, serranía verde |

## 3. Cómo funciona el flujo de QR / GPS

En el arranque (`js/main.js → init()`), la página resuelve la zona en este
orden de prioridad:

1. **Parámetro `?zona=` en la URL** (lo que trae el QR escaneado).
2. **`localStorage`** con la última zona vista.
3. **GPS automático** (solo en móvil, solo si no hay zona resuelta aún):
   pide permiso de ubicación y abre directamente la zona más cercana,
   calculada con la fórmula de Haversine sobre el centro de las 3 zonas.
4. **Selector manual** ("Elige tu zona"), si el GPS no está disponible o
   el usuario no da el permiso — siempre accesible desde el botón
   "Cambiar zona" del header y desde "📍 Usar mi GPS" dentro del modal.

## 4. Fuentes y límites conocidos de los datos

Verificado por búsqueda web: nombres y descripciones de lugares turísticos,
platos típicos, y coordenadas aproximadas de municipios y sitios (Wikipedia,
Wikimedia Commons, medios colombianos de turismo, Colombia.co, Infobae).

**Aún de ejemplo / a verificar antes de publicar:**
- **Horarios de partidos** (`fecha`, `hora` en `js/data.js`): no existe una
  fuente centralizada consultable para el calendario deportivo real de
  cada equipo. Están marcados como "por confirmar" — conectar con
  Dimayor / IMDER Sincelejo antes de imprimir los QR.
- **Coordenadas de estadios y sitios puntuales**: son aproximaciones
  razonables (a partir de direcciones y ubicación conocida), no
  coordenadas GPS medidas en el sitio. Suficientes para un mapa de
  referencia; conviene afinarlas con Google Maps antes de producción.

## 5. Estructura de archivos

```
sucre_site/
├── index.html          # Estructura semántica de todas las secciones
├── css/
│   └── style.css        # Sistema de diseño (tokens + componentes) responsive
├── js/
│   ├── data.js           # Datos de las 3 zonas (EDITAR AQUÍ para actualizar contenido)
│   └── main.js            # Lógica: resolución de zona, GPS, render, filtros, mapa, rutas
└── README.md
```

No hay build step. Se puede abrir `index.html` directamente o servirlo con
cualquier servidor estático (Netlify, Vercel, GitHub Pages, Nginx, etc.).

## 6. Cómo actualizar el contenido

Todo el contenido vive en `ZONES` dentro de `js/data.js`. Cada zona tiene:

```js
"1": {
  id, slug, nombre, nombreCorto, apodo, descripcion, colorAcento,
  coords, zoom, fotoUrl, fotoCredito,
  deportes: [ { equipoLocal, equipoVisitante, deporte, fecha, hora,
                estadio, estadioCoords, destacado, nota } ],
  turismo:  [ { nombre, descripcion, horario, interes, coords } ],
  comidaTipica: [ { nombre, descripcion } ],
  restaurantes: [ { nombre, tipo, especialidad, coords } ],
  experiencias: [ { titulo, detalle } ],
}
```

`colorAcento` acepta `"sol"` (naranja), `"mar"` (azul) o `"monte"` (verde) —
son las 3 variables de color definidas en `css/style.css`. El botón "Cómo
llegar" de cada partido usa `estadioCoords`; si no se define, cae al centro
de la zona (`coords`).

## 7. Mapa interactivo y rutas

- Librería: **Leaflet** + teselas de **OpenStreetMap**, cargadas por CDN.
  No requiere API key.
- Marcadores diferenciados por color según categoría (deporte / turismo /
  gastronomía), con capas independientes que se pueden mostrar/ocultar.
- Cada marcador y cada tarjeta de partido incluye un enlace de ruta
  (`https://www.google.com/maps/dir/?api=1&destination=...`), que abre la
  app de mapas del teléfono y usa el GPS del dispositivo como origen
  automáticamente — no requiere que el sitio tenga la ubicación del usuario.

## 8. Geolocalización

- **Detección automática de zona** (solo móvil, solo la primera vez): se
  pide apenas se abre el sitio sin zona resuelta. Si se deniega, cae al
  selector manual sin bloquear la navegación.
- **Ordenar por cercanía** en Turismo y **"Usar mi ubicación"** en el mapa:
  se piden solo cuando el usuario las activa explícitamente.
- Estados manejados explícitamente: `requesting`, `ok`, `denied`,
  `unsupported`, con mensaje visible (`aria-live="polite"`).
- Las distancias se calculan en el cliente con la fórmula de Haversine, sin
  llamadas externas.

## 9. Accesibilidad

- Encabezados jerárquicos (`h1` único por página, `h2` por sección).
- `skip link` al contenido principal.
- Foco visible (`:focus-visible`) en todos los elementos interactivos.
- Roles y `aria-*` en el modal (`role="dialog"`, `aria-modal`), en los
  estados de geolocalización y en el contenedor del mapa.
- `prefers-reduced-motion` respetado.

## 10. Cómo agregar una cuarta zona

1. Agregar un nuevo bloque `"4": { ... }` en `ZONES` dentro de `js/data.js`.
2. La tarjeta correspondiente aparece automáticamente en el selector y en
   el cálculo de "zona más cercana" por GPS.
3. Generar un nuevo QR apuntando a `?zona=4`. No se requiere tocar HTML,
   CSS ni la lógica de `main.js`.
