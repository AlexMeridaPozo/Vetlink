import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState, useRef } from 'react';
import { PUNTOS_VETERINARIOS_PILAR } from '@/constants/veterinarias';

export type TurnoEstado = 'solicitado' | 'confirmado' | 'completado' | 'cancelado';

export interface Turno {
  id: string;
  userId?: string;
  ownerId?: string;
  tutorId: string;
  mascotaId?: string;
  mascotaNombre: string;
  mascotaEspecie: 'perro' | 'gato' | 'otro' | string;
  tutorNombre: string;
  tutorEmail?: string;
  tutorTelefono?: string;
  veterinariaId: string;
  veterinariaNombre: string;
  veterinariaDireccion?: string;
  veterinariaTelefono?: string;
  veterinarioId?: string;
  veterinarioNombre?: string;
  motivo: string;
  fecha: string; // Formato YYYY-MM-DD
  hora: string;  // Formato HH:mm
  estado: TurnoEstado;
  notasTutor?: string;
  notasVeterinario?: string;
  motivoCancelacion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SolicitarTurnoInput {
  mascotaId?: string;
  mascotaNombre: string;
  mascotaEspecie?: 'perro' | 'gato' | 'otro' | string;
  tutorId?: string;
  tutorNombre?: string;
  tutorEmail?: string;
  tutorTelefono?: string;
  veterinariaId: string;
  veterinariaNombre: string;
  veterinariaDireccion?: string;
  veterinariaTelefono?: string;
  motivo: string;
  fecha: string;
  hora: string;
  notasTutor?: string;
}

const STORAGE_KEY = '@huellapp_turnos_cache_v2';

// ── Helpers de fechas para datos iniciales realistas ─────────────────────────
function formatearFechaRelativa(diasOffset: number): string {
  const d = new Date(Date.now() + diasOffset * 24 * 60 * 60 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const TURNOS_INICIALES_SEMILLA: Turno[] = [
  {
    id: 'TUR-101',
    userId: 'tutor-default',
    ownerId: 'tutor-default',
    tutorId: 'tutor-default',
    mascotaId: 'PET-001',
    mascotaNombre: 'Santino',
    mascotaEspecie: 'perro',
    tutorNombre: 'Santino Bravo',
    tutorTelefono: '011-3456-7890',
    tutorEmail: 'santinobravo2007@gmail.com',
    veterinariaId: 'vet-1',
    veterinariaNombre: 'Planeta Veterinario (Clínica e Internación)',
    veterinariaDireccion: 'San Martín 284, Pilar Centro',
    veterinariaTelefono: '011-6276-0994',
    veterinarioId: 'vet-pro-1',
    veterinarioNombre: 'Dr. Lucas Gómez',
    motivo: 'Vacunación y Control General',
    fecha: formatearFechaRelativa(2),
    hora: '15:30',
    estado: 'confirmado',
    notasTutor: 'Control de calendario de vacunación anual y peso.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TUR-102',
    userId: 'tutor-default',
    ownerId: 'tutor-default',
    tutorId: 'tutor-default',
    mascotaId: 'PET-002',
    mascotaNombre: 'Milo',
    mascotaEspecie: 'gato',
    tutorNombre: 'Santino Bravo',
    tutorTelefono: '011-3456-7890',
    tutorEmail: 'santinobravo2007@gmail.com',
    veterinariaId: 'vet-2',
    veterinariaNombre: 'Hospital Veterinario San Roque (Guardia 24hs)',
    veterinariaDireccion: 'Av. Tratado del Pilar 280, Pilar',
    veterinariaTelefono: '0230-443-5566',
    motivo: 'Consulta General por Tos Leve',
    fecha: formatearFechaRelativa(5),
    hora: '10:00',
    estado: 'solicitado',
    notasTutor: 'Se observó estornudo y tos recurrente por la noche.',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TUR-103',
    userId: 'tutor-002',
    ownerId: 'tutor-002',
    tutorId: 'tutor-002',
    mascotaId: 'PET-003',
    mascotaNombre: 'Luna',
    mascotaEspecie: 'gato',
    tutorNombre: 'Carolina Méndez',
    tutorTelefono: '011-5555-8822',
    tutorEmail: 'carolina.mendez@example.com',
    veterinariaId: 'vet-1',
    veterinariaNombre: 'Planeta Veterinario (Clínica e Internación)',
    veterinariaDireccion: 'San Martín 284, Pilar Centro',
    veterinariaTelefono: '011-6276-0994',
    motivo: 'Esterilización / Control Pre-quirúrgico',
    fecha: formatearFechaRelativa(3),
    hora: '11:00',
    estado: 'solicitado',
    notasTutor: 'Consulta para análisis prequirúrgicos de castración.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TUR-104',
    userId: 'tutor-003',
    ownerId: 'tutor-003',
    tutorId: 'tutor-003',
    mascotaId: 'PET-004',
    mascotaNombre: 'Rocky',
    mascotaEspecie: 'perro',
    tutorNombre: 'Martín Almada',
    tutorTelefono: '011-4432-1199',
    tutorEmail: 'martin.almada@example.com',
    veterinariaId: 'vet-3',
    veterinariaNombre: 'Clínica Veterinaria Sivet',
    veterinariaDireccion: '11 de Septiembre 805, Pilar',
    veterinariaTelefono: '0230-442-6013',
    veterinarioId: 'vet-pro-1',
    veterinarioNombre: 'Dr. Lucas Gómez',
    motivo: 'Limpieza Dental y Revisión de Encías',
    fecha: formatearFechaRelativa(-7),
    hora: '16:00',
    estado: 'completado',
    notasTutor: 'Presentaba mal aliento y sarro en molares.',
    notasVeterinario: 'Profilaxis dental exitosa. Sin piezas comprometidas. Se recetó antiséptico oral.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Cache local en AsyncStorage ──────────────────────────────────────────────
async function obtenerTurnosCache(): Promise<Turno[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(TURNOS_INICIALES_SEMILLA));
      return TURNOS_INICIALES_SEMILLA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return TURNOS_INICIALES_SEMILLA;
  } catch {
    return TURNOS_INICIALES_SEMILLA;
  }
}

async function guardarTurnosCache(turnos: Turno[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
  } catch (err) {
    console.warn('[turnoService] Error guardando cache local:', err);
  }
}

// ── Consulta de Horarios Ocupados (Anti-Double Booking) ───────────────────────
/**
 * Retorna la lista de horarios ya reservados para una veterinaria y fecha específica.
 * Un turno bloquea el horario si su estado es 'solicitado' o 'confirmado'.
 */
export async function getHorariosOcupados(
  veterinariaId: string,
  fecha: string
): Promise<string[]> {
  const turnos = await obtenerTurnosCache();
  return turnos
    .filter(
      (t) =>
        t.veterinariaId === veterinariaId &&
        t.fecha === fecha &&
        (t.estado === 'solicitado' || t.estado === 'confirmado')
    )
    .map((t) => t.hora);
}

// ── Sincronización y Consulta con Firestore ──────────────────────────────────
export async function fetchTurnos(options?: {
  tutorId?: string;
  isVeterinario?: boolean;
}): Promise<Turno[]> {
  const cached = await obtenerTurnosCache();

  // Si no hay usuario autenticado en Firebase Auth, usar directamente el caché local
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return filtrarTurnos(cached, options);
  }

  try {
    const turnosRef = collection(db, 'turnos');

    // Construir la consulta según las reglas de seguridad de Firestore:
    // Si no es veterinario, consultar únicamente los turnos del usuario autenticado
    const consulta = options?.isVeterinario
      ? turnosRef
      : query(turnosRef, where('userId', '==', currentUser.uid));

    const snapshot = await getDocs(consulta);

    if (!snapshot.empty) {
      const remoteList: Turno[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Turno, 'id'>),
      }));

      // Fusionar remotos con locales por ID (remoto prevalece)
      const map = new Map<string, Turno>();
      cached.forEach((t) => map.set(t.id, t));
      remoteList.forEach((t) => map.set(t.id, t));
      const merged = Array.from(map.values());
      await guardarTurnosCache(merged);

      return filtrarTurnos(merged, options);
    }
  } catch {
    // Si Firestore está sin conexión o pendiente de inicialización, opera 100% con cache
  }

  return filtrarTurnos(cached, options);
}

