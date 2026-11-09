export type TipoBeneficio = 'pelu' | 'pet' | 'vet';

export type CategoriaFiltro = 'Todos' | 'Peluquería' | 'Petshops' | 'Veterinarias';

export interface Beneficio {
  id: string;
  comercio: string;
  tipo: TipoBeneficio;
  descuento: string;
  titulo: string;
  validez: string;
  distancia: string;
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

export const BENEFICIOS_MOCK: Beneficio[] = [
  {
    id: 'pelusa',
    comercio: 'Peluquería Canina Pelusa',
    tipo: 'pelu',
    descuento: '20% OFF',
    titulo: 'Corte de pelo y baño',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 1,2 km',
    codigo: 'PELUSA20',
    condiciones: [
      'Válido de lunes a viernes',
      'Con turno previo',
      'No acumulable con otras promociones',
    ],
    destacado: true,
  },
  {
    id: 'colitas',
    comercio: 'Pet Spa Colitas',
    tipo: 'pelu',
    descuento: '15% OFF',
    titulo: 'Baño y deslanado para perros de todos los tamaños',
    validez: 'Hasta 30/11/2026',
    distancia: 'A 2,8 km',
    codigo: 'COLITAS15',
    condiciones: [
      'Válido todos los días',
      'Presentando el perfil de HuellApp',
    ],
  },
  {
    id: 'mundo-animal',
    comercio: 'PetShop Mundo Animal',
    tipo: 'pet',
    descuento: '20% OFF',
    titulo: 'Alimentos seleccionados para perros y gatos',
    validez: 'Hasta 15/12/2026',
    distancia: 'A 0,9 km',
    codigo: 'MUNDO20',
    condiciones: [
      'Solo en local',
      'Hasta 2 bolsas por compra',
    ],
  },
  {
    id: 'huellitas',
    comercio: 'Huellitas Accesorios',
    tipo: 'pet',
    descuento: '10% OFF',
    titulo: 'Camas, juguetes y paseo',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 3,4 km',
    codigo: 'HUELLITAS10',
    condiciones: [
      'Sobre precio de lista',
      'No incluye productos en oferta',
    ],
  },
  {
    id: 'patitas',
    comercio: 'Veterinaria Patitas',
    tipo: 'vet',
    descuento: 'Sin cargo',
    titulo: 'Primera consulta general',
    validez: 'Hasta 31/12/2026',
    distancia: 'A 1,6 km',
    codigo: 'PATITAS1RA',
    condiciones: [
      'Una vez por mascota',
      'Con turno previo',
    ],
  },
  {
    id: 'clinica-animal',
    comercio: 'Clínica Animal',
    tipo: 'vet',
    descuento: '15% OFF',
    titulo: 'Vacunación y control de salud anual',
    validez: 'Hasta 28/02/2027',
    distancia: 'A 2,1 km',
    codigo: 'CLINICA15',
    condiciones: [
      'Incluye vacuna antirrábica',
      'Lunes a sábados',
    ],
  },
];
