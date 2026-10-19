import { useAuth } from '@/context/AuthContext';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const { petCount, refresh: refreshPets } = usePets();

  const nombreUsuario = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  useFocusEffect(
    useCallback(() => {
      refreshPets();
    }, [refreshPets])
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado con Saludo y Botón de Tema */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.saludo, isDark && styles.textDark]}>¡Hola, {nombreUsuario}! 👋</Text>
            <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>¿Qué necesitas hoy?</Text>
          </View>
          <ThemeToggleButton />
        </View>

        {/* Tarjeta de mascotas / perfiles */}
        <Pressable
          style={({ pressed }) => [
            styles.cardMascotas,
            isDark && styles.cardMascotasDark,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.push('/(tabs)/mascotas')}
          accessibilityRole="button"
          accessibilityLabel="Ver mis mascotas"
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrapper, isDark && styles.cardIconWrapperDark]}>
              <Ionicons name="paw" size={24} color="#04b639" />
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardNumero}>{petCount}</Text>
            </View>
          </View>

          <Text style={[styles.cardTitulo, isDark && styles.cardTituloDark]}>Mis mascotas</Text>
          <Text style={[styles.cardDetalle, isDark && styles.cardDetalleDark]}>
            {petCount === 1 ? '1 mascota registrada' : `${petCount} mascotas registradas`}
          </Text>

          <View style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
            <Text style={[styles.cardLink, isDark && styles.cardLinkDark]}>Ver perfiles y detalles</Text>
            <Ionicons name="chevron-forward" size={16} color="#04b639" />
          </View>
        </Pressable>

        {/* Banner Asistente IA VetLink */}
        <Pressable
          style={({ pressed }) => [
            styles.aiCard,
            isDark && styles.aiCardDark,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.push('/chat' as any)}
          accessibilityRole="button"
          accessibilityLabel="Consultar al Asistente IA VetLink"
        >
          <View style={styles.aiCardContent}>
            <View style={[styles.aiIconCircle, isDark && styles.aiIconCircleDark]}>
              <Ionicons name="sparkles" size={22} color="#04b639" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.aiCardTitulo, isDark && styles.textDark]}>
                  Asistente IA VetLink
                </Text>
                <View style={styles.aiBadgeNew}>
                  <Text style={styles.aiBadgeNewText}>IA</Text>
                </View>
              </View>
              <Text style={[styles.aiCardSubtitulo, isDark && styles.subtituloDark]}>
                Consultas sobre cuidados, nutrición, prevención y orientación
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#04b639" />
          </View>
        </Pressable>

        {/* Título de accesos rápidos */}
        <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>Servicios y Accesos</Text>

        {/* Grilla de 6 botones */}
        <View style={styles.grid}>
          <BotonMenu
            titulo="Escanear QR"
            subtitulo="Identificar o vincular"
            icono="qr-code-outline"
            onPress={() => router.push('/(tabs)/scan')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Veterinarias"
            subtitulo="Cercanas a vos"
            icono="medkit-outline"
            onPress={() => router.push('/veterinarias')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Recordatorios"
            subtitulo="Avisos importantes"
            icono="notifications-outline"
            onPress={() => router.push('/recordatorios')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Turnos"
            subtitulo="Próximos y anteriores"
            icono="calendar-outline"
            onPress={() => router.push('/turnos')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Mapa"
            subtitulo="Ubicación y clínicas"
            icono="map-outline"
            onPress={() => router.push('/(tabs)/mapa')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Tienda"
            subtitulo="Productos para mascotas"
            icono="bag-handle-outline"
            onPress={() => router.push('/(tabs)/tienda')}
            isDark={isDark}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BotonMenu({
  titulo,
  subtitulo,
  icono,
  onPress,
  isDark,
}: {
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isDark?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.boton,
        isDark && styles.botonDark,
        pressed && styles.botonPresionado,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={[styles.botonIconoContainer, isDark && styles.botonIconoContainerDark]}>
        <Ionicons name={icono} size={22} color="#04b639" />
      </View>
      <Text style={[styles.botonTitulo, isDark && styles.textDark]}>{titulo}</Text>
      <Text style={[styles.botonSubtitulo, isDark && styles.subtituloDark]}>{subtitulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  saludo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitulo: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 4,
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
  },
  cardMascotas: {
    backgroundColor: '#f0fdf4',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMascotasDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
    shadowOpacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrapper: {
    backgroundColor: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWrapperDark: {
    backgroundColor: '#1f2937',
  },
  cardBadge: {
    backgroundColor: '#04b639',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardTitulo: {
    fontWeight: '800',
    fontSize: 18,
    color: '#14532d',
  },
  cardTituloDark: {
    color: '#86efac',
  },
  cardDetalle: {
    color: '#166534',
    marginTop: 4,
    fontSize: 14,
  },
  cardDetalleDark: {
    color: '#bbf7d0',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  cardFooterDark: {
    borderTopColor: '#166534',
  },
  cardLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#04b639',
    marginRight: 4,
  },
  cardLinkDark: {
    color: '#4ade80',
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boton: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  botonDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  botonPresionado: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  botonIconoContainer: {
    backgroundColor: '#dcfce7',
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonIconoContainerDark: {
    backgroundColor: '#064e3b',
  },
  botonTitulo: {
    fontWeight: '700',
    fontSize: 15,
    color: '#0f172a',
  },
  botonSubtitulo: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  aiCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  aiCardDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
    shadowOpacity: 0.25,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconCircleDark: {
    backgroundColor: '#064e3b',
  },
  aiCardTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  aiCardSubtitulo: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  aiBadgeNew: {
    backgroundColor: '#04b639',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeNewText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
