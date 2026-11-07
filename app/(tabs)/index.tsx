import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { Palette, FontFamily } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SosIcon } from '@/components/SosIcon';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isVeterinario } = useAuth();
  const { isDark, colors } = useAppTheme();
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
                <Ionicons name="shield-checkmark-outline" size={14} color={isDark ? '#4ade80' : Palette.greenDeep} />
                <Text style={[styles.vetBadgeText, isDark && styles.vetBadgeTextDark]}>
                  Perfil Veterinario
                </Text>
              </View>
              <Text style={[styles.saludo, isDark && styles.textDark]}>
                ¡Hola, Dr. {nombreUsuario}!
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
                <Ionicons name="qr-code-outline" size={28} color={Palette.greenPrimary} />
              </View>
              <View style={[styles.heroActionBadge, isDark && styles.heroActionBadgeDark]}>
                <Text style={[styles.heroActionBadgeText, isDark && styles.heroActionBadgeTextDark]}>
                  Acción principal
                </Text>
              </View>
            </View>

            <Text style={[styles.heroVetTitle, isDark && styles.heroVetTitleDark]}>
              Escanear Paciente
            </Text>
            <Text style={[styles.heroVetSubtitle, isDark && styles.heroVetSubtitleDark]}>
              Identificación inmediata por código QR o etiqueta NFC para consultar o actualizar la ficha clínica.
            </Text>

            <View style={[styles.heroVetFooter, isDark && styles.heroVetFooterDark]}>
              <View style={styles.heroCtaButton}>
                <Ionicons name="camera-outline" size={17} color="#ffffff" />
                <Text style={styles.heroCtaText}>Abrir Escáner</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={isDark ? '#4ade80' : Palette.greenDeep} />
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
              <Ionicons name="search-outline" size={20} color={Palette.greenDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.searchCardTitle, isDark && styles.textDark]}>
                Buscar Mascota
              </Text>
              <Text style={[styles.searchCardSubtitle, isDark && styles.subtituloDark]}>
                Localizar paciente por nombre o ID clínico
              </Text>
            </View>
            <Ionicons name="arrow-forward-outline" size={18} color={isDark ? '#4ade80' : Palette.greenDeep} />
          </Pressable>

          {/* Sección de Gestión y Servicios Profesionales */}
          <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
            Accesos y Servicios
          </Text>

          <View style={styles.grid}>
            <BotonMenu
              titulo="Atención SOS"
              subtitulo="Guardias de turno"
              icono="alert-circle-outline"
              colorFondoIcono={isDark ? '#381616' : Palette.redSoft}
              colorIcono={Palette.redEmergency}
              onPress={() => router.push('/(tabs)/sos')}
              isDark={isDark}
              isAlert={true}
            />
            <BotonMenu
              titulo="Turnos"
              subtitulo="Agenda de citas"
              icono="calendar-outline"
              colorFondoIcono={isDark ? '#162F3B' : Palette.cyanLight}
              colorIcono={Palette.cyanDark}
              onPress={() => router.push('/turnos')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Mi Perfil"
              subtitulo="Datos profesionales"
              icono="person-outline"
              colorFondoIcono={isDark ? '#133324' : Palette.greenSoft}
              colorIcono={Palette.greenDeep}
              onPress={() => router.push('/(tabs)/perfil')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Mi Veterinaria"
              subtitulo="Clínica asociada"
              icono="medkit-outline"
              colorFondoIcono={isDark ? '#133324' : Palette.greenSoft}
              colorIcono={Palette.greenDeep}
              onPress={() => router.push('/veterinarias')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Recordatorios"
              subtitulo="Avisos sanitarios"
              icono="notifications-outline"
              colorFondoIcono={isDark ? '#381E10' : Palette.peachSoft}
              colorIcono={Palette.peachDark}
              onPress={() => router.push('/recordatorios')}
              isDark={isDark}
            />
            <BotonMenu
              titulo="Mapa Pilar"
              subtitulo="Clínicas y guardias"
              icono="compass-outline"
              colorFondoIcono={isDark ? '#162F3B' : Palette.cyanLight}
              colorIcono={Palette.cyanDark}
              onPress={() => router.push('/(tabs)/mapa')}
              isDark={isDark}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── 2. Vista de Inicio para Propietarios / Tutores ─────────────────────────
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
            <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>¿Qué necesita tu mascota hoy?</Text>
          </View>
          <ThemeToggleButton />
        </View>

        {/* HERO CARD DE EMERGENCIA SOS */}
        <Pressable
          style={({ pressed }) => [
            styles.sosHeroCard,
            isDark && styles.sosHeroCardDark,
            pressed && styles.botonPresionado,
          ]}
          onPress={() => router.push('/(tabs)/sos')}
          accessibilityRole="button"
          accessibilityLabel="Atención urgente SOS y guardia 24 horas"
        >
          <View style={styles.sosHeroHeader}>
            <View style={styles.sosHeroIconCircle}>
              <SosIcon size={24} focused variant="custom" />
            </View>
            <View style={styles.sosLiveBadge}>
              <View style={styles.sosPulseDot} />
              <Text style={styles.sosLiveBadgeText}>GUARDIA 24HS ACTIVA</Text>
            </View>
          </View>

          <Text style={styles.sosHeroTitle}>EMERGENCIAS SOS</Text>
          <Text style={[styles.sosHeroSubtitle, isDark && styles.sosHeroSubtitleDark]}>
            Línea directa y veterinarias con guardia nocturna en Pilar Centro
          </Text>

          <View style={styles.sosHeroFooter}>
            <View style={styles.sosActionChip}>
              <Ionicons name="call-outline" size={13} color="#ffffff" />
              <Text style={styles.sosActionChipText}>Atención Inmediata</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.sosVerGuardiaText}>Ver guardias</Text>
              <Ionicons name="chevron-forward-outline" size={15} color={Palette.redEmergency} />
            </View>
          </View>
        </Pressable>

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
              <Ionicons name="paw-outline" size={24} color={Palette.greenDeep} />
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
            <Ionicons name="chevron-forward-outline" size={16} color={isDark ? '#4ade80' : Palette.greenDeep} />
          </View>
        </Pressable>

        {/* Título de accesos rápidos */}
        <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>Servicios y Accesos</Text>

        {/* Grilla de accesos */}
        <View style={styles.grid}>
          <BotonMenu
            titulo="SOS Urgencias"
            subtitulo="Guardia 24hs"
            icono="alert-circle-outline"
            colorFondoIcono={isDark ? '#381616' : Palette.redSoft}
            colorIcono={Palette.redEmergency}
            onPress={() => router.push('/(tabs)/sos')}
            isDark={isDark}
            isAlert={true}
          />
          <BotonMenu
            titulo="Escanear QR"
            subtitulo="Identificar chapita"
            icono="qr-code-outline"
            colorFondoIcono={isDark ? '#133324' : Palette.greenSoft}
            colorIcono={Palette.greenDeep}
            onPress={() => router.push('/(tabs)/scan')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Mapa Pilar"
            subtitulo="15 lugares reales"
            icono="compass-outline"
            colorFondoIcono={isDark ? '#162F3B' : Palette.cyanLight}
            colorIcono={Palette.cyanDark}
            onPress={() => router.push('/(tabs)/mapa')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Veterinarias"
            subtitulo="Cercanas a vos"
            icono="medkit-outline"
            colorFondoIcono={isDark ? '#133324' : Palette.greenSoft}
            colorIcono={Palette.greenDeep}
            onPress={() => router.push('/veterinarias')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Recordatorios"
            subtitulo="Vacunas y controles"
            icono="notifications-outline"
            colorFondoIcono={isDark ? '#381E10' : Palette.peachSoft}
            colorIcono={Palette.peachDark}
            onPress={() => router.push('/recordatorios')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Turnos"
            subtitulo="Agenda de citas"
            icono="calendar-outline"
            colorFondoIcono={isDark ? '#162F3B' : Palette.cyanLight}
            colorIcono={Palette.cyanDark}
            onPress={() => router.push('/turnos')}
            isDark={isDark}
          />
          <BotonMenu
            titulo="Mi Perfil"
            subtitulo="Datos y ajustes"
            icono="person-outline"
            colorFondoIcono={isDark ? '#133324' : Palette.greenSoft}
            colorIcono={Palette.greenDeep}
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
  colorFondoIcono,
  colorIcono,
  onPress,
  isDark,
  isAlert,
}: {
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  colorFondoIcono?: string;
  colorIcono?: string;
  onPress: () => void;
  isDark?: boolean;
  isAlert?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.boton,
        isDark && styles.botonDark,
        isAlert && (isDark ? styles.botonAlertDark : styles.botonAlert),
        pressed && styles.botonPresionado,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View
        style={[
          styles.botonIconoContainer,
          colorFondoIcono && { backgroundColor: colorFondoIcono },
        ]}
      >
        <Ionicons name={icono} size={20} color={colorIcono || Palette.greenDeep} />
      </View>
      <Text style={[styles.botonTitulo, isDark && styles.textDark, isAlert && styles.botonAlertTitulo]}>
        {titulo}
      </Text>
      <Text style={[styles.botonSubtitulo, isDark && styles.subtituloDark, isAlert && styles.botonAlertSubtitulo]}>
        {subtitulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  containerDark: {
    backgroundColor: Palette.backgroundDark,
  },
  // ── Tarjeta de Emergencia SOS Destacada ─────────────────────────
  sosHeroCard: {
    backgroundColor: Palette.redSoft,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Palette.redBorder,
    shadowColor: Palette.redEmergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  sosHeroCardDark: {
    backgroundColor: '#381616',
    borderColor: '#7F1D1D',
    shadowOpacity: 0.35,
  },
  sosHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosHeroIconCircle: {
    backgroundColor: '#fee2e2',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  sosPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.redEmergency,
  },
  sosLiveBadgeText: {
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  sosHeroTitle: {
    fontSize: 19,
    fontFamily: FontFamily.headingBold,
    color: '#991B1B',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  sosHeroSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    lineHeight: 18,
    color: '#991B1B',
    marginBottom: 14,
  },
  sosHeroSubtitleDark: {
    color: '#FCA5A5',
  },
  sosHeroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  sosActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.redEmergency,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sosActionChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },
  sosVerGuardiaText: {
    color: Palette.redEmergency,
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },
  botonAlert: {
    borderColor: Palette.redBorder,
    backgroundColor: Palette.surfaceLight,
  },
  botonAlertDark: {
    borderColor: '#7F1D1D',
    backgroundColor: '#381616',
  },
  botonAlertTitulo: {
    color: '#991B1B',
  },
  botonAlertSubtitulo: {
    color: Palette.redEmergency,
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
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  subtitulo: {
    color: Palette.textSecondary,
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    marginTop: 3,
  },
  subtituloDark: {
    color: Palette.textSecondaryDark,
  },
  textDark: {
    color: Palette.textPrimaryDark,
  },
  cardMascotas: {
    backgroundColor: Palette.surfaceLight,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardMascotasDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
    shadowOpacity: 0.25,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrapper: {
    backgroundColor: Palette.greenSoft,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWrapperDark: {
    backgroundColor: '#133324',
  },
  cardBadge: {
    backgroundColor: Palette.greenPrimary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
    color: '#ffffff',
  },
  cardTitulo: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Palette.textPrimary,
  },
  cardTituloDark: {
    color: Palette.textPrimaryDark,
  },
  cardDetalle: {
    color: Palette.textSecondary,
    fontFamily: FontFamily.bodyRegular,
    marginTop: 4,
    fontSize: 14,
  },
  cardDetalleDark: {
    color: Palette.textSecondaryDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  cardFooterDark: {
    borderTopColor: Palette.borderDark,
  },
  cardLink: {
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
    marginRight: 4,
  },
  cardLinkDark: {
    color: '#4ade80',
  },
  seccionTitulo: {
    fontSize: 18,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boton: {
    width: '48%',
    backgroundColor: Palette.surfaceLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  botonDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
  },
  botonPresionado: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  botonIconoContainer: {
    backgroundColor: Palette.greenSoft,
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonTitulo: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  botonSubtitulo: {
    color: Palette.textSecondary,
    fontFamily: FontFamily.bodyRegular,
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
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  vetBadgeDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  vetBadgeText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vetBadgeTextDark: {
    color: '#4ade80',
  },
  heroCardVet: {
    backgroundColor: Palette.surfaceLight,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardVetDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: '#1F543B',
    shadowOpacity: 0.25,
  },
  heroVetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIconCircle: {
    backgroundColor: Palette.greenSoft,
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconCircleDark: {
    backgroundColor: '#133324',
  },
  heroActionBadge: {
    backgroundColor: Palette.greenPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroActionBadgeDark: {
    backgroundColor: '#15803D',
  },
  heroActionBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroActionBadgeTextDark: {
    color: '#ffffff',
  },
  heroVetTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  heroVetTitleDark: {
    color: Palette.textPrimaryDark,
  },
  heroVetSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    lineHeight: 20,
    color: Palette.textSecondary,
    marginBottom: 16,
  },
  heroVetSubtitleDark: {
    color: Palette.textSecondaryDark,
  },
  heroVetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  heroVetFooterDark: {
    borderTopColor: Palette.borderDark,
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.greenDeep,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroCtaText: {
    color: '#ffffff',
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
  },
  searchCardVet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceLight,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 14,
  },
  searchCardVetDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
  },
  searchIconWrapper: {
    backgroundColor: Palette.greenSoft,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconWrapperDark: {
    backgroundColor: '#133324',
  },
  searchCardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.headingSemiBold,
    color: Palette.textPrimary,
  },
  searchCardSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
