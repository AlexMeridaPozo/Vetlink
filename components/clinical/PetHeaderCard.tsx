import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Pet, UserRole } from '@/types/clinicalRecord';

// ==============================================================================
// NOTA DE DESARROLLO / TESTING DEL MVP:
// Este selector de rol en pantalla es EXCLUSIVAMENTE un mecanismo de prueba
// para verificar la interfaz en modo Dueño y modo Veterinaria sin requerir
// cuentas diferenciadas en Firebase durante esta fase de prototipado.
// NO representa el sistema definitivo de autenticación o permisos.
// ==============================================================================

interface PetHeaderCardProps {
  pet: Pet;
  role: UserRole;
  onToggleRole: () => void;
  onBack?: () => void;
}

export function PetHeaderCard({ pet, role, onToggleRole, onBack }: PetHeaderCardProps) {
  const isVet = role === 'veterinaria';

  return (
    <View style={styles.container}>
      {/* Barra superior con navegación y selector de rol de prueba */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
        )}

        <View style={styles.titleWrapper}>
          <MaterialIcons name="medical-services" size={24} color="#04b639" />
          <Text style={styles.screenTitle}>Ficha clínica</Text>
        </View>

        {/* Badge interactivo EXCLUSIVO para testing y validación del MVP */}
        <TouchableOpacity
          style={[styles.roleBadge, isVet ? styles.roleBadgeVet : styles.roleBadgeOwner]}
          onPress={onToggleRole}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isVet ? 'local-hospital' : 'person'}
            size={14}
            color={isVet ? '#04b639' : '#2563EB'}
          />
          <Text style={[styles.roleText, isVet ? styles.roleTextVet : styles.roleTextOwner]}>
            [Prueba] {isVet ? 'Veterinaria' : 'Dueño'}
          </Text>
          <MaterialIcons name="swap-horiz" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>


      {/* Tarjeta con los datos de la mascota */}
      <View style={styles.petCard}>
        <View style={styles.petCardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>
              {pet.especie.toLowerCase().includes('felin') || pet.especie.toLowerCase().includes('gato')
                ? '🐱'
                : '🐶'}
            </Text>
          </View>
          <View style={styles.petMainInfo}>
            <View style={styles.petNameRow}>
              <Text style={styles.petName}>{pet.nombre}</Text>
              <View style={styles.speciesPill}>
                <Text style={styles.speciesPillText}>{pet.especie}</Text>
              </View>
            </View>
            <Text style={styles.breedText}>{pet.raza}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Grilla de información básica disponible */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Identificador</Text>
            <Text style={styles.infoValue}>{pet.id}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sexo</Text>
            <Text style={styles.infoValue}>{pet.sexo}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Peso actual</Text>
            <Text style={styles.infoValue}>{pet.peso}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nacimiento</Text>
            <Text style={styles.infoValue}>{pet.fechaNacimiento}</Text>
          </View>

          <View style={[styles.infoItem, styles.fullWidthItem]}>
            <Text style={styles.infoLabel}>Propietario</Text>
            <Text style={styles.infoValue}>
              {pet.propietario} {pet.telefonoContacto ? `• ${pet.telefonoContacto}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  roleBadgeVet: {
    backgroundColor: '#F0FDF4',
    borderColor: '#04b639',
  },
  roleBadgeOwner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleTextVet: {
    color: '#04b639',
  },
  roleTextOwner: {
    color: '#2563EB',
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  petCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#04b639',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarIcon: {
    fontSize: 26,
  },
  petMainInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  speciesPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speciesPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  breedText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '47%',
  },
  fullWidthItem: {
    width: '100%',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});
