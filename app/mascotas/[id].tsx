import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MascotaDetalleScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const params = useLocalSearchParams<{
    id: string;
    nombre?: string;
    especie?: string;
    raza?: string;
    sexo?: string;
    peso?: string;
    edad?: string;
    fotoUrl?: string;
    descripcion?: string;
  }>();

  const isMale = params.sexo?.toLowerCase().includes('macho');

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Navbar */}
      <View style={[styles.navbar, isDark && styles.navbarDark]}>
        <TouchableOpacity
          style={[styles.backButton, isDark && styles.buttonDark]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#fafafa' : '#0f172a'} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDark && styles.textDark]}>
          Detalle de {params.nombre || 'Mascota'}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, isDark && styles.buttonDark]}
          activeOpacity={0.7}
          onPress={() => alert('Opción de editar próximamente')}
        >
          <Ionicons name="create-outline" size={20} color="#04b639" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner / Foto Principal */}
        <View style={styles.imageCard}>
          {params.fotoUrl ? (
            <Image
              source={{ uri: params.fotoUrl }}
              style={styles.petImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.imageFallback, isDark && styles.cardDark]}>
              <MaterialIcons name="pets" size={72} color="#04b639" />
            </View>
          )}

          <View style={styles.speciesFloatingBadge}>
            <Text style={styles.speciesFloatingText}>
              {params.especie === 'Gato' ? '🐱 Gato' : '🐶 Perro'}
            </Text>
          </View>
        </View>

        {/* Datos Principales */}
        <View style={[styles.infoCard, isDark && styles.cardDark]}>
          <View style={styles.nameHeader}>
            <View>
              <Text style={[styles.petName, isDark && styles.textDark]}>
                {params.nombre || 'Sin nombre'}
              </Text>
              <Text style={styles.petBreed}>
                {params.raza || 'Raza no especificada'}
              </Text>
            </View>
            <View
              style={[
                styles.genderTag,
                { backgroundColor: isMale ? '#dbeafe' : '#fce7f3' },
              ]}
            >
              <Ionicons
                name={isMale ? 'male' : 'female'}
                size={14}
                color={isMale ? '#1d4ed8' : '#be185d'}
              />
              <Text style={[styles.genderTagText, { color: isMale ? '#1d4ed8' : '#be185d' }]}>
                {params.sexo || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Ficha técnica rápida */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="scale" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Peso</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>
                {params.peso || 'N/A'}
              </Text>
            </View>

            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="cake" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Edad</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>
                {params.edad || 'N/A'}
              </Text>
            </View>

            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="verified" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Estado</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>Al día</Text>
            </View>
          </View>

          {/* Descripción / Notas */}
          {params.descripcion ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Notas</Text>
              <Text style={[styles.sectionBody, isDark && styles.textSecondaryDark]}>
                {params.descripcion}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Secciones de Salud & Historial */}
        <View style={[styles.infoCard, isDark && styles.cardDark, { marginTop: 14 }]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Historial Clínico</Text>
          <View style={styles.historyRow}>
            <View style={styles.historyDot} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyTitle, isDark && styles.textDark]}>Vacunación antirrábica</Text>
              <Text style={styles.historySubtitle}>Aplicada hace 3 meses • Refuerzo anual</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#04b639" />
          </View>
          <View style={[styles.historyRow, { borderBottomWidth: 0 }]}>
            <View style={styles.historyDot} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyTitle, isDark && styles.textDark]}>Control antiparasitario</Text>
              <Text style={styles.historySubtitle}>Próxima dosis recomendada en 30 días</Text>
            </View>
            <Ionicons name="time-outline" size={20} color="#f59e0b" />
          </View>
        </View>

        {/* Botón de volver */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeBtnText}>Volver a Mis Mascotas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  navbarDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#27272a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  petImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f1f5f9',
  },
  imageFallback: {
    width: '100%',
    height: 240,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speciesFloatingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  speciesFloatingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  nameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  petBreed: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
  },
  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  genderTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  section: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#04b639',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  historySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  backHomeBtn: {
    marginTop: 24,
    backgroundColor: '#04b639',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  textDark: {
    color: '#fafafa',
  },
  textSecondaryDark: {
    color: '#a1a1aa',
  },
});
