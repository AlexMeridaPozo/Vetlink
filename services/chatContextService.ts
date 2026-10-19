import { auth, db } from '@/config/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

/**
 * Representaciones minimizadas de los datos personales del usuario.
 * Solo contienen los campos indispensables para responder consultas
 * de cuidado, citas y avisos sin exponer datos sensibles ni metadatos técnicos.
 */
export interface MascotaResumen {
  nombre: string;
  especie: string;
  raza: string;
  edad?: string | number;
  sexo: string;
  peso?: string | number;
  historialClinico?: Array<{
    titulo: string;
    detalle: string;
    fecha: string;
    completado?: boolean;
  }>;
}

export interface RecordatorioResumen {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  veterinario?: string;
}

export interface TurnoResumen {
  mascotaNombre?: string;
  fecha: string;
  hora: string;
  veterinaria: string;
  estado: string;
}

export interface ContextoUsuarioVerificado {
  usuarioNombre: string;
  usuarioEmail: string;
  mascotas: MascotaResumen[];
  recordatorios: RecordatorioResumen[];
  turnos: TurnoResumen[];
}

/**
 * Consulta y valida exclusivamente la información autorizada para el usuario autenticado.
 *
 * Principios de seguridad:
 * 1. La identidad se toma única y exclusivamente de `auth.currentUser.uid`.
 * 2. NUNCA acepta un UID provisto por parámetro externo ni por la IA.
 * 3. Valida en cada documento retornado que su propiedad (`userId` u `ownerId`) coincida con el UID autenticado.
 * 4. Aplica minimización de datos: omite teléfonos, UIDs ajenos, tokens NFC y rutas de archivos.
 * 5. Si no hay datos, devuelve arreglos vacíos para que el asistente no invente información.
 */
export async function obtenerContextoUsuarioAutenticado(): Promise<ContextoUsuarioVerificado> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa de usuario. La consulta no está autorizada.');
  }

  const authenticatedUid = currentUser.uid;
  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const usuarioNombre = currentUser.displayName || 'Tutor VetLink';

  // ── 1. Consultar Mascotas del usuario ─────────────────────────────────────
  const mascotasMap = new Map<string, MascotaResumen>();
  try {
    const mascotasRef = collection(db, 'mascotas');

    // Consultas autorizadas por userId y ownerId
    const qUserId = query(mascotasRef, where('userId', '==', authenticatedUid));
    const qOwnerId = query(mascotasRef, where('ownerId', '==', authenticatedUid));

    const [snapUserId, snapOwnerId] = await Promise.all([
      getDocs(qUserId).catch(() => null),
      getDocs(qOwnerId).catch(() => null),
    ]);

    const procesarDocMascota = (docSnap: any) => {
      const data = docSnap.data();
      // Verificación estricta de propiedad
      if (data.userId !== authenticatedUid && data.ownerId !== authenticatedUid) {
        return; // Descartar inmediatamente si no coincide con el usuario en sesión
      }

      const resumen: MascotaResumen = {
        nombre: data.nombre || 'Mascota sin nombre',
        especie: data.especie || 'No especificada',
        raza: data.raza || 'Mestizo',
        edad: data.edad,
        sexo: data.sexo || 'Desconocido',
        peso: data.peso,
        historialClinico: Array.isArray(data.historialClinico)
          ? data.historialClinico.slice(-5).map((h: any) => ({
              titulo: h.titulo || 'Control sanitario',
              detalle: h.detalle || '',
              fecha: h.fecha || '',
              completado: !!h.completado,
            }))
          : [],
      };

      mascotasMap.set(docSnap.id, resumen);
    };

    snapUserId?.docs.forEach(procesarDocMascota);
    snapOwnerId?.docs.forEach(procesarDocMascota);
  } catch (err) {
    console.warn('[ChatContextService] Error consultando mascotas autorizadas:', err);
  }

  // ── 2. Consultar Recordatorios del usuario ─────────────────────────────────
  const recordatoriosMap = new Map<string, RecordatorioResumen>();
  try {
    const recRef = collection(db, 'recordatorios');

    const qRecUser = query(recRef, where('userId', '==', authenticatedUid));
    const snapsPromises = [getDocs(qRecUser).catch(() => null)];

    if (userEmail) {
      const qRecEmail = query(recRef, where('userEmail', '==', userEmail));
      snapsPromises.push(getDocs(qRecEmail).catch(() => null));
    }

    const snaps = await Promise.all(snapsPromises);

    const procesarDocRec = (docSnap: any) => {
      const data = docSnap.data();
      // Verificación estricta de propiedad
      const coincideUid = data.userId === authenticatedUid;
      const coincideEmail = userEmail && (data.userEmail || '').toLowerCase().trim() === userEmail;

      if (!coincideUid && !coincideEmail) {
        return;
      }

      recordatoriosMap.set(docSnap.id, {
        titulo: data.titulo || 'Recordatorio general',
        descripcion: data.descripcion || '',
        fecha: data.fecha || '',
        hora: data.hora || '',
        veterinario: data.veterinarioNombre || undefined,
      });
    };

    snaps.forEach((snap) => snap?.docs.forEach(procesarDocRec));
  } catch (err) {
    console.warn('[ChatContextService] Error consultando recordatorios autorizados:', err);
  }

  // ── 3. Consultar Turnos del usuario ───────────────────────────────────────
  const turnosMap = new Map<string, TurnoResumen>();
  try {
    const turnosRef = collection(db, 'turnos');

    const qTurnosUser = query(turnosRef, where('userId', '==', authenticatedUid));
    const qTurnosOwner = query(turnosRef, where('ownerId', '==', authenticatedUid));

    const [snapTurnosUser, snapTurnosOwner] = await Promise.all([
      getDocs(qTurnosUser).catch(() => null),
      getDocs(qTurnosOwner).catch(() => null),
    ]);

    const procesarDocTurno = (docSnap: any) => {
      const data = docSnap.data();
      // Verificación estricta de propiedad
      if (data.userId !== authenticatedUid && data.ownerId !== authenticatedUid) {
        return;
      }

      turnosMap.set(docSnap.id, {
        mascotaNombre: data.mascotaNombre || data.petName || 'Mascota',
        fecha: data.fecha || 'Fecha a confirmar',
        hora: data.hora || '',
        veterinaria: data.veterinaria || 'Veterinaria asignada',
        estado: data.estado || 'Confirmado',
      });
    };

    snapTurnosUser?.docs.forEach(procesarDocTurno);
    snapTurnosOwner?.docs.forEach(procesarDocTurno);
  } catch (err) {
    console.warn('[ChatContextService] Error consultando turnos autorizados:', err);
  }

  return {
    usuarioNombre,
    usuarioEmail: userEmail,
    mascotas: Array.from(mascotasMap.values()),
    recordatorios: Array.from(recordatoriosMap.values()),
    turnos: Array.from(turnosMap.values()),
  };
}

