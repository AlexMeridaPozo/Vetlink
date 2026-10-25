import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isVeterinario } = useAuth();
  const { isDark } = useAppTheme();
  const { petCount, refresh: refreshPets } = usePets();

  const nombreUsuario = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  useFocusEffect(
    useCallback(() => {
      refreshPets();
    }, [refreshPets])
  );

  // ── 1. Vista de Inicio para el Profesional Veterinario ────────────────────────
  if (isVeterinario) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Encabezado con Saludo Profesional y Botón de Tema */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={[styles.vetBadge, isDark && styles.vetBadgeDark]}>
                <Ionicons name="shield-checkmark" size={13} color={isDark ? '#4ade80' : '#15803d'} />
                <Text style={[styles.vetBadgeText, isDark && styles.vetBadgeTextDark]}>
                  Perfil Veterinario
                </Text>
              </View>
              <Text style={[styles.saludo, isDark && styles.textDark]}>
                ¡Hola, {nombreUsuario}! 🩺
              </Text>
              <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>
                Panel de atención y gestión clínica
              </Text>
            </View>
            <ThemeToggleButton />
          </View>

          {/* ACCESO PRINCIPAL Y DESTACADO: Escanear Mascota */}
          <Pressable
            style={({ pressed }) => [
              styles.heroCardVet,
              isDark && styles.heroCardVetDark,
              pressed && styles.botonPresionado,
            ]}
            onPress={() => router.push('/(tabs)/scan')}
            accessibilityRole="button"
            accessibilityLabel="Escanear mascota mediante QR o NFC"
          >
            <View style={styles.heroVetTop}>
              <View style={[styles.heroIconCircle, isDark && styles.heroIconCircleDark]}>
                <Ionicons name="qr-code" size={32} color="#04b639" />
              </View>
              <View style={[styles.heroActionBadge, isDark && styles.heroActionBadgeDark]}>
                <Text style={[styles.heroActionBadgeText, isDark && styles.heroActionBadgeTextDark]}>
                  Acción principal
                </Text>
              </View>
            </View>

            <Text style={[styles.heroVetTitle, isDark && styles.heroVetTitleDark]}>
              Escanear Mascota
            </Text>
            <Text style={[styles.heroVetSubtitle, isDark && styles.heroVetSubtitleDark]}>
              Identificación inmediata por código QR o etiqueta NFC para consultar la ficha clínica del paciente.
            </Text>

            <View style={[styles.heroVetFooter, isDark && styles.heroVetFooterDark]}>
              <View style={styles.heroCtaButton}>
                <Ionicons name="camera-outline" size={18} color="#ffffff" />
                <Text style={styles.heroCtaText}>Abrir Escáner</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#4ade80' : '#04b639'} />
            </View>
          </Pressable>

          {/* ACCESO SECUNDARIO: Buscar Mascota */}
          <Pressable
            style={({ pressed }) => [
              styles.searchCardVet,
              isDark && styles.searchCardVetDark,
              pressed && styles.botonPresionado,
            ]}
            onPress={() => router.push('/(tabs)/mascotas')}
            accessibilityRole="button"
            accessibilityLabel="Buscar mascota por nombre o identificador"
          >
            <View style={[styles.searchIconWrapper, isDark && styles.searchIconWrapperDark]}>
              <Ionicons name="search" size={22} color="#04b639" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.searchCardTitle, isDark && styles.textDark]}>
                Buscar Mascota
              </Text>
              <Text style={[styles.searchCardSubtitle, isDark && styles.subtituloDark]}>
                Localizar paciente por nombre o ID clínico
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={isDark ? '#4ade80' : '#04b639'} />
          </Pressable>

          {/* Sección de Gestión y Servicios Profesionales */}
          <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
            Accesos y Servicios
          </Text>

          <View style={styles.grid}>
            <BotonMenu
              titulo="Turnos"
              subtitulo="Agenda de citas"
              icono="calendar-outline"
              onPress={() => router.push('/turnos')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Mi Perfil"
              subtitulo="Datos profesionales"
              icono="person-outline"
              onPress={() => router.push('/(tabs)/perfil')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Mi Veterinaria"
              subtitulo="Clínica asociada"
              icono="medkit-outline"
              onPress={() => router.push('/veterinarias')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Recordatorios"
              subtitulo="Avisos sanitarios"
              icono="notifications-outline"
              onPress={() => router.push('/recordatorios')}
              isDark={isDark}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 2. Vista de Inicio para Propietarios / Tutores (Sin Tienda) ─────────────
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

        {/* Título de accesos rápidos */}
        <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>Servicios y Accesos</Text>

        {/* Grilla de accesos (Sin tienda) */}
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
            titulo="Mi Perfil"
            subtitulo="Datos y ajustes"
            icono="person-outline"
            onPress={() => router.push('/(tabs)/perfil')}
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
  // ── Estilos específicos del Perfil Veterinario ──────────────────────────────
  vetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  vetBadgeDark: {
    backgroundColor: '#064e3b',
  },
  vetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vetBadgeTextDark: {
    color: '#4ade80',
  },
  heroCardVet: {
    backgroundColor: '#ecfdf5',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardVetDark: {
    backgroundColor: '#064e3b26',
    borderColor: '#059669',
    shadowOpacity: 0.3,
  },
  heroVetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconCircle: {
    backgroundColor: '#ffffff',
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIconCircleDark: {
    backgroundColor: '#1f2937',
  },
  heroActionBadge: {
    backgroundColor: '#04b639',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroActionBadgeDark: {
    backgroundColor: '#16a34a',
  },
  heroActionBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroActionBadgeTextDark: {
    color: '#ffffff',
  },
  heroVetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 6,
  },
  heroVetTitleDark: {
    color: '#6ee7b7',
  },
  heroVetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#047857',
    marginBottom: 16,
  },
  heroVetSubtitleDark: {
    color: '#a7f3d0',
  },
  heroVetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
  },
  heroVetFooterDark: {
    borderTopColor: '#065f46',
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#04b639',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroCtaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  searchCardVet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  searchCardVetDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  searchIconWrapper: {
    backgroundColor: '#dcfce7',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconWrapperDark: {
    backgroundColor: '#064e3b',
  },
  searchCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  searchCardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