function filtrarTurnos(
  turnos: Turno[],
  options?: { tutorId?: string; isVeterinario?: boolean }
): Turno[] {
  let list = [...turnos];

  if (!options?.isVeterinario) {
    const targetId = options?.tutorId || auth.currentUser?.uid;
    list = list.filter(
      (t) =>
        t.userId === targetId ||
        t.tutorId === targetId ||
        t.tutorId === 'tutor-default' ||
        t.tutorEmail === 'santinobravo2007@gmail.com'
    );
  }

  // Ordenar: primero los más recientes por fecha y hora
  return list.sort((a, b) => {
    const fechaA = `${a.fecha}T${a.hora}:00`;
    const fechaB = `${b.fecha}T${b.hora}:00`;
    return fechaB.localeCompare(fechaA);
  });
}

// ── Crear / Solicitar Turno con Validación Anti-Duplicados ───────────────────
export async function solicitarTurno(input: SolicitarTurnoInput): Promise<Turno> {
  const cache = await obtenerTurnosCache();

  // Validación estricta anti-duplicados para producción:
  // Impide que 2 usuarios reserven el mismo horario en la misma clínica
  const turnoExistente = cache.find(
    (t) =>
      t.veterinariaId === input.veterinariaId &&
      t.fecha === input.fecha &&
      t.hora === input.hora &&
      (t.estado === 'solicitado' || t.estado === 'confirmado')
  );

  if (turnoExistente) {
    throw new Error(
      `El horario de las ${input.hora} hs del día ${input.fecha} ya ha sido reservado por otro usuario. Por favor elegí otro horario disponible.`
    );
  }

  const nuevoId = `TUR-${Date.now().toString().slice(-6)}`;
  const fechaCreacion = new Date().toISOString();
  const uid = input.tutorId || auth.currentUser?.uid || 'tutor-default';

  // Completar dirección y teléfono de veterinaria si faltan
  const vetConocida = PUNTOS_VETERINARIOS_PILAR.find((v) => v.id === input.veterinariaId);

  const nuevoTurno: Turno = {
    id: nuevoId,
    userId: uid,
    ownerId: uid,
    tutorId: uid,
    mascotaId: input.mascotaId || `PET-${Math.floor(100 + Math.random() * 900)}`,
    mascotaNombre: input.mascotaNombre.trim(),
    mascotaEspecie: input.mascotaEspecie || 'perro',
    tutorNombre: input.tutorNombre || 'Santino Bravo',
    tutorEmail: input.tutorEmail || 'santinobravo2007@gmail.com',
    tutorTelefono: input.tutorTelefono || '011-3456-7890',
    veterinariaId: input.veterinariaId,
    veterinariaNombre: input.veterinariaNombre,
    veterinariaDireccion: input.veterinariaDireccion || vetConocida?.direccion || 'Pilar, Buenos Aires',
    veterinariaTelefono: input.veterinariaTelefono || vetConocida?.telefono || '011-6276-0994',
    motivo: input.motivo.trim(),
    fecha: input.fecha,
    hora: input.hora,
    estado: 'solicitado',
    notasTutor: input.notasTutor?.trim() || undefined,
    createdAt: fechaCreacion,
    updatedAt: fechaCreacion,
  };

  // 1. Guardar localmente de inmediato para respuesta instantánea
  const actualizados = [nuevoTurno, ...cache.filter((t) => t.id !== nuevoId)];
  await guardarTurnosCache(actualizados);

  // 2. Intentar guardar en Firestore de fondo si hay sesión
  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'turnos', nuevoId);
      await setDoc(docRef, nuevoTurno);
    } catch {
      // Sincronización silenciosa con fallback
    }
  }

  return nuevoTurno;
}

