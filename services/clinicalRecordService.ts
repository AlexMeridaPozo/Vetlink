import { ClinicalConsultation, NewConsultationInput, Pet } from '@/types/clinicalRecord';

// Base de datos local / mock para desarrollo y pruebas del MVP
// Diseñada para migrar directamente a Firebase Firestore (ej. colecciones 'mascotas' y 'consultas')
const MOCK_PETS: Pet[] = [
  {
    id: 'PET-001',
    nombre: 'Milo',
    especie: 'Canino',
    raza: 'Golden Retriever',
    fechaNacimiento: '15/03/2021',
    sexo: 'Macho',
    peso: '31.5 kg',
    propietario: 'Alex Mérida',
    telefonoContacto: '+54 9 11 5555-0123',
  },
  {
    id: 'PET-002',
    nombre: 'Luna',
    especie: 'Felino',
    raza: 'Siamés',
    fechaNacimiento: '10/08/2022',
    sexo: 'Hembra',
    peso: '4.2 kg',
    propietario: 'María Giménez',
    telefonoContacto: '+54 9 11 4444-9876',
  },
  {
    id: 'PET-003',
    nombre: 'Thor',
    especie: 'Canino',
    raza: 'Bulldog Francés',
    fechaNacimiento: '02/11/2020',
    sexo: 'Macho',
    peso: '12.8 kg',
    propietario: 'Lucas Rossi',
    telefonoContacto: '+54 9 11 3333-7654',
  },
];

const MOCK_CONSULTATIONS: ClinicalConsultation[] = [
  {
    id: 'CONS-001',
    mascotaId: 'PET-001',
    fecha: '2026-08-14',
    motivo: 'Decaimiento general y vómitos reiterados desde hace 24hs.',
    diagnostico: 'Gastroenteritis aguda leve por probable ingesta indiscreta.',
    tratamiento: 'Dieta blanda (pollo hervido y arroz) por 4 días. Ranitidina oral cada 12hs y probióticos caninos.',
    observaciones: 'Paciente hidratado, abdomen blando no doloroso a la palpación. Control evolutivo en 72hs si no mejora.',
    veterinariaNombre: 'Clínica Veterinaria San Roque',
    veterinarioMatricula: 'MP 4589',
    createdAt: '2026-08-14T10:30:00Z',
  },
  {
    id: 'CONS-002',
    mascotaId: 'PET-001',
    fecha: '2026-05-20',
    motivo: 'Prurito intenso en zona lumbar y orejas, rascado frecuente.',
    diagnostico: 'Dermatitis alérgica por picadura de pulgas (DAPP) y otitis eritematosa bilateral.',
    tratamiento: 'Pipeta antipulgas de amplio espectro. Gotas óticas con antibiótico y corticoide cada 12hs por 7 días. Shampoo hipoalergénico.',
    observaciones: 'Lesiones alopécicas focales en base de cola sin sobreinfección bacteriana profunda.',
    veterinariaNombre: 'Clínica Veterinaria San Roque',
    veterinarioMatricula: 'MP 4589',
    createdAt: '2026-05-20T16:15:00Z',
  },
  {
    id: 'CONS-003',
    mascotaId: 'PET-001',
    fecha: '2026-01-10',
    motivo: 'Control clínico anual y revisión de peso corporal.',
    diagnostico: 'Paciente clínicamente sano con leve aumento de peso (+1.5kg).',
    tratamiento: 'Ajuste de ración diaria de alimento balanceado a 350g/día repartido en dos tomas. Paseos diarios de 40 minutos.',
    observaciones: 'Mucosas rosadas, ganglios no reactivos, auscultación cardiopulmonar sin particularidades.',
    veterinariaNombre: 'VetCare Central',
    veterinarioMatricula: 'MP 3201',
    createdAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'CONS-004',
    mascotaId: 'PET-002',
    fecha: '2026-07-02',
    motivo: 'Molestia ocular con epífora y blefaroespasmo en ojo derecho.',
    diagnostico: 'Conjuntivitis bacteriana unilateral sin compromiso corneal.',
    tratamiento: 'Colirio con Tobramicina 1 gota cada 8 horas durante 7 días. Limpieza previa con solución salina.',
    observaciones: 'Test de fluoresceína negativo. Córnea íntegra sin úlceras.',
    veterinariaNombre: 'Hospital Veterinario Central',
    veterinarioMatricula: 'MP 5102',
    createdAt: '2026-07-02T09:45:00Z',
  },
];

// Estado en memoria para la sesión
let consultationsStore: ClinicalConsultation[] = [...MOCK_CONSULTATIONS];
let petsStore: Pet[] = [...MOCK_PETS];

/**
 * Obtiene los datos de una mascota por su ID.
 * Estructura compatible con el futuro:
 * const docRef = doc(db, 'mascotas', petId);
 * const snapshot = await getDoc(docRef);
 */
export async function getPetById(petId: string): Promise<Pet | null> {
  // Simular pequeña latencia de red para UX realista
  await new Promise((resolve) => setTimeout(resolve, 150));
  const cleanId = petId.trim().toUpperCase();
  const pet = petsStore.find((p) => p.id.toUpperCase() === cleanId);
  return pet ? { ...pet } : null;
}

/**
 * Obtiene todas las mascotas registradas para pruebas de navegación.
 */
export async function getAllPets(): Promise<Pet[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [...petsStore];
}

/**
 * Obtiene el historial de consultas clínicas de una mascota, ordenadas cronológicamente (más recientes primero).
 * Estructura compatible con Firestore:
 * const q = query(collection(db, 'consultas'), where('mascotaId', '==', petId), orderBy('fecha', 'desc'));
 */
export async function getConsultationsByPetId(petId: string): Promise<ClinicalConsultation[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const cleanId = petId.trim().toUpperCase();

  const results = consultationsStore.filter(
    (c) => c.mascotaId.toUpperCase() === cleanId
  );

  // Ordenar cronológicamente descendente (más nueva primero)
  return results.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

/**
 * Registra una nueva consulta clínica para una mascota.
 * Estructura compatible con Firestore:
 * const docRef = await addDoc(collection(db, 'consultas'), newConsultationData);
 */
export async function addConsultation(input: NewConsultationInput): Promise<ClinicalConsultation> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const newId = `CONS-${Date.now().toString().slice(-4)}`;
  const newConsultation: ClinicalConsultation = {
    id: newId,
    mascotaId: input.mascotaId.trim().toUpperCase(),
    fecha: input.fecha.trim(),
    motivo: input.motivo.trim(),
    diagnostico: input.diagnostico.trim(),
    tratamiento: input.tratamiento.trim(),
    observaciones: input.observaciones?.trim() || undefined,
    veterinariaNombre: input.veterinariaNombre || 'Clínica Veterinaria VetLink',
    createdAt: new Date().toISOString(),
  };

  consultationsStore = [newConsultation, ...consultationsStore];
  return newConsultation;
}
