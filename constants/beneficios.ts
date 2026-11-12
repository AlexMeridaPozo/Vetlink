export type TipoBeneficio = 'pelu' | 'pet' | 'vet';

export type CategoriaFiltro = 'Todos' | 'Peluquería' | 'Petshops' | 'Veterinarias';

export interface Beneficio {
  id: string;
  lugarId: string; // ID vinculado a PUNTOS_VETERINARIOS_PILAR en constants/veterinarias.ts
  comercio: string;
  tipo: TipoBeneficio;
  descuento: string;
  titulo: string;
  validez: string;
  distancia: string;
  direccion: string;
  telefono: string;
  codigo: string;
  condiciones: string[];
  destacado?: boolean;
}

export const BENEFICIOS_THEME = {
  bg: '#0A0C0B',
  surface: '#141816',
  ink: '#F2F7F3',
  muted: '#98A59C',
  g: '#19D45A',
  gs: '#0F2E1C',
  line: '#1F5A36',
  onG: '#04140A',
  tagBg: '#3A3210',
  tagFg: '#FFD94D',
  h1: '#0F5A2C',
  h2: '#08371B',
} as const;

export const CATEGORIAS_FILTRO: CategoriaFiltro[] = [
  'Todos',
  'Peluquería',
  'Petshops',
  'Veterinarias',
];

/**
 * Cupones y beneficios 100% reales vinculados a los comercios y veterinarias
 * registradas en el mapa interactivo de Pilar Centro y alrededores.
 */
export const BENEFICIOS_MOCK: Beneficio[] = [
  {
    id: 'sigma-champagnat',
    lugarId: 'vet-10',
    comercio: 'Veterinaria Sigma Champagnat',
    tipo: 'pelu',
    descuento: '20% OFF',
    titulo: 'Baño, deslanado y corte de pelo canino',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 1,8 km',
    direccion: 'Paseo Champagnat, Ramal Pilar Km 54.5',
    telefono: '0230-437-4433',
    codigo: 'SIGMA20',
    condiciones: [
      'Válido de lunes a viernes con turno previo',
      'Aplica a caninos de todos los tamaños',
      'Presentando cupón o chapita inteligente Huellapp',
    ],
    destacado: true,
  },
  {
    id: 'puppis-alimentos',
    lugarId: 'vet-11',
    comercio: 'Puppis Paseo Champagnat',
    tipo: 'pet',
    descuento: '25% OFF',
    titulo: 'Alimentos premium y accesorios seleccionados',
    validez: 'Hasta 15/12/2026',
    distancia: 'A 1,9 km',
    direccion: 'Panamericana Km 54.5 (Paseo Champagnat)',
    telefono: '0810-122-7877',
    codigo: 'PUPPIS25',
    condiciones: [
      'Válido en sucursal Paseo Champagnat',
      'Hasta 2 bolsas de alimento por compra',
      'No acumulable con otras promociones',
    ],
  },
  {
    id: 'planeta-consulta',
    lugarId: 'vet-1',
    comercio: 'Planeta Veterinario',
    tipo: 'vet',
    descuento: 'Sin cargo',
    titulo: 'Primera consulta clínica para nuevas mascotas',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 250 m',
    direccion: 'San Martín 284, Pilar Centro',
    telefono: '011-6276-0994',
    codigo: 'PLANETAFREE',
    condiciones: [
      'Válido para mascotas registradas en Huellapp',
      'Una consulta sin cargo por animal registrado',
      'Con turno previo asignado',
    ],
  },
  {
    id: 'la-huella-pelu',
    lugarId: 'vet-14',
    comercio: 'Pet Shop La Huella',
    tipo: 'pelu',
    descuento: '15% OFF',
    titulo: 'Baño higiénico, secado y corte de uñas',
    validez: 'Hasta 30/11/2026',
    distancia: 'A 450 m',
    direccion: 'Víctor Vergani 715, Pilar Centro',
    telefono: '0230-466-2290',
    codigo: 'HUELLA15',
    condiciones: [
      'Válido de lunes a sábados de 09:00 a 18:00',
      'Turnos por WhatsApp al 0230-466-2290',
    ],
  },
  {
    id: 'mundo-mascota-accesorios',
    lugarId: 'vet-13',
    comercio: 'Mundo Mascota Pilar',
    tipo: 'pet',
    descuento: '20% OFF',
    titulo: 'Camas térmicas, correas y juguetes interactivos',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 350 m',
    direccion: 'Lorenzo López 630, Pilar Centro',
    telefono: '0230-443-4410',
    codigo: 'MUNDOPET20',
    condiciones: [
      'Válido para compras presenciales en el local',
      'Aplica sobre precio de lista en artículos seleccionados',
    ],
  },
  {
    id: 'sivet-vacunacion',
    lugarId: 'vet-3',
    comercio: 'Clínica Veterinaria Sivet',
    tipo: 'vet',
    descuento: '20% OFF',
    titulo: 'Plan anual de vacunación y desparasitación',
    validez: 'Hasta 28/02/2027',
    distancia: 'A 600 m',
    direccion: '11 de Septiembre 805 (esq. Alsina), Pilar',
    telefono: '0230-442-6013',
    codigo: 'SIVET20',
    condiciones: [
      'Incluye vacuna quíntuple/séxtuple y antirrábica',
      'Lunes a sábados con turno médico previo',
    ],
  },
  {
    id: 'el-fortin-snacks',
    lugarId: 'vet-12',
    comercio: 'Pet Shop El Fortín',
    tipo: 'pet',
    descuento: '15% OFF',
    titulo: 'Snacks naturales, golosinas y pipetas antipulgas',
    validez: 'Hasta 15/12/2026',
    distancia: 'A 500 m',
    direccion: 'Hipólito Yrigoyen 412, Pilar Centro',
    telefono: '0230-442-8811',
    codigo: 'FORTIN15',
    condiciones: [
      'Aplica a pagos en efectivo y transferencia',
      'Válido en sucursal Yrigoyen 412',
    ],
  },
  {
    id: 'san-roque-estudios',
    lugarId: 'vet-2',
    comercio: 'Hospital Veterinario San Roque (24hs)',
    tipo: 'vet',
    descuento: '15% OFF',
    titulo: 'Ecografía y diagnóstico por imágenes',
    validez: 'Hasta 31/01/2027',
    distancia: 'A 800 m',
    direccion: 'Av. Tratado del Pilar 280, Pilar',
    telefono: '0230-443-5566',
    codigo: 'SANROQUE15',
    condiciones: [
      'Válido con orden médica veterinaria',
      'Servicio de guardia médica 24 horas activo',
    ],
  },
  {
    id: 'farmacia-norte-pipetas',
    lugarId: 'vet-15',
    comercio: 'Farmacia Veterinaria Norte',
    tipo: 'pet',
    descuento: '10% OFF',
    titulo: 'Collares antiparasitarios y suplementos vitamínicos',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 1,4 km',
    direccion: 'Ruta 8 Km 51.5 (esq. Tratado del Pilar)',
    telefono: '0230-442-9905',
    codigo: 'FARMANORTE10',
    condiciones: [
      'Válido en mostrador presentando la app',
      'No acumulable con promociones de laboratorio',
    ],
  },
];