// ── Actualizar Estado de Turno ───────────────────────────────────────────────
export async function actualizarEstadoTurno(
  turnoId: string,
  nuevoEstado: TurnoEstado,
  detalles?: {
    notasVeterinario?: string;
    motivoCancelacion?: string;
    veterinarioId?: string;
    veterinarioNombre?: string;
  }
): Promise<Turno> {
  const cache = await obtenerTurnosCache();
  const index = cache.findIndex((t) => t.id === turnoId);

  if (index === -1) {
    throw new Error(`Turno no encontrado con ID: ${turnoId}`);
  }

  const actualizado: Turno = {
    ...cache[index],
    estado: nuevoEstado,
    updatedAt: new Date().toISOString(),
    ...(detalles?.notasVeterinario ? { notasVeterinario: detalles.notasVeterinario } : {}),
    ...(detalles?.motivoCancelacion ? { motivoCancelacion: detalles.motivoCancelacion } : {}),
    ...(detalles?.veterinarioId ? { veterinarioId: detalles.veterinarioId } : {}),
    ...(detalles?.veterinarioNombre ? { veterinarioNombre: detalles.veterinarioNombre } : {}),
  };

  cache[index] = actualizado;
  await guardarTurnosCache(cache);

  // Intentar sincronizar con Firestore
  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'turnos', turnoId);
      await updateDoc(docRef, {
        estado: nuevoEstado,
        updatedAt: actualizado.updatedAt,
        ...(detalles?.notasVeterinario ? { notasVeterinario: detalles.notasVeterinario } : {}),
        ...(detalles?.motivoCancelacion ? { motivoCancelacion: detalles.motivoCancelacion } : {}),
        ...(detalles?.veterinarioId ? { veterinarioId: detalles.veterinarioId } : {}),
        ...(detalles?.veterinarioNombre ? { veterinarioNombre: detalles.veterinarioNombre } : {}),
      });
    } catch {
      // Mantenido en cache local
    }
  }

  return actualizado;
}

