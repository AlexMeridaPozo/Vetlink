import { auth, db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  or,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export interface HistorialClinicoItem {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  veterinario?: string;
  completado?: boolean;
}

// 1. Definición completa del modelo de datos de Mascota en Firestore
export interface Pet {
  id: string; // Identificador único y estable (ej: PET-001)
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento?: string;
  edad?: string | number;
  sexo: string;
  peso: string | number;
  propietario?: string;
  telefonoContacto?: string;
  userId?: string;
  ownerId?: string;
  fotoUrl?: string;
  descripcion?: string;
  historialClinico?: HistorialClinicoItem[];

  // Metadatos de la vinculación NFC (mantenidos en sync con nfcTags)
  nfcTagId?: string | null;
  nfcLinkedAt?: string | null;
  nfcLinkedBy?: string | null;
  nfcStatus?: 'linked' | 'unlinked' | null;
  nfcUrl?: string | null;

  // Sistema de Extravío y Geolocalización de Rescate
  extraviada?: boolean;
  fechaExtravio?: string;
  ultimoEscaneo?: UltimoEscaneo;

  createdByVet?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UltimoEscaneo {
  fecha: string;
  lat: number;
  lng: number;
  precision?: number;
  direccionAprox?: string;
  dispositivo?: string;
}

// Alias para compatibilidad de tipos en la aplicación
export type Mascota = Pet;

// 2. Modelo de documento en la colección 'nfcTags/{tagId}'
export interface NfcTagDocument {
  tagId: string; // ID técnico del tag o ID lógico derivado
  petId: string; // Identificador estable de la mascota
  petRef: string; // Referencia al documento 'mascotas/{petId}'
  status: 'linked' | 'unlinked' | 'revoked';
  linkedAt: string;
  linkedBy: string; // UID del veterinario autorizado
  tagTech?: string;
  ndefPayload?: string;
  updatedAt?: string;
}

/**
 * 3. Consulta Firestore para recuperar una mascota por su identificador estable
 * Firestore es la FUENTE DE VERDAD. El NFC solo provee el ID para esta consulta.
 */
export async function getPetById(petId: string): Promise<Pet | null> {
  try {
    if (!petId || !petId.trim()) return null;
    const cleanId = petId.trim().toUpperCase();

    const petDocRef = doc(db, 'mascotas', cleanId);
    const petSnapshot = await getDoc(petDocRef);

    if (petSnapshot.exists()) {
      return {
        id: petSnapshot.id,
        ...(petSnapshot.data() as Omit<Pet, 'id'>),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al consultar los datos de la mascota en Firestore:', error);
    throw error;
  }
}

/**
 * 4. Consulta si una etiqueta NFC física ya está vinculada en la colección 'nfcTags'
 */
export async function checkNfcTagInFirestore(tagId: string): Promise<NfcTagDocument | null> {
  try {
    if (!tagId) return null;
    const cleanTagId = tagId.trim();
    const tagDocRef = doc(db, 'nfcTags', cleanTagId);
    const snap = await getDoc(tagDocRef);

    if (snap.exists()) {
      return snap.data() as NfcTagDocument;
    }
    return null;
  } catch (error) {
    console.error('Error consultando asociación de tag NFC en Firestore:', error);
    throw error;
  }
}

/**
 * 5. Genera el siguiente ID secuencial estable sugerido (PET-001, PET-002, etc.)
 * evitando colisiones con IDs existentes en Firestore.
 */
export async function getNextSuggestedPetId(): Promise<string> {
  try {
    const mascotasRef = collection(db, 'mascotas');
    const snapshot = await getDocs(query(mascotasRef, limit(100)));

    let maxNum = 0;
    snapshot.docs.forEach((d) => {
      const match = d.id.match(/^PET-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `PET-${String(nextNum).padStart(3, '0')}`;
  } catch {
    return `PET-001`;
  }
}

/**
 * 6. Registro de una nueva mascota en Firebase Firestore por un veterinario
 * - Guarda los datos en la colección 'mascotas'.
 * - Asigna o valida un identificador único estable (ej: PET-001).
 * - Evita identificadores duplicados.
 */
export async function registerPet(
  petData: Omit<Pet, 'id'> & { id?: string },
  vetUid: string
): Promise<Pet> {
  try {
    let cleanId = petData.id?.trim().toUpperCase();
    if (!cleanId) {
      cleanId = await getNextSuggestedPetId();
    }

    // Verificar si ya existe para evitar sobreescritura accidental
    const existingRef = doc(db, 'mascotas', cleanId);
    const existingSnap = await getDoc(existingRef);
    if (existingSnap.exists()) {
      throw new Error(`Ya existe una mascota registrada con el identificador ${cleanId}. Usa otro ID.`);
    }

    const now = new Date().toISOString();
    const newPet: Pet = {
      ...petData,
      id: cleanId,
      createdByVet: vetUid,
      createdAt: now,
      updatedAt: now,
      nfcStatus: null,
      nfcTagId: null,
      nfcUrl: null,
      historialClinico: petData.historialClinico || [
        {
          id: 'initial-check',
          titulo: 'Alta médica inicial',
          detalle: 'Registro de datos clínicos y ficha médica inicial en HuellaApp.',
          fecha: new Date().toLocaleDateString('es-AR'),
          veterinario: vetUid,
          completado: true,
        },
      ],
    };

    // Limpiar propiedades undefined para evitar errores de Firebase Firestore en setDoc
    const cleanPayload = Object.fromEntries(
      Object.entries(newPet).filter(([, v]) => v !== undefined)
    ) as unknown as Pet;

    await setDoc(existingRef, cleanPayload);
    return cleanPayload;
  } catch (error) {
    console.error('Error al registrar mascota en Firestore:', error);
    throw error;
  }
}

/**
 * 7. Guarda la asociación permanente entre la etiqueta NFC física y la mascota en Firestore
 * - Crea/actualiza el documento en 'nfcTags/{tagId}'.
 * - Actualiza los metadatos en 'mascotas/{petId}'.
 * - Desvincula la etiqueta de una mascota anterior si se trataba de una reasignación.
 */
export async function linkNfcTagToPet(
  petId: string,
  data: {
    tagId: string;
    ndefUrl: string;
    vetUid: string;
    tagTech?: string;
  }
): Promise<void> {
  try {
    const cleanPetId = petId.trim().toUpperCase();
    const cleanTagId = data.tagId.trim();
    const now = new Date().toISOString();

    // 1. Verificar si este tag ya estaba vinculado a otra mascota
    const existingTagDoc = await checkNfcTagInFirestore(cleanTagId);
    if (existingTagDoc && existingTagDoc.status === 'linked' && existingTagDoc.petId !== cleanPetId) {
      // Desvincular de la mascota previa para mantener consistencia 1:1
      const oldPetRef = doc(db, 'mascotas', existingTagDoc.petId);
      await updateDoc(oldPetRef, {
        nfcStatus: 'unlinked',
        nfcTagId: null,
        nfcUrl: null,
        updatedAt: now,
      }).catch((e) => console.warn('Aviso: no se pudo actualizar mascota previa al reasignar tag:', e));
    }

    // 2. Guardar en la colección 'nfcTags/{tagId}'
    const tagDocRef = doc(db, 'nfcTags', cleanTagId);
    const nfcDocPayload: NfcTagDocument = {
      tagId: cleanTagId,
      petId: cleanPetId,
      petRef: `mascotas/${cleanPetId}`,
      status: 'linked',
      linkedAt: now,
      linkedBy: data.vetUid,
      tagTech: data.tagTech || 'Ndef',
      ndefPayload: data.ndefUrl,
      updatedAt: now,
    };
    await setDoc(tagDocRef, nfcDocPayload);

    // 3. Actualizar la mascota correspondiente en 'mascotas/{petId}'
    const petDocRef = doc(db, 'mascotas', cleanPetId);
    await updateDoc(petDocRef, {
      nfcTagId: cleanTagId,
      nfcLinkedAt: now,
      nfcLinkedBy: data.vetUid,
      nfcStatus: 'linked',
      nfcUrl: data.ndefUrl,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error al guardar la asociación NFC en Firestore:', error);
    throw error;
  }
}

/**
 * 8. Desvincula una etiqueta NFC en Firestore y deja a la mascota sin collar vinculado
 */
export async function unlinkNfcTagFromPet(
  petId: string,
  tagId: string | null | undefined,
  vetUid: string
): Promise<void> {
  try {
    const rawId = petId.trim();
    let targetDocRef = doc(db, 'mascotas', rawId.toUpperCase());
    let currentTagId = tagId;

    try {
      const snap = await getDoc(targetDocRef);
      if (snap.exists()) {
        const data = snap.data() as Pet;
        if (!currentTagId && data.nfcTagId) {
          currentTagId = data.nfcTagId;
        }
      } else {
        const altRef = doc(db, 'mascotas', rawId);
        const altSnap = await getDoc(altRef);
        if (altSnap.exists()) {
          targetDocRef = altRef;
          const data = altSnap.data() as Pet;
          if (!currentTagId && data.nfcTagId) {
            currentTagId = data.nfcTagId;
          }
        }
      }
    } catch {
      // Continuar con referencia estándar
    }

    const now = new Date().toISOString();

    if (currentTagId) {
      const cleanTagId = currentTagId.trim();
      const tagDocRef = doc(db, 'nfcTags', cleanTagId);
      await updateDoc(tagDocRef, {
        status: 'unlinked',
        petId: '',
        ndefPayload: '',
        updatedAt: now,
        unlinkedBy: vetUid,
      }).catch(() => {});
    }

    await updateDoc(targetDocRef, {
      nfcTagId: null,
      nfcStatus: 'unlinked',
      nfcUrl: null,
      nfcLinkedAt: null,
      nfcLinkedBy: null,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error al desvincular tag NFC en Firestore:', error);
    throw error;
  }
}

/**
 * 9. Actualiza datos clínicos o generales de una mascota en Firestore
 */
export async function updatePetData(petId: string, updates: Partial<Pet>): Promise<void> {
  try {
    if (!petId || !petId.trim()) {
      throw new Error('ID de mascota requerido para actualizar.');
    }
    const rawId = petId.trim();
    let targetDocRef = doc(db, 'mascotas', rawId.toUpperCase());

    try {
      const snap = await getDoc(targetDocRef);
      if (!snap.exists()) {
        const altDocRef = doc(db, 'mascotas', rawId);
        const altSnap = await getDoc(altDocRef);
        if (altSnap.exists()) {
          targetDocRef = altDocRef;
        }
      }
    } catch (lookupErr) {
      console.warn('[updatePetData] Aviso al resolver referencia de mascota:', lookupErr);
    }

    // Limpiar propiedades undefined para evitar errores de Firebase Firestore en updateDoc
    const cleanUpdates = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: new Date().toISOString(),
      }).filter(([, v]) => v !== undefined)
    );

    await updateDoc(targetDocRef, cleanUpdates);
  } catch (error) {
    console.error('Error al actualizar datos de la mascota en Firestore:', error);
    throw error;
  }
}

/**
 * 10. Función existente para vincular una mascota a un usuario en Firestore
 */
export async function linkPetToUser(petId: string, userId: string): Promise<void> {
  try {
    const cleanId = petId.trim().toUpperCase();
    const petDocRef = doc(db, 'mascotas', cleanId);
    await updateDoc(petDocRef, {
      userId: userId,
      ownerId: userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al vincular la mascota al usuario en Firestore:', error);
    throw error;
  }
}

/**
 * 11. Consulta la lista de mascotas en Firestore según el rol del usuario:
 * - Veterinario: todas las mascotas registradas en la clínica.
 * - Propietario/tutor: solo las mascotas vinculadas a su UID (por userId o ownerId).
 */
export async function fetchPetsForUser(userId: string, isVet: boolean): Promise<Pet[]> {
  try {
    const mascotasRef = collection(db, 'mascotas');

    if (isVet) {
      const snapshot = await getDocs(mascotasRef);
      const list: Pet[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Pet, 'id'>),
      }));
      return list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }

    try {
      const q = query(
        mascotasRef,
        or(where('userId', '==', userId), where('ownerId', '==', userId))
      );
      const snapshot = await getDocs(q);
      const list: Pet[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Pet, 'id'>),
      }));
      return list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    } catch (orError) {
      console.warn('Consulta OR no disponible, ejecutando fallback:', orError);
      const q1 = query(mascotasRef, where('userId', '==', userId));
      const q2 = query(mascotasRef, where('ownerId', '==', userId));
      const [snap1, snap2] = await Promise.all([
        getDocs(q1).catch(() => null),
        getDocs(q2).catch(() => null),
      ]);

      const map = new Map<string, Pet>();
      snap1?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Pet));
      snap2?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Pet));
      const list = Array.from(map.values());
      return list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
  } catch (error) {
    console.error('Error al obtener mascotas de Firestore:', error);
    throw error;
  }
}

/**
 * 12. Hook de React consolidado para listar y refrescar mascotas en tiempo de ejecución.
 */
export interface UsePetsReturn {
  pets: Pet[];
  petCount: number;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePets(): UsePetsReturn {
  const { user, isVeterinario } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPets = useCallback(
    async (isManualRefresh = false) => {
      const currentUser = auth.currentUser || user;
      if (!currentUser) {
        setPets([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchPetsForUser(currentUser.uid, isVeterinario);
        setPets(result);
      } catch (err) {
        console.error('[usePets] Error al cargar mascotas:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setPets([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, isVeterinario]
  );

  useEffect(() => {
    loadPets(false);
  }, [loadPets]);

  const refresh = useCallback(async () => {
    await loadPets(true);
  }, [loadPets]);

  return {
    pets,
    petCount: pets.length,
    loading,
    refreshing,
    error,
    refresh,
  };
}

/**
 * 13. Registra la ubicación geográfica del rescate de una mascota escaneada por QR o NFC.
 * Accesible tanto por usuarios autenticados como por cualquier persona que encuentre a la mascota en la calle.
 */
export async function registrarEscaneoRescate(
  petId: string,
  coords: { lat: number; lng: number; precision?: number; direccionAprox?: string }
): Promise<UltimoEscaneo> {
  const cleanId = petId.trim().toUpperCase();
  const fechaActual = new Date().toISOString();

  const ultimoEscaneo: UltimoEscaneo = {
    fecha: fechaActual,
    lat: coords.lat,
    lng: coords.lng,
    precision: coords.precision,
    direccionAprox: coords.direccionAprox,
  };

  try {
    // 1. Guardar en el historial de escaneos
    const escaneosRef = collection(db, 'escaneosRescate');
    await addDoc(escaneosRef, {
      petId: cleanId,
      ...ultimoEscaneo,
      createdAt: fechaActual,
    });

    // 2. Actualizar el último escaneo en el documento de la mascota
    const petDocRef = doc(db, 'mascotas', cleanId);
    await updateDoc(petDocRef, {
      ultimoEscaneo,
    });

    return ultimoEscaneo;
  } catch (error) {
    console.error('[registrarEscaneoRescate] Error al guardar escaneo:', error);
    throw error;
  }
}

/**
 * 14. Alterna el estado de extravío de una mascota (reportar como perdida o marcar como recuperada).
 * Soporta tanto identificadores en mayúsculas como IDs sensibles a mayúsculas/minúsculas de Firestore.
 */
export async function toggleEstadoExtravio(petId: string, extraviada: boolean): Promise<void> {
  if (!petId || !petId.trim()) {
    throw new Error('ID de mascota requerido para actualizar estado de extravío.');
  }

  const rawId = petId.trim();
  let targetDocRef = doc(db, 'mascotas', rawId);

  try {
    const rawSnap = await getDoc(targetDocRef);
    if (!rawSnap.exists()) {
      const upperRef = doc(db, 'mascotas', rawId.toUpperCase());
      const upperSnap = await getDoc(upperRef);
      if (upperSnap.exists()) {
        targetDocRef = upperRef;
      }
    }
  } catch (lookupErr) {
    console.warn('[toggleEstadoExtravio] Error verificando existencia por ID, continuando con referencia directa:', lookupErr);
  }

  await updateDoc(targetDocRef, {
    extraviada,
    fechaExtravio: extraviada ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 15. Elimina una mascota de Firestore únicamente si NO se encuentra vinculada a un collar NFC activo.
 */
export async function deletePet(petId: string): Promise<void> {
  if (!petId || !petId.trim()) {
    throw new Error('Identificador de mascota requerido para eliminar.');
  }

  const rawId = petId.trim();
  let targetDocRef = doc(db, 'mascotas', rawId.toUpperCase());
  let snap = await getDoc(targetDocRef);

  if (!snap.exists()) {
    const altRef = doc(db, 'mascotas', rawId);
    const altSnap = await getDoc(altRef);
    if (altSnap.exists()) {
      targetDocRef = altRef;
      snap = altSnap;
    }
  }

  if (snap.exists()) {
    const data = snap.data() as Pet;
    if (data.nfcStatus === 'linked' || Boolean(data.nfcTagId)) {
      throw new Error(
        'No se puede eliminar una mascota que ya tiene un collar NFC/QR vinculado.'
      );
    }
  }

  await deleteDoc(targetDocRef);
}