/**
 * Formatea el contexto verificado en un bloque descriptivo minimizado
 * para ser inyectado como fuente de verdad en el prompt de la IA (Groq).
 */
export function formatearContextoParaPrompt(contexto: ContextoUsuarioVerificado): string {
  const lineas: string[] = [];

  lineas.push(`=== DATOS VERIFICADOS DEL USUARIO EN VETLINK ===`);
  lineas.push(`Usuario autenticado: ${contexto.usuarioNombre}`);

  // Mascotas
  if (contexto.mascotas.length === 0) {
    lineas.push(`MASCOTAS REGISTRADAS: Ninguna mascota registrada en la cuenta actualmente.`);
  } else {
    lineas.push(`MASCOTAS REGISTRADAS (Total: ${contexto.mascotas.length}):`);
    contexto.mascotas.forEach((m, idx) => {
      const pesoStr = m.peso ? ` | Peso: ${m.peso} kg` : '';
      const edadStr = m.edad ? ` | Edad: ${m.edad}` : '';
      lineas.push(`  ${idx + 1}. Nombre: "${m.nombre}" | Especie: ${m.especie} | Raza: ${m.raza} | Sexo: ${m.sexo}${edadStr}${pesoStr}`);
      if (m.historialClinico && m.historialClinico.length > 0) {
        lineas.push(`     Historial/Controles previos:`);
        m.historialClinico.forEach((h) => {
          lineas.push(`     - ${h.titulo} (${h.fecha}): ${h.detalle}${h.completado ? ' [Completado]' : ''}`);
        });
      }
    });
  }

  // Recordatorios
  if (contexto.recordatorios.length === 0) {
    lineas.push(`RECORDATORIOS SANITARIOS PENDIENTES: Ningún recordatorio pendiente.`);
  } else {
    lineas.push(`RECORDATORIOS SANITARIOS PENDIENTES (Total: ${contexto.recordatorios.length}):`);
    contexto.recordatorios.forEach((r, idx) => {
      const vetStr = r.veterinario ? ` | Por: ${r.veterinario}` : '';
      lineas.push(`  ${idx + 1}. "${r.titulo}" para el ${r.fecha} a las ${r.hora} hs${vetStr}. Detalle: ${r.descripcion}`);
    });
  }

  // Turnos
  if (contexto.turnos.length === 0) {
    lineas.push(`TURNOS MÉDICOS AGENDADOS: Ningún turno registrado actualmente.`);
  } else {
    lineas.push(`TURNOS MÉDICOS AGENDADOS (Total: ${contexto.turnos.length}):`);
    contexto.turnos.forEach((t, idx) => {
      lineas.push(`  ${idx + 1}. Mascota: ${t.mascotaNombre} | Fecha: ${t.fecha} | Hora: ${t.hora} | Veterinaria: ${t.veterinaria} | Estado: ${t.estado}`);
    });
  }

  lineas.push(`=================================================`);

  return lineas.join('\n');
}

export const formatearContextoParaGemini = formatearContextoParaPrompt;

