import { db } from '@/config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  programarNotificacionRecordatorio,
  cancelarNotificacionRecordatorio,
} from './notificationService';

// ── Tipos y Modelos ────────────────────────────────────────────────────────────

export interface Recordatorio {
  id: string; // ID único (ej: REC-1718000000-XYZ)
  userId: string; // ID del usuario destinatario (propietario)
  userName: string; // Nombre del usuario destinatario
  userEmail: string; // Email del usuario destinatario
  titulo: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  fechaCompleta: string; // ISO 8601 string
  veterinarioId: string; // UID del profesional veterinario
  veterinarioNombre: string; // Nombre del profesional veterinario
  notificationId?: string | null; // ID devuelto por expo-notifications
  createdAt: string;
  updatedAt?: string;
}

export interface UsuarioDestinatario {
  uid: string;
  displayName: string;
  email: string;
  rol?: string;
}

export interface NuevoRecordatorioInput {
  userId: string;
  userName: string;
  userEmail: string;
  titulo: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  veterinarioId: string;
  veterinarioNombre: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Calcula el tiempo restante o vencimiento de una fecha dada
 */
export function calcularTiempoRestante(fechaISO: string): {
  dias: number;
  esHoy: boolean;
  esVencido: boolean;
  texto: string;
} {
  try {
    const target = new Date(fechaISO);
    const now = new Date();

    if (isNaN(target.getTime())) {
      return { dias: 0, esHoy: false, esVencido: false, texto: 'Fecha a confirmar' };
    }

    const diffMs = target.getTime() - now.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const isSameDay =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate();

    if (isSameDay) {
      return { dias: 0, esHoy: true, esVencido: false, texto: 'Hoy' };
    }

    if (diffMs < 0) {
      const diasVencido = Math.abs(diffDias);
      return {
        dias: -diasVencido,
        esHoy: false,
        esVencido: true,
        texto: diasVencido <= 1 ? 'Vencido ayer' : `Vencido hace ${diasVencido} días`,
      };
    }

    if (diffDias === 1) {
      return { dias: 1, esHoy: false, esVencido: false, texto: 'Mañana' };
    }

    return { dias: diffDias, esHoy: false, esVencido: false, texto: `En ${diffDias} días` };
  } catch {
    return { dias: 0, esHoy: false, esVencido: false, texto: 'Pendiente' };
  }
}

/**
 * Obtiene la lista de usuarios registrados para que el veterinario seleccione el destinatario
 */
export async function getUsuariosDestinatarios(): Promise<UsuarioDestinatario[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UsuarioDestinatario[] = [];

    snap.docs.forEach((d) => {
      const data = d.data();
      list.push({
        uid: d.id,
        displayName: data.displayName || data.nombre || data.email || 'Usuario',
        email: data.email || '',
        rol: data.rol || 'propietario',
      });
    });

    return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.warn('[ReminderService] Error cargando usuarios destinatarios:', error);
    return [];
  }
}

// ── Métodos Principales US09 ───────────────────────────────────────────────────

/**
 * Crea y programa un nuevo recordatorio automático
 * Criterio de aceptación: Solo el perfil de veterinario puede crear recordatorios.
 */
