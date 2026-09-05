/**
 * data.js
 * ------------------------------------------------------------------
 * Fuente única de datos para las 3 zonas del departamento de Sucre.
 *
 * Contenido verificado por búsqueda web (lugares, gastronomía, coordenadas
 * aproximadas de municipios y sitios turísticos). Los horarios de partidos
 * en `deportes` SÍ son de ejemplo (marcados "por confirmar") porque no
 * existe forma de verificar el calendario deportivo real desde aquí:
 * antes de publicar, conectar con Dimayor / IMDER Sincelejo.
 *
 * CÓMO SE ACTIVA CADA ZONA (flujo QR):
 *   https://tu-dominio.com/?zona=1   → Sincelejo
 *   https://tu-dominio.com/?zona=2   → Golfo de Morrosquillo
 *   https://tu-dominio.com/?zona=3   → Montes de María
 * ------------------------------------------------------------------
 */

const ZONES = {
  "1": {
    id: "1",
    slug: "sincelejo",
    nombre: "Sincelejo",
    nombreCorto: "Sincelejo",
    apodo: "La Perla de la Sabana",
    descripcion:
      "La capital del departamento: corralejas, plaza de Majagual y la casa del fútbol y el béisbol sucreño.",
    colorAcento: "sol",
    coords: { lat: 9.3047, lng: -75.3978 },
    zoom: 14,
    fotoCredito: "Corralejas del 20 de enero, Sincelejo — Jesse96buelvas / Wikimedia Commons (CC BY-SA 4.0)",
    fotoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Corralejas%20del%2020%20de%20Enero%20en%20Sincelejo,%20Sucre,%20Colombia.jpg?width=1200",

    deportes: [
      {
        id: "d1-1",
        equipoLocal: "Águilas Doradas",
        equipoVisitante: "Por confirmar",
        deporte: "Fútbol · Dimayor",
        fecha: "2026-09-05",
        hora: "Por confirmar",
        estadio: "Estadio Arturo Cumplido Sierra",
        estadioCoords: { lat: 9.3082, lng: -75.3986 },
        destacado: true,
        nota: "Sede oficial de Águilas Doradas desde 2024. Fecha de ejemplo — verificar en Dimayor.",
      },
      {
        id: "d1-2",
        equipoLocal: "Toros de Sincelejo",
        equipoVisitante: "Por confirmar",
        deporte: "Béisbol profesional",
        fecha: "2026-09-12",
        hora: "Por confirmar",
        estadio: "Estadio Arturo Cumplido Sierra",
        estadioCoords: { lat: 9.3082, lng: -75.3986 },
        destacado: false,
        nota: "Liga Colombiana de Béisbol Profesional. Fecha de ejemplo — verificar calendario oficial.",
      },
    ],

    turismo: [
      {
        id: "t1-1",
        nombre: "Plaza de Majagual",
        descripcion: "El corazón histórico y comercial de Sincelejo: arquitectura republicana, cafés y punto de encuentro de la ciudad.",
        horario: "Todo el día",
        interes: "Alto",
        coords: { lat: 9.3033, lng: -75.3978 },
      },
      {
        id: "t1-2",
        nombre: "Corralejas del 20 de enero",
        descripcion: "La fiesta taurina más famosa del Caribe colombiano, con más de un siglo de historia y música de porros y fandangos.",
        horario: "Fiestas del 20 de enero (temporada)",
        interes: "Alto",
        coords: { lat: 9.3016, lng: -75.3963 },
      },
      {
        id: "t1-3",
        nombre: "Santuario de Fauna y Flora Los Colorados",
        descripcion: "Bosque seco tropical a las afueras de la ciudad, con senderos y avistamiento de aves — un respiro verde cerca de la capital.",
        horario: "8:00 – 16:00",
        interes: "Medio",
        coords: { lat: 9.3717, lng: -75.4453 },
      },
    ],

    comidaTipica: [
      {
        id: "c1-1",
        nombre: "Mote de queso",
        descripcion: "El plato insignia de Sucre: ñame cocido en un guiso espeso de suero costeño y queso, servido con arroz.",
      },
      {
        id: "c1-2",
        nombre: "Sancocho de gallina criolla",
        descripcion: "Sopa contundente de gallina, plátano, yuca y ñame, infaltable los domingos en la mesa sincelejana.",
      },
    ],

    restaurantes: [
      {
        id: "r1-1",
        nombre: "Fonda del Mote",
        tipo: "Restaurante",
        especialidad: "Mote de queso",
        coords: { lat: 9.3040, lng: -75.3960 },
      },
      {
        id: "r1-2",
        nombre: "Mercado de Majagual",
        tipo: "Mercado",
        especialidad: "Comida costeña de puesto",
        coords: { lat: 9.3038, lng: -75.3990 },
      },
    ],

    experiencias: [
      {
        titulo: "Partido + mote de queso",
        detalle: "Ver el partido en el Estadio Arturo Cumplido Sierra y cerrar la tarde con un mote de queso cerca de Majagual.",
      },
      {
        titulo: "Ruta corta por el centro",
        detalle: "Caminar la Plaza de Majagual antes del partido: a menos de 10 minutos del estadio.",
      },
    ],
  },

  "2": {
    id: "2",
    slug: "golfo-morrosquillo",
    nombre: "Golfo de Morrosquillo — Tolú y Coveñas",
    nombreCorto: "Golfo de Morrosquillo",
    apodo: "El Caribe de Sucre",
    descripcion:
      "Playas, malecón y la puerta de salida hacia las Islas de San Bernardo.",
    colorAcento: "mar",
    coords: { lat: 9.5138, lng: -75.5836 },
    zoom: 13,
    fotoCredito: "Playas de Santiago de Tolú, Sucre — Wikimedia Commons",
    fotoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Playas%20de%20Santiago%20de%20Tolu,%20Sucre.jpg?width=1200",

    deportes: [
      {
        id: "d2-1",
        equipoLocal: "Selección Sucre",
        equipoVisitante: "Por confirmar",
        deporte: "Fútbol playa",
        fecha: "2026-09-19",
        hora: "Por confirmar",
        estadio: "Cancha de playa — Malecón de Tolú",
        estadioCoords: { lat: 9.5147, lng: -75.5822 },
        destacado: true,
        nota: "Fecha de ejemplo — los torneos de playa se organizan por temporada.",
      },
    ],

    turismo: [
      {
        id: "t2-1",
        nombre: "Malecón de Santiago de Tolú",
        descripcion: "El paseo costero por excelencia: atardeceres sobre el golfo, artesanías y punto de salida de las lanchas a las islas.",
        horario: "Todo el día",
        interes: "Alto",
        coords: { lat: 9.5147, lng: -75.5822 },
      },
      {
        id: "t2-2",
        nombre: "Islas de San Bernardo",
        descripcion: "Archipiélago de aguas turquesa a una hora en lancha: Isla Múcura, Tintipán y el Islote de Santa Cruz, el más densamente poblado del mundo.",
        horario: "Tours de día completo",
        interes: "Alto",
        coords: { lat: 9.7817, lng: -75.8725 },
      },
      {
        id: "t2-3",
        nombre: "Playa Segunda Ensenada, Coveñas",
        descripcion: "Playa certificada con bandera azul por su sostenibilidad: aguas tranquilas ideales para nadar y palmeras a lo largo de la orilla.",
        horario: "Todo el día",
        interes: "Alto",
        coords: { lat: 9.4010, lng: -75.6810 },
      },
      {
        id: "t2-4",
        nombre: "Ciénaga La Caimanera",
        descripcion: "Ecosistema de manglar navegable en canoa, con casa flotante para probar ostras en medio del agua.",
        horario: "7:00 – 17:00",
        interes: "Medio",
        coords: { lat: 9.4450, lng: -75.6100 },
      },
    ],

    comidaTipica: [
      {
        id: "c2-1",
        nombre: "Arroz de lisa",
        descripcion: "Arroz costeño cocinado con lisa (pescado local) seca o fresca, un clásico de las mesas de Tolú y Coveñas.",
      },
      {
        id: "c2-2",
        nombre: "Pescado frito con patacón",
        descripcion: "Pargo o mojarra frito entero, servido con patacón, arroz de coco y ensalada — el plato de playa por excelencia.",
      },
      {
        id: "c2-3",
        nombre: "Cocadas",
        descripcion: "Dulce artesanal de coco que se vende a lo largo de todo el malecón, en versión blanca, de panela o de leche.",
      },
    ],

    restaurantes: [
      {
        id: "r2-1",
        nombre: "Marisquería del Malecón",
        tipo: "Restaurante",
        especialidad: "Arroz de lisa",
        coords: { lat: 9.5150, lng: -75.5828 },
      },
      {
        id: "r2-2",
        nombre: "Casa en el Agua",
        tipo: "Restaurante",
        especialidad: "Pescado fresco de las islas",
        coords: { lat: 9.7700, lng: -75.8600 },
      },
    ],

    experiencias: [
      {
        titulo: "Día de islas + arroz de lisa",
        detalle: "Tour a las Islas de San Bernardo por la mañana y cierre con arroz de lisa en el malecón al atardecer.",
      },
      {
        titulo: "Fútbol playa + cocadas",
        detalle: "Ver el partido de playa en el malecón y recorrer los puestos de cocadas de camino a Coveñas.",
      },
    ],
  },

  "3": {
    id: "3",
    slug: "montes-de-maria",
    nombre: "Montes de María — Ovejas y Colosó",
    nombreCorto: "Montes de María",
    apodo: "Tierra de gaitas",
    descripcion:
      "Serranía verde, música de gaitas y las quebradas más frescas del departamento.",
    colorAcento: "monte",
    coords: { lat: 9.5325, lng: -75.2306 },
    zoom: 12,
    fotoCredito: "Ovejas, Sucre — Wikimedia Commons",
    fotoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Ovejas-Sucre-Colombia.jpg?width=1200",

    deportes: [
      {
        id: "d3-1",
        equipoLocal: "Liga municipal de Ovejas",
        equipoVisitante: "Por confirmar",
        deporte: "Fútbol aficionado",
        fecha: "2026-09-26",
        hora: "Por confirmar",
        estadio: "Polideportivo de Ovejas",
        estadioCoords: { lat: 9.5322, lng: -75.2311 },
        destacado: true,
        nota: "Fecha de ejemplo — la liga municipal no publica calendario centralizado.",
      },
    ],

    turismo: [
      {
        id: "t3-1",
        nombre: "Festival Nacional de Gaitas de Ovejas",
        descripcion: "El festival más importante de música de gaitas del país, cada octubre, cuna de grandes gaiteros de la región.",
        horario: "Octubre (temporada de festival)",
        interes: "Alto",
        coords: { lat: 9.5325, lng: -75.2306 },
      },
      {
        id: "t3-2",
        nombre: "Salto del Sereno, Colosó",
        descripcion: "Cascada y pozo natural entre la vegetación de los Montes de María, ideal para nadar y refrescarse en un día de sol.",
        horario: "8:00 – 17:00",
        interes: "Alto",
        coords: { lat: 9.4917, lng: -75.3522 },
      },
      {
        id: "t3-3",
        nombre: "Casa Museo del Gaitero",
        descripcion: "Espacio dedicado a la historia de la gaita colombiana y sus intérpretes más reconocidos de Ovejas.",
        horario: "9:00 – 17:00",
        interes: "Medio",
        coords: { lat: 9.5330, lng: -75.2300 },
      },
    ],

    comidaTipica: [
      {
        id: "c3-1",
        nombre: "Mote de queso serrano",
        descripcion: "La misma receta insignia del departamento, con el ñame y el queso costeño de las fincas de la serranía.",
      },
      {
        id: "c3-2",
        nombre: "Bollo de mazorca",
        descripcion: "Masa de maíz tierno envuelta en hoja y cocida al vapor, dulce y suave, típica de las fiestas de la región.",
      },
    ],

    restaurantes: [
      {
        id: "r3-1",
        nombre: "Fonda La Gaita",
        tipo: "Restaurante",
        especialidad: "Mote de queso serrano",
        coords: { lat: 9.5328, lng: -75.2298 },
      },
      {
        id: "r3-2",
        nombre: "Mercado de Ovejas",
        tipo: "Mercado",
        especialidad: "Bollo de mazorca y frutas de la serranía",
        coords: { lat: 9.5335, lng: -75.2315 },
      },
    ],

    experiencias: [
      {
        titulo: "Gaitas + mote de queso",
        detalle: "Recorrer la Casa Museo del Gaitero y comer mote de queso serrano en la Fonda La Gaita.",
      },
      {
        titulo: "Salto del Sereno de refrescada",
        detalle: "Subir hasta Colosó para nadar en el Salto del Sereno antes de volver a Ovejas.",
      },
    ],
  },
};

// Categorías usadas para filtros y para colorear marcadores del mapa.
const CATEGORIES = {
  deporte: { label: "Deporte", colorVar: "--cat-deporte" },
  turismo: { label: "Turismo", colorVar: "--cat-turismo" },
  comida: { label: "Gastronomía", colorVar: "--cat-comida" },
};