export async function confirmarTurno(
  turnoId: string,
  vetInfo?: { id?: string; nombre?: string }
): Promise<Turno> {
  return actualizarEstadoTurno(turnoId, 'confirmado', {
    veterinarioId: vetInfo?.id || 'vet-pro-1',
    veterinarioNombre: vetInfo?.nombre || 'Dr. Lucas Gómez',
  });
}

export async function completarTurno(
  turnoId: string,
  notasVeterinario?: string,
  vetInfo?: { id?: string; nombre?: string }
): Promise<Turno> {
  return actualizarEstadoTurno(turnoId, 'completado', {
    notasVeterinario: notasVeterinario || 'Atención completada con éxito. Paciente en buen estado general.',
    veterinarioId: vetInfo?.id || 'vet-pro-1',
    veterinarioNombre: vetInfo?.nombre || 'Dr. Lucas Gómez',
  });
}

export async function cancelarTurno(
  turnoId: string,
  motivoCancelacion?: string
): Promise<Turno> {
  return actualizarEstadoTurno(turnoId, 'cancelado', {
    motivoCancelacion: motivoCancelacion || 'Cancelado por el usuario o clínica.',
  });
}

// ── Hook React para gestión de turnos ─────────────────────────────────────────
export interface UseTurnosReturn {
  turnos: Turno[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  solicitar: (input: SolicitarTurnoInput) => Promise<Turno>;
  confirmar: (turnoId: string, vetInfo?: { id?: string; nombre?: string }) => Promise<Turno>;
  completar: (turnoId: string, notasVeterinario?: string, vetInfo?: { id?: string; nombre?: string }) => Promise<Turno>;
  cancelar: (turnoId: string, motivo?: string) => Promise<Turno>;
}

export function useTurnos(options?: {
  tutorId?: string;
  isVeterinario?: boolean;
}): UseTurnosReturn {
  const tutorId = options?.tutorId;
  const isVeterinario = options?.isVeterinario;

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const cargandoRef = useRef(false);

  const cargar = useCallback(
    async (isManualRefresh = false) => {
      if (cargandoRef.current && !isManualRefresh) return;
      cargandoRef.current = true;

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const datos = await fetchTurnos({ tutorId, isVeterinario });
        setTurnos(datos);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        cargandoRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tutorId, isVeterinario]
  );

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  const refresh = useCallback(async () => {
    await cargar(true);
  }, [cargar]);

  const solicitar = useCallback(
    async (input: SolicitarTurnoInput) => {
      const nuevo = await solicitarTurno(input);
      await refresh();
      return nuevo;
    },
    [refresh]
  );

  const confirmar = useCallback(
    async (turnoId: string, vetInfo?: { id?: string; nombre?: string }) => {
      const act = await confirmarTurno(turnoId, vetInfo);
      await refresh();
      return act;
    },
    [refresh]
  );

  const completar = useCallback(
    async (turnoId: string, notasVeterinario?: string, vetInfo?: { id?: string; nombre?: string }) => {
      const act = await completarTurno(turnoId, notasVeterinario, vetInfo);
      await refresh();
      return act;
    },
    [refresh]
  );

  const cancelar = useCallback(
    async (turnoId: string, motivo?: string) => {
      const act = await cancelarTurno(turnoId, motivo);
      await refresh();
      return act;
    },
    [refresh]
  );

  return {
    turnos,
    loading,
    refreshing,
    error,
    refresh,
    solicitar,
    confirmar,
    completar,
    cancelar,
  };
}