export async function crearRecordatorio(
  datos: NuevoRecordatorioInput,
  isVeterinario: boolean
): Promise<Recordatorio> {
  // Validación estricta de rol
  if (!isVeterinario) {
    throw new Error(
      'Acceso denegado: Solo los usuarios con perfil de Veterinario autorizado pueden programar recordatorios sanitarios.'
    );
  }

  // Validaciones de campos obligatorios
  if (!datos.userId || !datos.userEmail) {
    throw new Error('Debe asociar el recordatorio a un usuario destinatario válido.');
  }

  if (!datos.titulo || datos.titulo.trim().length === 0) {
    throw new Error('El título del recordatorio es obligatorio.');
  }

  if (!datos.fecha || !datos.hora) {
    throw new Error('La fecha y hora del recordatorio son obligatorias.');
  }

  // Validar formato y fecha futura
  const [yearStr, monthStr, dayStr] = datos.fecha.split('-');
  const [hourStr, minStr] = datos.hora.split(':');
  const targetDate = new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10),
    parseInt(hourStr, 10),
    parseInt(minStr, 10)
  );

  if (isNaN(targetDate.getTime())) {
    throw new Error('La fecha u hora ingresada no es válida.');
  }

  if (targetDate.getTime() <= Date.now()) {
    throw new Error('La fecha y hora deben ser futuras para poder programar un aviso automático.');
  }

  const recId = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const fechaCompleta = targetDate.toISOString();

  // Programar notificación automática local en el dispositivo (dispara incluso con la app cerrada)
  let notificationId: string | null = null;
  try {
    notificationId = await programarNotificacionRecordatorio({
      recordatorioId: recId,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      fechaHora: targetDate,
    });
  } catch (notifErr) {
    console.warn('[ReminderService] No se pudo agendar la notificación local inmediata:', notifErr);
  }

  const nuevoRecordatorio: Recordatorio = {
    id: recId,
    userId: datos.userId,
    userName: datos.userName,
    userEmail: datos.userEmail.toLowerCase().trim(),
    titulo: datos.titulo.trim(),
    descripcion: (datos.descripcion || '').trim(),
    fecha: datos.fecha,
    hora: datos.hora,
    fechaCompleta,
    veterinarioId: datos.veterinarioId,
    veterinarioNombre: datos.veterinarioNombre,
    notificationId: notificationId || null,
    createdAt: new Date().toISOString(),
  };

  // Persistir en Firestore
  const docRef = doc(db, 'recordatorios', recId);
  await setDoc(docRef, nuevoRecordatorio);

  return nuevoRecordatorio;
}

/**
 * Consulta los recordatorios en el sistema
 * - Si es veterinario: puede consultar todos los recordatorios creados.
 * - Si es propietario: solo consulta los asociados a su cuenta.
 */
export async function getRecordatorios(
  currentUserId: string,
  isVeterinario: boolean,
  userEmail?: string
): Promise<Recordatorio[]> {
  try {
    const recRef = collection(db, 'recordatorios');
    const map = new Map<string, Recordatorio>();

    if (isVeterinario) {
      // El veterinario consulta todos los recordatorios
      const snapAll = await getDocs(recRef).catch(() => null);
      snapAll?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Recordatorio));
    } else {
      // El propietario solo consulta los asociados a su usuario
      if (currentUserId) {
        const qUserId = query(recRef, where('userId', '==', currentUserId));
        const snapUser = await getDocs(qUserId).catch(() => null);
        snapUser?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Recordatorio));
      }

      if (userEmail) {
        const qEmail = query(recRef, where('userEmail', '==', userEmail.toLowerCase().trim()));
        const snapEmail = await getDocs(qEmail).catch(() => null);
        snapEmail?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Recordatorio));
      }
    }

    const list = Array.from(map.values());
    // Ordenar por fecha cronológica
    return list.sort((a, b) => a.fechaCompleta.localeCompare(b.fechaCompleta));
  } catch (error) {
    console.error('[ReminderService] Error consultando recordatorios:', error);
    return [];
  }
}

/**
 * Elimina un recordatorio del sistema
 * Criterio de aceptación: El veterinario puede consultar y eliminar los recordatorios creados.
 */
export async function eliminarRecordatorio(
  recordatorioId: string,
  isVeterinario: boolean
): Promise<void> {
  if (!isVeterinario) {
    throw new Error('Solo los veterinarios autorizados tienen permisos para eliminar recordatorios.');
  }

  // Cancelar la notificación programada en el sistema operativo si existe
  try {
    const docRef = doc(db, 'recordatorios', recordatorioId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Recordatorio;
      if (data.notificationId) {
        await cancelarNotificacionRecordatorio(data.notificationId);
      }
    }
    await deleteDoc(docRef);
  } catch (error) {
    console.error('[ReminderService] Error eliminando recordatorio:', error);
    throw error;
  }
}

/**
 * Sincroniza notificaciones en el dispositivo local para los recordatorios de un usuario
 * Garantiza que las notificaciones pendientes se programen en el OS del dispositivo actual
 */
export async function sincronizarNotificacionesUsuario(recordatorios: Recordatorio[]): Promise<void> {
  const now = Date.now();
  for (const rec of recordatorios) {
    const targetDate = new Date(rec.fechaCompleta);
    if (targetDate.getTime() > now) {
      try {
        await programarNotificacionRecordatorio({
          recordatorioId: rec.id,
          titulo: rec.titulo,
          descripcion: rec.descripcion,
          fechaHora: targetDate,
        });
      } catch (e) {
        console.warn(`[ReminderService] Error sincronizando recordatorio ${rec.id}:`, e);
      }
    }
  }
}
