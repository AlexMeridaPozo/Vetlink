import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { ClinicalConsultation, NewConsultationInput, Pet, UserRole } from '@/types/clinicalRecord';
import {
  addConsultation,
  getConsultationsByPetId,
  getPetById,
} from '@/services/clinicalRecordService';
import { PetHeaderCard } from '@/components/clinical/PetHeaderCard';
import { ConsultationCard } from '@/components/clinical/ConsultationCard';
import { NewConsultationModal } from '@/components/clinical/NewConsultationModal';

// ==============================================================================
// NOTA DE DESARROLLO / TESTING DEL MVP:
// El rol en esta pantalla se gestiona mediante parámetros de ruta ('role') o estado local.
// Esto es UNICAMENTE un mecanismo de prueba aislado para que los desarrolladores y evaluadores
// puedan verificar los dos comportamientos (Dueño: solo lectura vs. Veterinaria: con registro)
// sin requerir autenticación con roles reales en Firebase durante el MVP.
//
// En la versión final de producción:
// - El rol provendrá directamente del perfil de usuario autenticado en Firebase Firestore.
// - NO se permitirá manipular el rol mediante query params ni botones de prueba.
// ==============================================================================

export default function ClinicalRecordScreen() {
  const params = useLocalSearchParams<{ petId?: string; role?: string }>();
  const petId = params.petId || 'PET-001';

  // Rol activo aislado para testing del MVP (default 'veterinaria' para probar registro, o 'dueno')
  const [activeRole, setActiveRole] = useState<UserRole>(
    params.role === 'dueno' ? 'dueno' : 'veterinaria'
  );


  const [pet, setPet] = useState<Pet | null>(null);
  const [consultations, setConsultations] = useState<ClinicalConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const isVet = activeRole === 'veterinaria';

  // Carga de datos de la mascota y sus consultas
  const loadData = useCallback(async () => {
    try {
      const petData = await getPetById(petId);
      setPet(petData);

      if (petData) {
        const list = await getConsultationsByPetId(petData.id);
        setConsultations(list);
      }
    } catch (error) {
      console.error('Error al cargar ficha clínica:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Alternar rol entre DUEÑO y VETERINARIA exclusivamente para pruebas del MVP
  const handleToggleRole = () => {
    setActiveRole((prev) => (prev === 'veterinaria' ? 'dueno' : 'veterinaria'));
  };

  // Guardar nueva consulta (solo disponible para VETERINARIA)
  const handleSaveConsultation = async (input: NewConsultationInput) => {
    const created = await addConsultation(input);
    // Insertar de inmediato en la lista local en la primera posición
    setConsultations((prev) => [created, ...prev]);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#04b639" />
        <Text style={styles.loadingText}>Cargando ficha clínica...</Text>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <MaterialIcons name="pets" size={60} color="#D1D5DB" />
        <Text style={styles.notFoundTitle}>Mascota no encontrada</Text>
        <Text style={styles.notFoundSubtitle}>
          No se encontró registro para el identificador: {petId}
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGoBack}>
          <Text style={styles.primaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <FlatList
          data={consultations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#04b639"
              colors={['#04b639']}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Tarjeta superior con datos de la mascota y título */}
              <PetHeaderCard
                pet={pet}
                role={activeRole}
                onToggleRole={handleToggleRole}
                onBack={handleGoBack}
              />

              {/* Barra de título de la sección de consultas */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Historial de Consultas</Text>
                  <Text style={styles.sectionSubtitle}>
                    {consultations.length}{' '}
                    {consultations.length === 1 ? 'consulta registrada' : 'consultas registradas'}
                  </Text>
                </View>

                {/* Botón "Nueva consulta" EXCLUSIVO para rol VETERINARIA */}
                {isVet && (
                  <TouchableOpacity
                    style={styles.newConsultationButton}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.newConsultationButtonText}>Nueva consulta</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Mensaje informativo de permisos de prueba del MVP */}
              <View
                style={[
                  styles.roleInfoBanner,
                  isVet ? styles.roleInfoBannerVet : styles.roleInfoBannerOwner,
                ]}
              >
                <MaterialIcons
                  name={isVet ? 'check-circle' : 'visibility'}
                  size={16}
                  color={isVet ? '#04b639' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.roleInfoText,
                    isVet ? styles.roleInfoTextVet : styles.roleInfoTextOwner,
                  ]}
                >
                  {isVet
                    ? '[Prueba MVP - Veterinaria]: Puedes registrar nuevas consultas clínicas.'
                    : '[Prueba MVP - Dueño]: Modo solo lectura. No se permite crear ni editar consultas.'}
                </Text>
              </View>
            </View>
          }

          renderItem={({ item, index }) => (
            <ConsultationCard consultation={item} initialExpanded={index === 0} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-note" size={50} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin consultas clínicas</Text>
              <Text style={styles.emptySubtitle}>
                {isVet
                  ? 'Esta mascota aún no tiene consultas registradas. Tocá "Nueva consulta" para agregar la primera.'
                  : 'Esta mascota aún no registra consultas clínicas realizadas por una veterinaria.'}
              </Text>
            </View>
          }
        />

        {/* Modal para registrar una nueva consulta (solo para VETERINARIA) */}
        {isVet && (
          <NewConsultationModal
            visible={modalVisible}
            petName={pet.nombre}
            mascotaId={pet.id}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveConsultation}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  newConsultationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newConsultationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
  },
  roleInfoBannerVet: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  roleInfoBannerOwner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  roleInfoText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  roleInfoTextVet: {
    color: '#166534',
  },
  roleInfoTextOwner: {
    color: '#1E40AF',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#04b639',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
