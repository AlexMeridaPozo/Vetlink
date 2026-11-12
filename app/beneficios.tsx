import React, { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  BENEFICIOS_MOCK,
  BENEFICIOS_THEME as THEME,
  CATEGORIAS_FILTRO,
  type Beneficio,
  type CategoriaFiltro,
  type TipoBeneficio,
} from '@/constants/beneficios';
import { FontFamily, Palette, Radius } from '@/constants/theme';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';

function getIconByTipo(tipo: TipoBeneficio): keyof typeof Ionicons.glyphMap {
  switch (tipo) {
    case 'pelu':
      return 'cut';
    case 'pet':
      return 'storefront';
    case 'vet':
      return 'medkit';
    default:
      return 'gift';
  }
}

export default function BeneficiosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaFiltro>('Todos');
  const [beneficioSeleccionado, setBeneficioSeleccionado] =
    useState<Beneficio | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Beneficio destacado (Paseo Champagnat)
  const beneficioDestacado = useMemo(() => {
    return BENEFICIOS_MOCK.find((b) => b.destacado) || BENEFICIOS_MOCK[0];
  }, []);

  // Filtrado reactivo de beneficios
  const beneficiosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todos') {
      return BENEFICIOS_MOCK;
    }
    if (categoriaSeleccionada === 'Peluquería') {
      return BENEFICIOS_MOCK.filter((b) => b.tipo === 'pelu');
    }
    if (categoriaSeleccionada === 'Petshops') {
      return BENEFICIOS_MOCK.filter((b) => b.tipo === 'pet');
    }
    if (categoriaSeleccionada === 'Veterinarias') {
      return BENEFICIOS_MOCK.filter((b) => b.tipo === 'vet');
    }
    return BENEFICIOS_MOCK;
  }, [categoriaSeleccionada]);

  const handleVolver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const abrirDetalle = (beneficio: Beneficio) => {
    setBeneficioSeleccionado(beneficio);
    setModalVisible(true);
  };

  const cerrarDetalle = () => {
    setModalVisible(false);
  };

  const irAlMapa = (lugarId?: string) => {
    cerrarDetalle();
    router.push({
      pathname: '/(tabs)/mapa',
      params: lugarId ? { focusId: lugarId } : undefined,
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, isDark && styles.safeAreaDark]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        style={[styles.scrollView, isDark && styles.scrollViewDark]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra superior de navegación con botón volver y toggle de tema */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.backButton, isDark && styles.backButtonDark]}
            onPress={handleVolver}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? THEME.ink : Palette.textPrimary}
            />
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>
            Club de Beneficios
          </Text>
          <Text style={[styles.headerSubtitle, isDark && styles.textMutedDark]}>
            Descuentos reales en veterinarias y petshops adheridos del mapa de Pilar.
          </Text>
        </View>

        {/* Beneficio Destacado (Banner Superior) */}
        <TouchableOpacity
          style={styles.featuredTouch}
          activeOpacity={0.92}
          onPress={() => abrirDetalle(beneficioDestacado)}
          accessibilityRole="button"
          accessibilityLabel={`Beneficio destacado: ${beneficioDestacado.comercio}, ${beneficioDestacado.descuento}`}
        >
          <LinearGradient
            colors={isDark ? [THEME.h1, THEME.h2] : ['#0A5F35', '#064224']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.featuredCard, isDark ? styles.featuredCardDark : styles.featuredCardLight]}
          >
            <View style={styles.featuredHeaderRow}>
              <View style={styles.featuredBadgePill}>
                <Text style={styles.featuredLabel}>Comercio destacado en Pilar</Text>
              </View>
              <Ionicons name="sparkles" size={16} color={isDark ? THEME.g : '#86efac'} />
            </View>

            <View style={styles.offBadgeContainer}>
              <View style={styles.offBadge}>
                <Text style={styles.offBadgeText}>20% OFF</Text>
              </View>
            </View>

            <Text style={styles.featuredTitle}>{beneficioDestacado.titulo}</Text>
            <Text style={styles.featuredCommerce}>{beneficioDestacado.comercio}</Text>

            <View style={styles.featuredMapHint}>
              <Ionicons name="location-sharp" size={14} color="#86efac" />
              <Text style={styles.featuredMapHintText}>
                {beneficioDestacado.direccion} • {beneficioDestacado.distancia}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Filtros (Categorías - Estilo 'Chips') */}
        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {CATEGORIAS_FILTRO.map((categoria) => {
              const activo = categoriaSeleccionada === categoria;
              return (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.chip,
                    isDark
                      ? activo
                        ? styles.chipActivoDark
                        : styles.chipInactivoDark
                      : activo
                      ? styles.chipActivoLight
                      : styles.chipInactivoLight,
                  ]}
                  onPress={() => setCategoriaSeleccionada(categoria)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={`Filtrar por ${categoria}`}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isDark
                        ? activo
                          ? styles.chipTextActivoDark
                          : styles.chipTextInactivoDark
                        : activo
                        ? styles.chipTextActivoLight
                        : styles.chipTextInactivoLight,
                    ]}
                  >
                    {categoria}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Título de Sección de Lista */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Cupones en Pilar
          </Text>
          <Text style={[styles.sectionCount, isDark && styles.textMutedDark]}>
            {beneficiosFiltrados.length}{' '}
            {beneficiosFiltrados.length === 1 ? 'comercio activo' : 'comercios activos'}
          </Text>
        </View>

        {/* Lista de Tarjetas (Cards) */}
        <View style={styles.cardsList}>
          {beneficiosFiltrados.map((beneficio) => {
            const iconName = getIconByTipo(beneficio.tipo);
            return (
              <View
                key={beneficio.id}
                style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
              >
                <TouchableOpacity
                  style={styles.cardMainTouch}
                  activeOpacity={0.88}
                  onPress={() => abrirDetalle(beneficio)}
                  accessibilityRole="button"
                  accessibilityLabel={`${beneficio.comercio}, ${beneficio.descuento}, ${beneficio.titulo}`}
                >
                  {/* Ícono de la Tarjeta (.ico) */}
                  <View style={[styles.ico, isDark ? styles.icoDark : styles.icoLight]}>
                    <Ionicons
                      name={iconName}
                      size={24}
                      color={isDark ? THEME.g : Palette.greenDeep}
                    />
                  </View>

                  {/* Contenido de la Tarjeta */}
                  <View style={styles.cardContent}>
                    {/* Fila Superior: Nombre del comercio y Etiqueta de Descuento */}
                    <View style={styles.cardTopRow}>
                      <Text
                        style={[styles.comercioNombre, isDark && styles.textDark]}
                        numberOfLines={1}
                      >
                        {beneficio.comercio}
                      </Text>
                      <View style={[styles.tag, isDark ? styles.tagDark : styles.tagLight]}>
                        <Text style={[styles.tagText, isDark ? styles.tagTextDark : styles.tagTextLight]}>
                          {beneficio.descuento}
                        </Text>
                      </View>
                    </View>

                    {/* Título del Beneficio */}
                    <Text
                      style={[styles.beneficioTitulo, isDark && styles.textMutedDark]}
                    >
                      {beneficio.titulo}
                    </Text>

                    {/* Dirección real del mapa */}
                    <View style={styles.addressRow}>
                      <Ionicons
                        name="location-sharp"
                        size={13}
                        color={isDark ? '#4ade80' : Palette.greenDeep}
                      />
                      <Text
                        style={[styles.addressText, isDark && styles.textMutedDark]}
                        numberOfLines={1}
                      >
                        {beneficio.direccion}
                      </Text>
                    </View>

                    {/* Fila Meta (.meta): Distancia y Validez */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="walk-outline"
                          size={13.5}
                          color={isDark ? THEME.muted : Palette.textMuted}
                        />
                        <Text style={[styles.metaText, isDark && styles.textMutedDark]}>
                          {beneficio.distancia}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={13.5}
                          color={isDark ? THEME.muted : Palette.textMuted}
                        />
                        <Text style={[styles.metaText, isDark && styles.textMutedDark]}>
                          {beneficio.validez}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Botones de acción rápida en fila: Ver cupón y Ver en mapa */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.btn, isDark ? styles.btnDark : styles.btnLight, { flex: 1 }]}
                    onPress={() => abrirDetalle(beneficio)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver cupón de ${beneficio.comercio}`}
                  >
                    <Text style={[styles.btnText, isDark ? styles.btnTextDark : styles.btnTextLight]}>
                      Ver cupón
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.mapIconButton, isDark && styles.mapIconButtonDark]}
                    onPress={() => irAlMapa(beneficio.lugarId)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver ${beneficio.comercio} en el mapa interactivo de Pilar`}
                  >
                    <Ionicons
                      name="map"
                      size={16}
                      color={isDark ? '#4ade80' : Palette.greenDeep}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal / Bottom Sheet (Detalle del Beneficio) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cerrarDetalle}
      >
        <View style={styles.modalOverlay}>
          {/* Fondo oscuro cerrable al presionar */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={cerrarDetalle}
            accessibilityRole="button"
            accessibilityLabel="Cerrar ventana emergente"
          />

          {/* Hoja Inferior (.sheet) */}
          <View
            style={[
              styles.sheet,
              isDark ? styles.sheetDark : styles.sheetLight,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            {/* Manija de arrastre visual */}
            <View style={[styles.sheetHandle, isDark ? styles.sheetHandleDark : styles.sheetHandleLight]} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.sheetScroll}
            >
              {/* Encabezado del Sheet */}
              <View style={styles.sheetHeaderRow}>
                <Text style={[styles.sheetTitle, isDark && styles.textDark]}>
                  {beneficioSeleccionado?.comercio}
                </Text>
                <TouchableOpacity
                  onPress={cerrarDetalle}
                  style={styles.sheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar detalle"
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? THEME.muted : Palette.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Descuento grande (.off) */}
              <Text style={[styles.sheetOff, isDark ? styles.sheetOffDark : styles.sheetOffLight]}>
                {beneficioSeleccionado?.descuento}
              </Text>

              {/* Título detallado del beneficio */}
              <Text style={[styles.sheetBenefitTitle, isDark && styles.textDark]}>
                {beneficioSeleccionado?.titulo}
              </Text>

              {/* Caja de información de localidad real vinculada al mapa */}
              <View
                style={[
                  styles.localInfoBox,
                  isDark ? styles.localInfoBoxDark : styles.localInfoBoxLight,
                ]}
              >
                <View style={styles.localInfoRow}>
                  <Ionicons
                    name="location"
                    size={18}
                    color={isDark ? '#4ade80' : Palette.greenDeep}
                  />
                  <Text style={[styles.localInfoText, isDark && styles.textDark]}>
                    {beneficioSeleccionado?.direccion}
                  </Text>
                </View>

                {beneficioSeleccionado?.telefono && (
                  <View style={styles.localInfoRow}>
                    <Ionicons
                      name="call-outline"
                      size={17}
                      color={isDark ? '#4ade80' : Palette.greenDeep}
                    />
                    <Text style={[styles.localInfoText, isDark && styles.textDark]}>
                      {beneficioSeleccionado.telefono}
                    </Text>
                  </View>
                )}

                <View style={styles.localInfoRow}>
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color={isDark ? THEME.muted : Palette.textSecondary}
                  />
                  <Text style={[styles.localInfoTextSubtle, isDark && styles.textMutedDark]}>
                    {beneficioSeleccionado?.validez} • {beneficioSeleccionado?.distancia}
                  </Text>
                </View>
              </View>

              {/* Acciones principales: Ver en el mapa y Llamar */}
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.modalActionBtn,
                    styles.mapActionBtn,
                    isDark && styles.mapActionBtnDark,
                  ]}
                  onPress={() => irAlMapa(beneficioSeleccionado?.lugarId)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Ver ubicación exacta en el mapa de Pilar"
                >
                  <Ionicons name="map-outline" size={18} color="#ffffff" />
                  <Text style={styles.mapActionBtnText}>Ver en mapa de Pilar</Text>
                </TouchableOpacity>

                {beneficioSeleccionado?.telefono && (
                  <TouchableOpacity
                    style={[
                      styles.modalActionBtn,
                      styles.callActionBtn,
                      isDark && styles.callActionBtnDark,
                    ]}
                    onPress={() => {
                      if (beneficioSeleccionado?.telefono) {
                        Linking.openURL(`tel:${beneficioSeleccionado.telefono}`);
                      }
                    }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Llamar al comercio"
                  >
                    <Ionicons
                      name="call"
                      size={18}
                      color={isDark ? '#4ade80' : Palette.greenDeep}
                    />
                    <Text style={[styles.callActionBtnText, isDark && styles.textDark]}>
                      Llamar
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Código de Promoción (.code) */}
              <View style={[styles.promoCodeBox, isDark ? styles.promoCodeBoxDark : styles.promoCodeBoxLight]}>
                <Text style={[styles.promoCodeText, isDark ? styles.promoCodeTextDark : styles.promoCodeTextLight]}>
                  {beneficioSeleccionado?.codigo}
                </Text>
                <Text style={[styles.promoCodeHelp, isDark && styles.textMutedDark]}>
                  Mostrá este cupón o el QR de tu perfil en el local
                </Text>
              </View>

              {/* Lista de Condiciones */}
              <View style={styles.condicionesContainer}>
                <Text style={[styles.condicionesTitle, isDark && styles.textDark]}>
                  Condiciones del beneficio:
                </Text>
                {beneficioSeleccionado?.condiciones.map((condicion, index) => (
                  <View key={index} style={styles.condicionItem}>
                    <Text style={[styles.condicionBullet, isDark && styles.textMutedDark]}>•</Text>
                    <Text style={[styles.condicionText, isDark && styles.textMutedDark]}>{condicion}</Text>
                  </View>
                ))}
              </View>

              {/* Botón Cerrar */}
              <TouchableOpacity
                style={[styles.ghostBtn, isDark ? styles.ghostBtnDark : styles.ghostBtnLight]}
                onPress={cerrarDetalle}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cerrar modal"
              >
                <Text style={[styles.ghostBtnText, isDark ? styles.ghostBtnTextDark : styles.ghostBtnTextLight]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  safeAreaDark: {
    backgroundColor: Palette.backgroundDark,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  scrollViewDark: {
    backgroundColor: Palette.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backButtonDark: {
    backgroundColor: THEME.surface,
    borderColor: THEME.line,
    shadowColor: '#000',
  },

  /* Encabezado */
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  textDark: {
    color: '#F2F7F3',
  },
  textMutedDark: {
    color: '#98A59C',
  },

  /* Beneficio Destacado (Banner Superior) */
  featuredTouch: {
    marginBottom: 18,
    borderRadius: 22,
  },
  featuredCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  featuredCardLight: {
    borderColor: '#0D6A3B',
    shadowColor: '#064224',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredCardDark: {
    borderColor: THEME.line,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featuredBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredLabel: {
    fontSize: 12,
    fontFamily: FontFamily.bodySemiBold,
    color: '#FFFFFF',
  },
  offBadgeContainer: {
    marginBottom: 10,
  },
  offBadge: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 18,
  },
  offBadgeText: {
    fontSize: 32,
    fontFamily: FontFamily.headingBold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headingBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featuredCommerce: {
    fontSize: 14,
    fontFamily: FontFamily.bodySemiBold,
    color: '#D1FAE5',
    marginBottom: 8,
  },
  featuredMapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredMapHintText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: '#D1FAE5',
  },

  /* Filtros (Categorías) */
  chipsWrapper: {
    marginHorizontal: -16,
    marginBottom: 20,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInactivoLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BCEAD0',
  },
  chipActivoLight: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
  },
  chipInactivoDark: {
    backgroundColor: THEME.surface,
    borderColor: THEME.line,
  },
  chipActivoDark: {
    backgroundColor: THEME.g,
    borderColor: THEME.g,
  },
  chipText: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodySemiBold,
  },
  chipTextInactivoLight: {
    color: Palette.textPrimary,
  },
  chipTextActivoLight: {
    color: '#FFFFFF',
  },
  chipTextInactivoDark: {
    color: THEME.ink,
  },
  chipTextActivoDark: {
    color: THEME.onG,
  },

  /* Título de Sección de Lista */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },

  /* Lista de Tarjetas (Cards) */
  cardsList: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardMainTouch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BCEAD0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: THEME.surface,
    borderColor: THEME.line,
  },
  ico: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icoLight: {
    backgroundColor: '#EAF8F0',
  },
  icoDark: {
    backgroundColor: THEME.gs,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  comercioNombre: {
    fontSize: 15.5,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    flex: 1,
  },
  tag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagLight: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tagDark: {
    backgroundColor: THEME.tagBg,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },
  tagTextLight: {
    color: '#92400E',
  },
  tagTextDark: {
    color: THEME.tagFg,
  },
  beneficioTitulo: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 6,
    lineHeight: 18,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textSecondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textMuted,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLight: {
    backgroundColor: Palette.greenDeep,
  },
  btnDark: {
    backgroundColor: THEME.g,
  },
  btnText: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodyBold,
  },
  btnTextLight: {
    color: '#FFFFFF',
  },
  btnTextDark: {
    color: THEME.onG,
  },
  mapIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF8F0',
    borderWidth: 1,
    borderColor: '#BCEAD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIconButtonDark: {
    backgroundColor: '#0F2E1C',
    borderColor: '#1F5A36',
  },

  /* Modal / Bottom Sheet (Detalle del Beneficio) */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
  },
  sheetLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BCEAD0',
  },
  sheetDark: {
    backgroundColor: THEME.surface,
    borderColor: THEME.line,
  },
  sheetScroll: {
    width: '100%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHandleLight: {
    backgroundColor: '#CBD5E1',
  },
  sheetHandleDark: {
    backgroundColor: THEME.line,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    flex: 1,
  },
  sheetCloseButton: {
    padding: 4,
  },
  sheetOff: {
    fontSize: 30,
    fontFamily: FontFamily.headingBold,
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sheetOffLight: {
    color: Palette.greenDeep,
  },
  sheetOffDark: {
    color: THEME.g,
  },
  sheetBenefitTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
    marginBottom: 10,
    lineHeight: 21,
  },

  /* Local real info box */
  localInfoBox: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    gap: 8,
  },
  localInfoBoxLight: {
    backgroundColor: '#F8FCF8',
    borderColor: '#BCEAD0',
  },
  localInfoBoxDark: {
    backgroundColor: '#0F2E1C',
    borderColor: '#1F5A36',
  },
  localInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  localInfoText: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
    flex: 1,
  },
  localInfoTextSubtle: {
    fontSize: 12.5,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    flex: 1,
  },

  /* Modal Action Buttons */
  modalActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
  },
  mapActionBtn: {
    backgroundColor: Palette.greenDeep,
    flex: 1,
  },
  mapActionBtnDark: {
    backgroundColor: '#15803D',
  },
  mapActionBtnText: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodyBold,
    color: '#FFFFFF',
  },
  callActionBtn: {
    backgroundColor: '#EAF8F0',
    borderWidth: 1,
    borderColor: '#BCEAD0',
    paddingHorizontal: 16,
  },
  callActionBtnDark: {
    backgroundColor: '#0F2E1C',
    borderColor: '#1F5A36',
  },
  callActionBtnText: {
    fontSize: 13.5,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
  },

  /* Promo code */
  promoCodeBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  promoCodeBoxLight: {
    backgroundColor: '#EAF8F0',
    borderColor: Palette.greenPrimary,
  },
  promoCodeBoxDark: {
    backgroundColor: THEME.gs,
    borderColor: THEME.g,
  },
  promoCodeText: {
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    letterSpacing: 4,
    textAlign: 'center',
  },
  promoCodeTextLight: {
    color: Palette.greenDeep,
  },
  promoCodeTextDark: {
    color: THEME.g,
  },
  promoCodeHelp: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  condicionesContainer: {
    marginBottom: 20,
  },
  condicionesTitle: {
    fontSize: 14,
    fontFamily: FontFamily.headingSemiBold,
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  condicionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 2,
  },
  condicionBullet: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginRight: 8,
    lineHeight: 18,
  },
  condicionText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  ghostBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  ghostBtnLight: {
    backgroundColor: '#EAF8F0',
    borderColor: '#BCEAD0',
  },
  ghostBtnDark: {
    backgroundColor: THEME.gs,
    borderColor: THEME.line,
  },
  ghostBtnText: {
    fontSize: 14.5,
    fontFamily: FontFamily.bodyBold,
  },
  ghostBtnTextLight: {
    color: Palette.greenDeep,
  },
  ghostBtnTextDark: {
    color: THEME.g,
  },
});
