export type UserRole = 'dueno' | 'veterinaria';

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
  fotoUrl?: string;
}

export interface ClinicalConsultation {
  id: string;
  mascotaId: string;
  fecha: string; // Formato YYYY-MM-DD
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  veterinariaNombre?: string;
  veterinarioMatricula?: string;
  createdAt?: string;
}

export interface NewConsultationInput {
  mascotaId: string;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
  veterinariaNombre?: string;
}
