import {
  LugarMascotas,
  PUNTOS_VETERINARIOS_PILAR,
  Veterinaria,
} from '@/constants/veterinarias';

/**
 * Obtiene la lista completa de lugares y servicios para mascotas de Pilar Centro
 * de forma directa y local (clínicas, hospitales, zoonosis, pet shops y farmacias),
 * desacoplada de APIs externas para garantizar disponibilidad total sin timeouts ni errores 502.
 */
export async function buscarVeterinariasCercanas(
  _lat?: number,
  _lng?: number,
  _radiusMetros?: number
): Promise<LugarMascotas[]> {
  return PUNTOS_VETERINARIOS_PILAR;
}

export type { LugarMascotas, Veterinaria };
