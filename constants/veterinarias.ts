export type TipoLugarMascota = 'clinica' | 'hospital' | 'publico' | 'petshop' | 'farmacia';

export interface LugarMascotas {
  id: string;
  nombre: string;
  tipo: TipoLugarMascota;
  direccion: string;
  telefono: string;
  horario: string;
  guardia24hs: boolean;
  servicios: string[];
  lat: number;
  lng: number;
  abiertoAhora?: boolean;
  distanceText?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
}

// Compatibilidad hacia atrás con referencias previas
export type Veterinaria = LugarMascotas;

export const DEFAULT_COORDINATES = {
  latitude: -34.4586,
  longitude: -58.9141,
  nombre: 'Pilar Centro, Buenos Aires',
};

export const PUNTOS_VETERINARIOS_PILAR: LugarMascotas[] = [
  {
    id: 'vet-1',
    nombre: 'Planeta Veterinario (Clínica e Internación)',
    tipo: 'clinica',
    direccion: 'San Martín 284, Pilar Centro',
    telefono: '011-6276-0994',
    horario: 'Lun a Vie 08:00 a 20:00 | Sáb 09:00 a 14:00',
    guardia24hs: false,
    servicios: ['Clínica', 'Internación', 'Cirugía', 'Ecografía'],
    lat: -34.4568,
    lng: -58.9161,
  },
  {
    id: 'vet-2',
    nombre: 'Hospital Veterinario San Roque (Guardia 24hs)',
    tipo: 'hospital',
    direccion: 'Av. Tratado del Pilar 280, Pilar',
    telefono: '0230-443-5566',
    horario: 'Guardia Médica 24 horas',
    guardia24hs: true,
    servicios: ['Guardia 24hs', 'Urgencias', 'Cirugía', 'Rayos X'],
    lat: -34.4532,
    lng: -58.9085,
  },
  {
    id: 'vet-3',
    nombre: 'Clínica Veterinaria Sivet',
    tipo: 'clinica',
    direccion: '11 de Septiembre 805 (esq. Alsina), Pilar',
    telefono: '0230-442-6013',
    horario: 'Lun a Sáb 09:00 a 19:00',
    guardia24hs: false,
    servicios: ['Clínica general', 'Vacunación', 'Cirugías'],
    lat: -34.4602,
    lng: -58.9112,
  },
  {
    id: 'vet-4',
    nombre: 'Centro Municipal de Zoonosis Pilar',
    tipo: 'publico',
    direccion: 'Tratado del Pilar y Colectora / Acceso Norte',
    telefono: '0230-427-7346',
    horario: 'Lun a Vie 08:00 a 15:00',
    guardia24hs: false,
    servicios: ['Castración gratuita', 'Vacunación antirrábica', 'Adopciones'],
    lat: -34.4485,
    lng: -58.8988,
  },
  {
    id: 'vet-5',
    nombre: 'Policlínica Veterinaria Pilar',
    tipo: 'clinica',
    direccion: 'Tucumán 34, Pilar Centro',
    telefono: '0230-443-1857',
    horario: 'Lun a Vie 09:00 a 18:30 | Sáb 09:00 a 13:00',
    guardia24hs: false,
    servicios: ['Consultas', 'Vacunación', 'Farmacia veterinaria'],
    lat: -34.4589,
    lng: -58.915,
  },
  {
    id: 'vet-6',
    nombre: 'Veterinaria Pilar',
    tipo: 'clinica',
    direccion: 'Ituzaingó 970, Pilar Centro',
    telefono: '0230-442-6723',
    horario: 'Lun a Sáb 09:00 a 17:00',
    guardia24hs: false,
    servicios: ['Clínica médica', 'Alimentos', 'Accesorios'],
    lat: -34.4575,
    lng: -58.9189,
  },
  {
    id: 'vet-7',
    nombre: 'Veterinaria Pilar Del Norte',
    tipo: 'clinica',
    direccion: 'Av. José E. Uriburu 844, Pilar',
    telefono: '0230-443-5559',
    horario: 'Lun a Sáb 10:00 a 18:00',
    guardia24hs: false,
    servicios: ['Clínica', 'Cirugía', 'Farmacia especializada'],
    lat: -34.4518,
    lng: -58.9095,
  },
  {
    id: 'vet-8',
    nombre: 'Veterinaria San Martín',
    tipo: 'clinica',
    direccion: 'San Martín 396, Pilar Centro',
    telefono: '0230-442-0199',
    horario: 'Lun a Sáb 09:00 a 13:00 y 16:30 a 20:00',
    guardia24hs: false,
    servicios: ['Consultorio', 'Farmacia', 'Alimentos balanceados'],
    lat: -34.4572,
    lng: -58.9174,
  },
  {
    id: 'vet-9',
    nombre: 'Veterinaria San Francisco de Asís',
    tipo: 'clinica',
    direccion: 'Av. Víctor Castro 1045, Pilar',
    telefono: '0230-443-0820',
    horario: 'Lun a Vie 09:00 a 18:00',
    guardia24hs: false,
    servicios: ['Atención clínica', 'Planes de vacunación'],
    lat: -34.4628,
    lng: -58.923,
  },
  {
    id: 'vet-10',
    nombre: 'Veterinaria Sigma Champagnat',
    tipo: 'clinica',
    direccion: 'Paseo Champagnat, Ramal Pilar Km 54.5',
    telefono: '0230-437-4433',
    horario: 'Lun a Dom 10:00 a 20:00',
    guardia24hs: false,
    servicios: ['Clínica', 'Pet Shop', 'Peluquería canina'],
    lat: -34.4442,
    lng: -58.9056,
  },
  {
    id: 'vet-11',
    nombre: 'Puppis Paseo Champagnat',
    tipo: 'petshop',
    direccion: 'Panamericana Km 54.5 (Paseo Champagnat)',
    telefono: '0810-122-7877',
    horario: 'Lun a Dom 10:00 a 21:00',
    guardia24hs: false,
    servicios: ['Pet Shop', 'Farmacia', 'Alimentos premium', 'Peluquería'],
    lat: -34.4438,
    lng: -58.9062,
  },
  {
    id: 'vet-12',
    nombre: 'Forrajería y Pet Shop El Fortín',
    tipo: 'petshop',
    direccion: 'Hipólito Yrigoyen 412, Pilar Centro',
    telefono: '0230-442-8811',
    horario: 'Lun a Sáb 08:30 a 19:30',
    guardia24hs: false,
    servicios: ['Alimentos por mayor/menor', 'Snacks', 'Accesorios'],
    lat: -34.4592,
    lng: -58.9135,
  },
  {
    id: 'vet-13',
    nombre: 'Mundo Mascota Pilar',
    tipo: 'petshop',
    direccion: 'Lorenzo López 630, Pilar Centro',
    telefono: '0230-443-4410',
    horario: 'Lun a Sáb 09:00 a 19:30',
    guardia24hs: false,
    servicios: ['Accesorios', 'Camas', 'Juguetes', 'Pipetas y antiparasitarios'],
    lat: -34.4582,
    lng: -58.9149,
  },
  {
    id: 'vet-14',
    nombre: 'Pet Shop La Huella',
    tipo: 'petshop',
    direccion: 'Víctor Vergani 715, Pilar Centro',
    telefono: '0230-466-2290',
    horario: 'Lun a Sáb 09:00 a 18:30',
    guardia24hs: false,
    servicios: ['Alimentos para perros y gatos', 'Peluquería canina'],
    lat: -34.456,
    lng: -58.9125,
  },
  {
    id: 'vet-15',
    nombre: 'Distribuidora & Farmacia Veterinaria Norte',
    tipo: 'farmacia',
    direccion: 'Ruta 8 Km 51.5 (esq. Tratado del Pilar)',
    telefono: '0230-442-9905',
    horario: 'Lun a Vie 08:30 a 18:00 | Sáb 09:00 a 13:00',
    guardia24hs: false,
    servicios: ['Medicamentos', 'Antibióticos', 'Suplementos', 'Insumos clínicos'],
    lat: -34.4498,
    lng: -58.9022,
  },
];

// Alias para compatibilidad con código anterior
export const VETERINARIAS_PILAR = PUNTOS_VETERINARIOS_PILAR;

/**
 * Calcula la distancia en kilómetros entre dos coordenadas geográficas usando la fórmula del semiverseno (Haversine).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
