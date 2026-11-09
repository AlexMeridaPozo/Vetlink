import React, { useMemo, useState } from 'react';
import {
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

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaFiltro>('Todos');
  const [beneficioSeleccionado, setBeneficioSeleccionado] =
    useState<Beneficio | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Beneficio destacado (Peluquería Canina Pelusa)
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra superior de navegación */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleVolver}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior"
          >
            <Ionicons name="arrow-back" size={22} color={THEME.ink} />
          </TouchableOpacity>
        </View>

        {/* Encabezado (Top) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Beneficios</Text>
          <Text style={styles.headerSubtitle}>
            Descuentos para tu mascota en comercios adheridos.
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
            colors={[THEME.h1, THEME.h2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredHeaderRow}>
              <Text style={styles.featuredLabel}>Beneficio destacado</Text>
              <Ionicons name="sparkles" size={15} color={THEME.g} />
            </View>

            <View style={styles.offBadgeContainer}>
              <View style={styles.offBadge}>
                <Text style={styles.offBadgeText}>20% OFF</Text>
              </View>
            </View>

            <Text style={styles.featuredTitle}>Corte de pelo y baño</Text>
            <Text style={styles.featuredCommerce}>Peluquería Canina Pelusa</Text>
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
                    activo ? styles.chipActivo : styles.chipInactivo,
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
                      activo ? styles.chipTextActivo : styles.chipTextInactivo,
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
          <Text style={styles.sectionTitle}>Disponibles</Text>
          <Text style={styles.sectionCount}>
            {beneficiosFiltrados.length}{' '}
            {beneficiosFiltrados.length === 1 ? 'beneficio' : 'beneficios'}
          </Text>
        </View>

        {/* Lista de Tarjetas (Cards) */}
        <View style={styles.cardsList}>
          {beneficiosFiltrados.map((beneficio) => {
            const iconName = getIconByTipo(beneficio.tipo);
            return (
              <TouchableOpacity
                key={beneficio.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => abrirDetalle(beneficio)}
                accessibilityRole="button"
                accessibilityLabel={`${beneficio.comercio}, ${beneficio.descuento}, ${beneficio.titulo}`}
              >
                {/* Ícono de la Tarjeta (.ico) */}
                <View style={styles.ico}>
                  <Ionicons name={iconName} size={24} color={THEME.g} />
                </View>

                {/* Contenido de la Tarjeta */}
                <View style={styles.cardContent}>
                  {/* Fila Superior: Nombre del comercio y Etiqueta de Descuento */}
                  <View style={styles.cardTopRow}>
                    <Text style={styles.comercioNombre} numberOfLines={1}>
                      {beneficio.comercio}
                    </Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{beneficio.descuento}</Text>
                    </View>
                  </View>

                  {/* Título del Beneficio */}
                  <Text style={styles.beneficioTitulo}>{beneficio.titulo}</Text>

                  {/* Fila Meta (.meta): Distancia y Validez */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="location-outline"
                        size={13.5}
                        color={THEME.muted}
                      />
                      <Text style={styles.metaText}>{beneficio.distancia}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="time-outline"
                        size={13.5}
                        color={THEME.muted}
                      />
                      <Text style={styles.metaText}>{beneficio.validez}</Text>
                    </View>
                  </View>

                  {/* Botón (.btn): Ver beneficio */}
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => abrirDetalle(beneficio)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver beneficio de ${beneficio.comercio}`}
                  >
                    <Text style={styles.btnText}>Ver beneficio</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            {/* Manija de arrastre visual */}
            <View style={styles.sheetHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.sheetScroll}
            >
              {/* Encabezado del Sheet */}
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>
                  {beneficioSeleccionado?.comercio}
                </Text>
                <TouchableOpacity
                  onPress={cerrarDetalle}
                  style={styles.sheetCloseButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar detalle"
                >
                  <Ionicons name="close" size={22} color={THEME.muted} />
                </TouchableOpacity>
              </View>

              {/* Descuento grande (.off) */}
              <Text style={styles.sheetOff}>
                {beneficioSeleccionado?.descuento}
              </Text>

              {/* Título detallado del beneficio */}
              <Text style={styles.sheetBenefitTitle}>
                {beneficioSeleccionado?.titulo}
              </Text>

              {/* Validez y distancia */}
              <View style={styles.sheetMetaRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={THEME.muted}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.sheetMetaText}>
                  {beneficioSeleccionado?.validez} •{' '}
                  {beneficioSeleccionado?.distancia}
                </Text>
              </View>

              {/* Código de Promoción (.code) */}
              <View style={styles.promoCodeBox}>
                <Text style={styles.promoCodeText}>
                  {beneficioSeleccionado?.codigo}
                </Text>
                <Text style={styles.promoCodeHelp}>
                  Mostrá este código o el QR de tu perfil en el local
                </Text>
              </View>

              {/* Lista de Condiciones */}
              <View style={styles.condicionesContainer}>
                <Text style={styles.condicionesTitle}>Condiciones:</Text>
                {beneficioSeleccionado?.condiciones.map((condicion, index) => (
                  <View key={index} style={styles.condicionItem}>
                    <Text style={styles.condicionBullet}>•</Text>
                    <Text style={styles.condicionText}>{condicion}</Text>
                  </View>
                ))}
              </View>

              {/* Botón Cerrar (.btn.ghost) */}
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={cerrarDetalle}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cerrar modal"
              >
                <Text style={styles.ghostBtnText}>Cerrar</Text>
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
    backgroundColor: THEME.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.line,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Encabezado (Top) */
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.muted,
    lineHeight: 20,
  },

  /* Beneficio Destacado (Banner Superior) */
  featuredTouch: {
    marginBottom: 18,
    borderRadius: 22,
  },
  featuredCard: {
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 22,
    padding: 18,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featuredLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.ink,
    opacity: 0.92,
  },
  offBadgeContainer: {
    marginBottom: 12,
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
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 2,
  },
  featuredCommerce: {
    fontSize: 13.5,
    color: THEME.ink,
    opacity: 0.92,
  },

  /* Filtros (Categorías - Estilo 'Chips') */
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
    paddingHorizontal: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInactivo: {
    backgroundColor: THEME.surface,
    borderColor: THEME.line,
  },
  chipActivo: {
    backgroundColor: THEME.g,
    borderColor: THEME.g,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextInactivo: {
    color: THEME.ink,
  },
  chipTextActivo: {
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
    fontWeight: '700',
    color: THEME.ink,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.muted,
  },

  /* Lista de Tarjetas (Cards) */
  cardsList: {
    gap: 12,
  },
  card: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ico: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: THEME.gs,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: '700',
    color: THEME.ink,
    flex: 1,
  },
  tag: {
    backgroundColor: THEME.tagBg,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.tagFg,
  },
  beneficioTitulo: {
    fontSize: 14,
    color: THEME.ink,
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12.5,
    color: THEME.muted,
  },
  btn: {
    backgroundColor: THEME.g,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.onG,
  },

  /* Modal / Bottom Sheet (Detalle del Beneficio) */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: THEME.line,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
  },
  sheetScroll: {
    width: '100%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: THEME.ink,
    flex: 1,
  },
  sheetCloseButton: {
    padding: 4,
  },
  sheetOff: {
    fontSize: 30,
    fontWeight: '800',
    color: THEME.g,
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sheetBenefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.ink,
    marginBottom: 6,
    lineHeight: 21,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetMetaText: {
    fontSize: 14,
    color: THEME.muted,
  },
  promoCodeBox: {
    borderWidth: 2,
    borderColor: THEME.g,
    borderStyle: 'dashed',
    backgroundColor: THEME.gs,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  promoCodeText: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.g,
    letterSpacing: 4,
    textAlign: 'center',
  },
  promoCodeHelp: {
    fontSize: 13,
    color: THEME.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  condicionesContainer: {
    marginBottom: 20,
  },
  condicionesTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: THEME.ink,
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
    color: THEME.muted,
    marginRight: 8,
    lineHeight: 18,
  },
  condicionText: {
    fontSize: 13,
    color: THEME.muted,
    flex: 1,
    lineHeight: 18,
  },
  ghostBtn: {
    backgroundColor: THEME.gs,
    borderWidth: 1,
    borderColor: THEME.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 4,
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.g,
  },
});
