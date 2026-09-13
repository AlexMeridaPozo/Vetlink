import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 1. Definición del modelo de datos de Mascota
export interface Pet {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: string;
  sexo: string;
  peso: string;
  propietario: string;
  telefonoContacto?: string;
}

// 2. Función para buscar una mascota en Firestore a partir del ID del QR
export async function getPetById(petId: string): Promise<Pet | null> {
  try {
    // El ID del QR y en Firebase siempre está en MAYÚSCULAS (ej: PET-001)
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
