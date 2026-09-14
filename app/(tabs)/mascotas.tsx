import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  peso: string | number;
  edad: string | number;
  fotoUrl?: string;
  userId?: string;
  ownerId?: string;
  descripcion?: string;
}

// Datos mock iniciales para pruebas si Firestore aún no tiene registros
export const MOCK_MASCOTAS: Mascota[] = [
  {
    id: 'mock-1',
    nombre: 'Max',
    especie: 'Perro',
    raza: 'Golden Retriever',
    sexo: 'Macho',
    peso: '28 kg',
    edad: '3 años',
    fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Muy cariñoso y juguetón. Tiene todas sus vacunas al día.',
  },
  {
    id: 'mock-2',
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    sexo: 'Hembra',
    peso: '4.2 kg',
    edad: '2 años',
    fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Tranquila, adora dormir bajo el sol y jugar con pelotitas.',
  },
  {
    id: 'mock-3',
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Bulldog Francés',
    sexo: 'Macho',
    peso: '12.5 kg',
    edad: '1 año',
    fotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    descripcion: 'Enérgico y sociable con otros animales.',
  },
];

export default function MascotasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [showForcedEmpty, setShowForcedEmpty] = useState(false);

  const loadMascotas = useCallback(async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setMascotas(MOCK_MASCOTAS);
        setIsUsingMock(true);
        return;
      }

      const mascotasRef = collection(db, 'mascotas');
      let docsList: Mascota[] = [];

      try {
        const q = query(
          mascotasRef,
          or(where('userId', '==', user.uid), where('ownerId', '==', user.uid))
        );
        const snapshot = await getDocs(q);
        docsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Mascota, 'id'>),
        }));
      } catch (orError) {
        console.warn('Consulta OR no disponible, ejecutando fallback:', orError);
        const q1 = query(mascotasRef, where('userId', '==', user.uid));
        const q2 = query(mascotasRef, where('ownerId', '==', user.uid));
        const [snap1, snap2] = await Promise.all([
          getDocs(q1).catch(() => null),
          getDocs(q2).catch(() => null),
        ]);

        const map = new Map<string, Mascota>();
        snap1?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Mascota));
        snap2?.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Mascota));
        docsList = Array.from(map.values());
      }

      if (docsList.length === 0) {
        setMascotas(MOCK_MASCOTAS);
        setIsUsingMock(true);
      } else {
        setMascotas(docsList);
        setIsUsingMock(false);
      }
    } catch (error) {
      console.error('Error al obtener mascotas de Firestore:', error);
      setMascotas(MOCK_MASCOTAS);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadMascotas();
      }
    });

    return () => {
      active = false;
    };
  }, [loadMascotas]);

  const onRefresh = () => {
    setRefreshing(true);
    setShowForcedEmpty(false);
    loadMascotas();
  };

  const handlePetPress = (pet: Mascota) => {
    router.push({
      pathname: '/mascotas/[id]',
      params: {
        id: pet.id,
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        sexo: pet.sexo,
        peso: String(pet.peso),
        edad: String(pet.edad),
        fotoUrl: pet.fotoUrl || '',
        descripcion: pet.descripcion || '',
      },
    });
  };

  const handleRegisterPress = () => {
    Alert.alert(
      'Registrar Mascota',
      '¿Deseas dar de alta una nueva mascota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // Preparado para conectar con la futura pantalla de registro o modal
            router.push('/modal');
          },
        },
      ]
    );
  };

  const displayedList = showForcedEmpty ? [] : mascotas;

  const renderPetCard = ({ item }: { item: Mascota }) => {
    const isMale = item.sexo?.toLowerCase().includes('macho');

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isDark && styles.cardDark,
          { borderColor: isDark ? '#27272a' : '#e4e4e7' },
        ]}
        activeOpacity={0.85}
        onPress={() => handlePetPress(item)}
      >
        <View style={styles.cardHeader}>
          {/* Foto o Avatar */}
          <View style={styles.avatarContainer}>
            {item.fotoUrl ? (
              <Image
                source={{ uri: item.fotoUrl }}
                style={styles.avatar}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: isDark ? '#27272a' : '#f0fdf4' }]}>
                <MaterialIcons name="pets" size={32} color="#04b639" />
              </View>
            )}
            <View style={styles.speciesBadge}>
              <Text style={styles.speciesBadgeText}>
                {item.especie === 'Gato' ? '🐱' : '🐶'}
              </Text>
            </View>
          </View>

          {/* Información Principal */}
          <View style={styles.petInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.petName, isDark && styles.textDark]}>{item.nombre}</Text>
              <View
                style={[
                  styles.genderBadge,
                  { backgroundColor: isMale ? '#dbeafe' : '#fce7f3' },
                ]}
              >
                <Ionicons
                  name={isMale ? 'male' : 'female'}
                  size={12}
                  color={isMale ? '#1d4ed8' : '#be185d'}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: isMale ? '#1d4ed8' : '#be185d' },
                  ]}
                >
                  {item.sexo}
                </Text>
              </View>
            </View>

            <Text style={styles.petBreed}>
              {item.especie} • {item.raza}
            </Text>

            {/* Fila de Peso y Edad */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
                <MaterialIcons name="scale" size={14} color="#04b639" />
                <Text style={[styles.metricText, isDark && styles.textSecondaryDark]}>
                  {item.peso}
                </Text>
              </View>

              <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
                <MaterialIcons name="cake" size={14} color="#04b639" />
                <Text style={[styles.metricText, isDark && styles.textSecondaryDark]}>
                  {item.edad}
                </Text>
              </View>
            </View>
          </View>

          {/* Flecha indicadora */}
          <View style={styles.arrowContainer}>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isDark ? '#71717a' : '#a1a1aa'}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, isDark && styles.emptyIconCircleDark]}>
        <MaterialIcons name="pets" size={56} color="#04b639" />
      </View>
      <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
        No tienes mascotas registradas
      </Text>
      <Text style={[styles.emptySubtitle, isDark && styles.textSecondaryDark]}>
        Registra a tu primer compañero peludo para gestionar sus consultas, vacunas y recordatorios.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleRegisterPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
        <Text style={styles.emptyButtonText}>Registrar mi primera mascota</Text>
      </TouchableOpacity>

      {showForcedEmpty && (
        <TouchableOpacity
          style={styles.restoreMockButton}
          onPress={() => setShowForcedEmpty(false)}
        >
          <Text style={styles.restoreMockText}>Restaurar datos de prueba</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Superior */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={styles.headerBrand}>VetLink</Text>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Mis Mascotas</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.reloadButton, isDark && styles.actionButtonDark]}
            onPress={onRefresh}
            activeOpacity={0.7}
            accessibilityLabel="Recargar mascotas"
          >
            <Ionicons name="refresh-outline" size={20} color={isDark ? '#fafafa' : '#18181b'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerPrimaryButton}
            onPress={handleRegisterPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.headerPrimaryButtonText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner Informativo de Modo Mock / Pruebas */}
      {isUsingMock && !showForcedEmpty && (
        <View style={[styles.mockNoticeBanner, isDark && styles.mockNoticeBannerDark]}>
          <Ionicons name="information-circle" size={16} color="#04b639" />
          <Text style={[styles.mockNoticeText, isDark && styles.mockNoticeTextDark]}>
            Modo prueba: mostrando {mascotas.length} mascotas de ejemplo.
          </Text>
          <TouchableOpacity
            style={styles.mockToggleBtn}
            onPress={() => setShowForcedEmpty(true)}
          >
            <Text style={styles.mockToggleBtnText}>Simular vacío</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contenido Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#04b639" />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            Cargando tus mascotas...
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          contentContainerStyle={[
            styles.listContent,
            displayedList.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#04b639']}
              tintColor="#04b639"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botón Flotante (FAB) */}
      {displayedList.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleRegisterPress}
          activeOpacity={0.85}
          accessibilityLabel="Registrar Mascota"
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeAreaDark: {
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  headerBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: '#04b639',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reloadButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#27272a',
  },
  headerPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  headerPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  mockNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
    gap: 6,
  },
  mockNoticeBannerDark: {
    backgroundColor: '#064e3b',
    borderBottomColor: '#047857',
  },
  mockNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    fontWeight: '500',
  },
  mockNoticeTextDark: {
    color: '#a7f3d0',
  },
  mockToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#04b639',
  },
  mockToggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#04b639',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#18181b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speciesBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  speciesBadgeText: {
    fontSize: 13,
  },
  petInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  petBreed: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricItemDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  arrowContainer: {
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircleDark: {
    backgroundColor: '#064e3b',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  restoreMockButton: {
    marginTop: 18,
    padding: 8,
  },
  restoreMockText: {
    color: '#04b639',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#04b639',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  textDark: {
    color: '#fafafa',
  },
  textSecondaryDark: {
    color: '#a1a1aa',
  },
});
