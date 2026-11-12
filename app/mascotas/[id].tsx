import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditarMascotaModal } from '@/components/EditarMascotaModal';
import { EmptyState } from '@/components/EmptyState';
import QRMascotaCard from '@/components/QRMascotaCard';
import VincularNfcModal from '@/components/VincularNfcModal';
import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { getPetById, toggleEstadoExtravio, updatePetData, type HistorialClinicoItem, type Pet } from '@/services/petService';

type ClinicalTabId = 'general' | 'historial' | 'seguridad' | 'nfc' | 'qr' | 'todos';

interface ClinicalTabItem {
  id: ClinicalTabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap | 'nfc';
  isMci?: boolean;
}

const CLINICAL_TABS: ClinicalTabItem[] = [
  { id: 'general', label: 'General', icon: 'paw-outline' },
  { id: 'historial', label: 'Historial', icon: 'document-text-outline' },
  { id: 'seguridad', label: 'Seguridad', icon: 'shield-checkmark-outline' },
  { id: 'nfc', label: 'NFC', icon: 'nfc', isMci: true },
  { id: 'qr', label: 'Placa QR', icon: 'qr-code-outline' },
  { id: 'todos', label: 'Ver Todo', icon: 'layers-outline' },
];

export default function MascotaDetalleScreen() {
  const { isDark } = useAppTheme();
  const { user, isVeterinario } = useAuth();

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

  const [pet, setPet] = useState<Pet | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ClinicalTabId>('general');
  const [showAddHistoryForm, setShowAddHistoryForm] = useState(false);
  const [nuevoHistTitulo, setNuevoHistTitulo] = useState('');
  const [nuevoHistDetalle, setNuevoHistDetalle] = useState('');
  const [savingHistory, setSavingHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (params.id) {
      getPetById(params.id)
        .then((livePet) => {
          if (isMounted && livePet) {
            setPet(livePet);
          }
        })
        .catch((err) => {
          console.warn('[MascotaDetalleScreen] Error consultando Firestore:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const onRefresh = useCallback(async () => {
    if (!params.id) return;
    setRefreshing(true);
    try {
      const livePet = await getPetById(params.id);
      if (livePet) setPet(livePet);
    } catch (err) {
      console.warn('[MascotaDetalleScreen] Error al refrescar:', err);
    } finally {
      setRefreshing(false);
    }
  }, [params.id]);

  // Datos consolidados
  const displayId = pet?.id || params.id || 'PET-001';
  const displayNombre = pet?.nombre || params.nombre || 'Mascota';
  const displayEspecie = pet?.especie || params.especie || 'Perro';
  const displayRaza = pet?.raza || params.raza || 'Raza no especificada';
  const displaySexo = pet?.sexo || params.sexo || 'No informado';
  const displayPeso = pet?.peso !== undefined && pet?.peso !== 'N/A' ? String(pet.peso) : params.peso || 'N/A';
  const displayEdad = pet?.edad !== undefined ? String(pet.edad) : pet?.fechaNacimiento || params.edad || 'N/A';
  const displayFotoUrl = pet?.fotoUrl || params.fotoUrl || '';
  const displayDescripcion = pet?.descripcion || params.descripcion || '';
  const displayPropietario = pet?.propietario || '';
  const displayTelefono = pet?.telefonoContacto || '';
  const isNfcLinked = pet?.nfcStatus === 'linked';

  const isMale = displaySexo.toLowerCase().includes('macho');
  const isGato = displayEspecie.toLowerCase().includes('gato');

  // Permisos: Veterinarios autorizados y Tutores propietarios verificados
  const isOwner = Boolean(
    user &&
    pet &&
    ((pet.userId && pet.userId === user.uid) ||
     (pet.ownerId && pet.ownerId === user.uid))
  );
  const canEdit = isVeterinario || isOwner;

  const formatEdad = (edadStr: string) => {
    if (!edadStr || edadStr === 'N/A' || edadStr === 'No especificada') return 'Sin edad';
    const lower = edadStr.toLowerCase().trim();
    if (lower.includes('año') || lower.includes('mes') || lower.includes('/')) {
      return edadStr;
    }
    return `${edadStr} años`;
  };

  const handleOpenEditModal = () => {
    if (!pet) {
      Alert.alert('Cargando ficha', 'Por favor espera a que se sincronicen los datos completos de la mascota.');
      return;
    }
    setEditModalVisible(true);
  };

  const handleToggleExtravio = async () => {
    if (!displayId) return;
    const nuevoEstado = !pet?.extraviada;
    Alert.alert(
      nuevoEstado ? 'Activar Alerta de Extravío' : 'Marcar como En Casa',
      nuevoEstado
        ? `¿Confirmas que ${displayNombre} se ha extraviado? La ficha pública mostrará una alerta destacada y registrará la ubicación GPS de quien la escanee.`
        : `¿${displayNombre} ya está a salvo en casa? Se desactivará la alerta de extravío.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: nuevoEstado ? 'Activar Búsqueda' : 'Confirmar En Casa',
          style: nuevoEstado ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await toggleEstadoExtravio(displayId, nuevoEstado);
              setPet((prev) => (prev ? { ...prev, extraviada: nuevoEstado } : null));
              Alert.alert('Éxito', nuevoEstado ? 'Alerta de extravío activada.' : 'Mascota marcada como a salvo.');
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado de extravío en el servidor.');
            }
          },
        },
      ]
    );
  };

  const handleOpenVincularNfc = () => {
    if (!isVeterinario) {
      Alert.alert(
        'Acceso Restringido',
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular o modificar etiquetas NFC en HuellApp.'
      );
      return;
    }
    setNfcModalVisible(true);
  };

  const handleAgregarRegistroClinico = async () => {
    if (!isVeterinario || !user) return;
    if (!nuevoHistTitulo.trim()) {
      Alert.alert('Campo obligatorio', 'Ingresa el título del registro clínico (ej: Vacuna Antirrábica, Control General).');
      return;
    }
    setSavingHistory(true);
    try {
      const nuevoItem: HistorialClinicoItem = {
        id: `hist-${Date.now()}`,
        titulo: nuevoHistTitulo.trim(),
        detalle: nuevoHistDetalle.trim() || 'Control clínico realizado en consultorio.',
        fecha: new Date().toLocaleDateString('es-AR'),
        veterinario: user.displayName || user.email || user.uid,
        completado: true,
      };
      const historialActualizado = [nuevoItem, ...(pet?.historialClinico || [])];
      await updatePetData(displayId, { historialClinico: historialActualizado });
      setPet((prev) =>
        prev
          ? { ...prev, historialClinico: historialActualizado }
          : ({
              id: displayId,
              nombre: displayNombre,
              especie: displayEspecie,
              raza: displayRaza,
              sexo: displaySexo,
              peso: displayPeso,
              historialClinico: historialActualizado,
            } as Pet)
      );
      setNuevoHistTitulo('');
      setNuevoHistDetalle('');
      setShowAddHistoryForm(false);
      Alert.alert('¡Registro guardado!', 'La entrada fue añadida al historial clínico de la mascota.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo guardar el registro clínico.');
    } finally {
      setSavingHistory(false);
    }
  };

  const handlePetUpdated = (updatedPet: Pet) => {
    setPet(updatedPet);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Top Navbar con Botón de Edición ─────────────────────────── */}
      <View style={[styles.navbar, isDark && styles.navbarDark]}>
        <TouchableOpacity
          style={[styles.backButton, isDark && styles.buttonDark]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Volver atrás"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#fafafa' : Palette.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, isDark && styles.textDark]}>
          Ficha Clínica
        </Text>

        <View style={styles.navActionsRow}>
          {canEdit && (
            <TouchableOpacity
              style={[styles.editNavBtn, isDark && styles.editNavBtnDark]}
              onPress={handleOpenEditModal}
              activeOpacity={0.75}
              accessibilityLabel="Editar información de mascota"
            >
              <Ionicons name="create-outline" size={17} color={Palette.greenDeep} />
              <Text style={styles.editNavBtnText}>Editar</Text>
            </TouchableOpacity>
          )}

          <ThemeToggleButton />

          <TouchableOpacity
            style={[styles.backButton, isDark && styles.buttonDark]}
            activeOpacity={0.7}
            onPress={onRefresh}
            accessibilityLabel="Actualizar ficha"
          >
            <Ionicons name="refresh-outline" size={20} color={Palette.greenDeep} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Mini Header Persistente con Resumen de Mascota ──────────── */}
      <View style={[styles.petCompactHeader, isDark && styles.petCompactHeaderDark]}>
        <View style={styles.petCompactAvatarWrapper}>
          {displayFotoUrl ? (
            <Image source={{ uri: displayFotoUrl }} style={styles.petCompactAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.petCompactFallback, isDark && styles.petCompactFallbackDark]}>
              <MaterialCommunityIcons
                name={isGato ? 'cat' : 'dog'}
                size={24}
                color={Palette.greenDeep}
              />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.petCompactName, isDark && styles.textDark]}>{displayNombre}</Text>
            <View style={[styles.codeBadge, isDark && styles.codeBadgeDark]}>
              <Text style={styles.codeBadgeText}>{displayId}</Text>
            </View>
          </View>
          <Text style={[styles.petCompactSub, isDark && styles.textSecondaryDark]}>
            {displayEspecie} • {displayRaza}
          </Text>
        </View>

        <View
          style={[
            styles.compactStatusPill,
            pet?.extraviada ? styles.pillLost : styles.pillHome,
          ]}
        >
          <Ionicons
            name={pet?.extraviada ? 'alert-circle-outline' : 'shield-checkmark-outline'}
            size={13}
            color="#ffffff"
          />
          <Text style={styles.compactStatusPillText}>
            {pet?.extraviada ? 'Extraviada' : 'En Casa'}
          </Text>
        </View>
      </View>

      {/* ── 1. MENÚ DE NAVEGACIÓN HORIZONTAL ENTRE SECCIONES CLÍNICAS ── */}
      <View style={[styles.tabsWrapper, isDark && styles.tabsWrapperDark]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {CLINICAL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabPill,
                  isDark && styles.tabPillDark,
                  isActive && styles.tabPillActive,
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                {tab.isMci ? (
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={16}
                    color={isActive ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                    style={{ marginRight: 6 }}
                  />
                ) : (
                  <Ionicons
                    name={tab.icon as any}
                    size={15}
                    color={isActive ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.tabPillText,
                    isDark && styles.tabPillTextDark,
                    isActive && styles.tabPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Contenido Dinámico de la Sección Clínica Seleccionada ─────── */}
      <ScrollView
        style={[{ flex: 1 }, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.greenPrimary]} />
        }
      >
        {/* ── SECCIÓN 1: GENERAL / DATOS PRINCIPALES ───────────────────── */}
        {(activeTab === 'general' || activeTab === 'todos') && (
          <View style={{ marginBottom: 14 }}>
            {/* Banner / Foto Principal */}
            <View style={styles.imageCard}>
              {displayFotoUrl ? (
                <Image
                  source={{ uri: displayFotoUrl }}
                  style={styles.petImage}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View style={[styles.imageFallback, isDark && styles.imageFallbackDark]}>
                  <MaterialCommunityIcons
                    name={isGato ? 'cat' : 'dog'}
                    size={72}
                    color={Palette.greenDeep}
                  />
                </View>
              )}

              <View style={[styles.speciesFloatingBadge, isDark && styles.speciesFloatingBadgeDark]}>
                <MaterialCommunityIcons
                  name={isGato ? 'cat' : 'dog'}
                  size={14}
                  color={Palette.greenDeep}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.speciesFloatingText, isDark && styles.speciesFloatingTextDark]}>
                  {displayEspecie} • {displayId}
                </Text>
              </View>
            </View>

            {/* Datos Principales */}
            <View style={[styles.infoCard, isDark && styles.cardDark]}>
              <View style={styles.nameHeader}>
                <View>
                  <Text style={[styles.petName, isDark && styles.textDark]}>{displayNombre}</Text>
                  <Text style={[styles.petBreed, isDark && styles.textSecondaryDark]}>{displayRaza}</Text>
                </View>
                <View
                  style={[
                    styles.genderTag,
                    {
                      backgroundColor: isMale
                        ? (isDark ? 'rgba(2, 132, 199, 0.2)' : Palette.cyanLight)
                        : (isDark ? 'rgba(244, 114, 182, 0.2)' : '#fff1f2'),
                    },
                  ]}
                >
                  <Ionicons
                    name={isMale ? 'male-outline' : 'female-outline'}
                    size={14}
                    color={isMale ? '#0284c7' : '#e11d48'}
                  />
                  <Text
                    style={[
                      styles.genderTagText,
                      { color: isMale ? '#0284c7' : '#e11d48' },
                    ]}
                  >
                    {displaySexo}
                  </Text>
                </View>
              </View>

              {/* Ficha técnica rápida */}
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, isDark && styles.statBoxDark]}>
                  <Ionicons name="scale-outline" size={18} color={Palette.greenDeep} />
                  <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Peso</Text>
                  <Text style={[styles.statValue, isDark && styles.textDark]}>
                    {displayPeso !== 'N/A' ? `${displayPeso} kg` : 'Sin peso'}
                  </Text>
                </View>

                <View style={[styles.statBox, isDark && styles.statBoxDark]}>
                  <Ionicons name="calendar-outline" size={18} color={Palette.greenDeep} />
                  <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Edad</Text>
                  <Text style={[styles.statValue, isDark && styles.textDark]}>
                    {formatEdad(displayEdad)}
                  </Text>
                </View>

                <View style={[styles.statBox, isDark && styles.statBoxDark]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Palette.greenDeep} />
                  <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Código</Text>
                  <Text style={[styles.statValue, isDark && styles.textDark]}>{displayId}</Text>
                </View>
              </View>

              {/* Propietario / Contacto */}
              {displayPropietario ? (
                <View style={[styles.ownerSection, isDark && styles.ownerSectionDark]}>
                  <View style={styles.ownerRow}>
                    <Ionicons name="person-outline" size={16} color={Palette.greenDeep} />
                    <Text style={[styles.ownerLabel, isDark && styles.ownerLabelDark]}>
                      Tutor / Propietario:{' '}
                      <Text style={{ fontWeight: '700' }}>{displayPropietario}</Text>
                    </Text>
                  </View>
                  {displayTelefono ? (
                    <View style={[styles.ownerRow, { marginTop: 4 }]}>
                      <Ionicons name="call-outline" size={16} color={Palette.greenDeep} />
                      <Text style={[styles.ownerLabel, isDark && styles.ownerLabelDark]}>
                        Teléfono:{' '}
                        <Text style={{ fontWeight: '700' }}>{displayTelefono}</Text>
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Descripción / Notas */}
              {displayDescripcion ? (
                <View style={[styles.section, isDark && styles.sectionDark]}>
                  <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Notas Clínicas</Text>
                  <Text style={[styles.sectionBody, isDark && styles.textSecondaryDark]}>
                    {displayDescripcion}
                  </Text>
                </View>
              ) : null}

              {/* Botón Acción: Editar Información de Mascota */}
              {canEdit && (
                <TouchableOpacity
                  style={[styles.btnEditMain, isDark && styles.btnEditMainDark]}
                  onPress={handleOpenEditModal}
                  activeOpacity={0.85}
                >
                  <Ionicons name="create-outline" size={18} color={Palette.greenDeep} style={{ marginRight: 6 }} />
                  <Text style={styles.btnEditMainText}>Editar Información de Mascota</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── SECCIÓN 2: HISTORIAL CLÍNICO ─────────────────────────────── */}
        {(activeTab === 'historial' || activeTab === 'todos') && (
          <View style={[styles.infoCard, isDark && styles.cardDark, { marginBottom: 14 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text-outline" size={22} color={Palette.greenDeep} />
                <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0 }]}>
                  Historial Clínico
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {pet?.historialClinico && pet.historialClinico.length > 0 && (
                  <View style={[styles.countBadge, isDark && styles.countBadgeDark]}>
                    <Text style={styles.countBadgeText}>{pet.historialClinico.length} registros</Text>
                  </View>
                )}
                {isVeterinario && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: Palette.greenDeep,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      gap: 4,
                    }}
                    onPress={() => setShowAddHistoryForm((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={showAddHistoryForm ? 'close' : 'add'} size={15} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                      {showAddHistoryForm ? 'Cancelar' : 'Agregar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isVeterinario && showAddHistoryForm && (
              <View
                style={{
                  backgroundColor: isDark ? '#18181b' : '#f1f7f3',
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: isDark ? '#27272a' : Palette.greenBorder,
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#f4f4f5' : Palette.textPrimary }}>
                  Nuevo Registro Clínico
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? '#09090b' : '#ffffff',
                    borderWidth: 1,
                    borderColor: isDark ? '#27272a' : Palette.borderLight,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 14,
                    color: isDark ? '#f4f4f5' : Palette.textPrimary,
                  }}
                  placeholder="Título (ej: Vacuna Séxtuple, Control Anual)"
                  placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                  value={nuevoHistTitulo}
                  onChangeText={setNuevoHistTitulo}
                />
                <TextInput
                  style={{
                    backgroundColor: isDark ? '#09090b' : '#ffffff',
                    borderWidth: 1,
                    borderColor: isDark ? '#27272a' : Palette.borderLight,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 14,
                    color: isDark ? '#f4f4f5' : Palette.textPrimary,
                    minHeight: 60,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Observaciones, dosis o diagnóstico..."
                  placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                  value={nuevoHistDetalle}
                  onChangeText={setNuevoHistDetalle}
                  multiline
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: Palette.greenDeep,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={handleAgregarRegistroClinico}
                  disabled={savingHistory}
                >
                  {savingHistory ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
                      Guardar en Historial Clínico
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {pet?.historialClinico && pet.historialClinico.length > 0 ? (
              pet.historialClinico.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[
                    styles.historyRow,
                    isDark && styles.historyRowDark,
                    idx === (pet.historialClinico?.length || 1) - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.historyDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyTitle, isDark && styles.textDark]}>
                      {item.titulo}
                    </Text>
                    <Text style={[styles.historySubtitle, isDark && styles.textSecondaryDark]}>
                      {item.detalle} • {item.fecha}
                    </Text>
                  </View>
                  <Ionicons
                    name={item.completado ? 'checkmark-circle-outline' : 'time-outline'}
                    size={20}
                    color={item.completado ? Palette.greenDeep : '#f59e0b'}
                  />
                </View>
              ))
            ) : (
              /* Estado vacío con Ilustración Vectorial amigable HuellaApp */
              <EmptyState
                variant="history"
                title="Todavía no hay registros clínicos."
                message="Las consultas médicas, vacunas y observaciones registradas para esta mascota aparecerán aquí."
                compact
              />
            )}
          </View>
        )}

        {/* ── SECCIÓN 3: SEGURIDAD, EXTRAVÍO Y RESCATE ─────────────────── */}
        {(activeTab === 'seguridad' || activeTab === 'todos') && (
          <View style={[styles.infoCard, isDark && styles.cardDark, { marginBottom: 14 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name={pet?.extraviada ? 'alert-circle-outline' : 'shield-checkmark-outline'}
                  size={22}
                  color={pet?.extraviada ? Palette.redEmergency : Palette.greenDeep}
                />
                <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0 }]}>
                  Seguridad y Rescate
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.btnToggleExtravio,
                  pet?.extraviada ? styles.btnExtraviadaActive : styles.btnExtraviadaInactive,
                ]}
                onPress={handleToggleExtravio}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={pet?.extraviada ? 'alert-circle-outline' : 'shield-checkmark-outline'}
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.btnToggleExtravioText}>
                  {pet?.extraviada ? 'Extraviada' : 'En Casa'}
                </Text>
              </TouchableOpacity>
            </View>

            {pet?.extraviada && (
              <View style={styles.lostAlertBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="warning-outline" size={16} color={Palette.redEmergency} />
                  <Text style={styles.lostAlertBoxTitle}>Modo de Búsqueda Activo</Text>
                </View>
                <Text style={styles.lostAlertBoxText}>
                  Cualquier persona que escanee la chapita QR o NFC verá la alerta de extravío y podrá enviarte su ubicación GPS con un toque.
                </Text>
              </View>
            )}

            {/* Último escaneo detectado */}
            {pet?.ultimoEscaneo ? (
              <View style={[styles.scanDetectedBox, isDark && styles.scanDetectedBoxDark]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location-outline" size={18} color="#2563eb" />
                  <Text style={[styles.scanDetectedTitle, isDark && styles.textDark]}>
                    Última ubicación registrada
                  </Text>
                </View>
                <Text style={[styles.scanDetectedDate, isDark && styles.textSecondaryDark]}>
                  {pet.ultimoEscaneo.fecha ? new Date(pet.ultimoEscaneo.fecha).toLocaleString() : 'Fecha reciente'}
                </Text>

                {typeof pet.ultimoEscaneo.lat === 'number' && typeof pet.ultimoEscaneo.lng === 'number' && (
                  <TouchableOpacity
                    style={styles.btnOpenMap}
                    onPress={() =>
                      Linking.openURL(
                        `https://maps.google.com/?q=${pet.ultimoEscaneo!.lat},${pet.ultimoEscaneo!.lng}`
                      )
                    }
                  >
                    <Ionicons name="map-outline" size={16} color="#ffffff" />
                    <Text style={styles.btnOpenMapText}>Ver ubicación en Google Maps</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <Text style={[styles.noScansText, isDark && styles.textSecondaryDark]}>
                Aún no se registran alertas de ubicación para esta mascota.
              </Text>
            )}
          </View>
        )}

        {/* ── SECCIÓN 4: IDENTIFICACIÓN NFC ───────────────────────────── */}
        {(activeTab === 'nfc' || activeTab === 'todos') && (
          <View style={[styles.infoCard, isDark && styles.cardDark, { marginBottom: 14 }]}>
            <View style={styles.nfcCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="nfc" size={22} color={Palette.greenDeep} />
                <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0 }]}>
                  Collar NFC
                </Text>
              </View>

              <View
                style={[
                  styles.nfcStatusBadge,
                  isNfcLinked
                    ? (isDark ? styles.nfcBadgeLinkedDark : styles.nfcBadgeLinked)
                    : (isDark ? styles.nfcBadgeUnlinkedDark : styles.nfcBadgeUnlinked),
                ]}
              >
                <Ionicons
                  name={isNfcLinked ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                  size={14}
                  color={isNfcLinked ? (isDark ? '#4ade80' : Palette.greenDeep) : (isDark ? '#fcd34d' : '#92400e')}
                />
                <Text
                  style={[
                    styles.nfcStatusBadgeText,
                    isNfcLinked
                      ? (isDark ? styles.nfcStatusTextLinkedDark : styles.nfcStatusTextLinked)
                      : (isDark ? styles.nfcStatusTextUnlinkedDark : styles.nfcStatusTextUnlinked),
                  ]}
                >
                  {isNfcLinked ? 'Vinculado' : 'No vinculado'}
                </Text>
              </View>
            </View>

            {isNfcLinked ? (
              <View style={[styles.nfcDetailsBox, isDark && styles.nfcDetailsBoxDark]}>
                <Text style={[styles.unlinkedNfcDesc, isDark && styles.textSecondaryDark, { marginBottom: pet?.nfcLinkedAt ? 8 : 0 }]}>
                  El collar o chapita NFC de {displayNombre} está activo y listo para ser leído acercando un teléfono.
                </Text>
                {pet?.nfcLinkedAt && (
                  <View style={[styles.nfcDetailRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>Vinculado el:</Text>
                    <Text style={[styles.nfcDetailValue, isDark && styles.textDark]}>
                      {new Date(pet.nfcLinkedAt).toLocaleDateString('es-AR')}
                    </Text>
                  </View>
                )}

                {isVeterinario && (
                  <TouchableOpacity
                    style={[styles.relinkNfcBtn, isDark && styles.relinkNfcBtnDark]}
                    onPress={handleOpenVincularNfc}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="nfc" size={18} color={Palette.greenDeep} style={{ marginRight: 6 }} />
                    <Text style={[styles.relinkNfcBtnText, isDark && styles.relinkNfcBtnTextDark]}>
                      Cambiar Collar NFC
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={[styles.unlinkedNfcBox, isDark && styles.unlinkedNfcBoxDark]}>
                <Text style={[styles.unlinkedNfcDesc, isDark && styles.textSecondaryDark]}>
                  {isVeterinario
                    ? `Acerca un collar o chapita NFC para asociarlo a la ficha de ${displayNombre}.`
                    : `${displayNombre} aún no tiene un collar NFC vinculado. Podés solicitar su vinculación en tu veterinaria adherida.`}
                </Text>
                {isVeterinario && (
                  <TouchableOpacity
                    style={styles.linkNfcPrimaryBtn}
                    onPress={handleOpenVincularNfc}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="nfc" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.linkNfcPrimaryBtnText}>Vincular Collar NFC</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── SECCIÓN 5: PLACA QR Y MODELO 3D STL ──────────────────────── */}
        {(activeTab === 'qr' || activeTab === 'todos') && (
          <View style={{ marginBottom: 14 }}>
            <QRMascotaCard
              petId={displayId}
              petName={displayNombre}
              isDark={isDark}
            />
          </View>
        )}

        {/* Botón de volver */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeBtnText}>Volver a Mis Mascotas</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modal de Edición de Mascota ───────────────────────────────── */}
      <EditarMascotaModal
        visible={editModalVisible}
        pet={pet || ({ ...params, id: displayId, nombre: displayNombre } as any)}
        onClose={() => setEditModalVisible(false)}
        onPetUpdated={handlePetUpdated}
      />

      {/* ── Modal Vincular NFC Integrado ──────────────────────────────── */}
      <VincularNfcModal
        visible={nfcModalVisible}
        mascota={pet || ({ ...params, id: displayId, nombre: displayNombre } as any)}
        onClose={() => setNfcModalVisible(false)}
        onSuccess={(updatedPet) => {
          setPet(updatedPet);
          setNfcModalVisible(false);
          onRefresh();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  navbarDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  navTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#27272a',
  },
  editNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.md,
    gap: 4,
  },
  editNavBtnDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  editNavBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  petCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    gap: 12,
  },
  petCompactHeaderDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  petCompactAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
  },
  petCompactAvatar: {
    width: '100%',
    height: '100%',
  },
  petCompactFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCompactFallbackDark: {
    backgroundColor: '#27272a',
  },
  petCompactName: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  petCompactSub: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  codeBadge: {
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  codeBadgeDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.25)',
  },
  codeBadgeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  compactStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  pillHome: {
    backgroundColor: Palette.greenDeep,
  },
  pillLost: {
    backgroundColor: Palette.redEmergency,
  },
  compactStatusPillText: {
    color: '#ffffff',
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
  },
  // Tabs Bar
  tabsWrapper: {
    backgroundColor: Palette.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    paddingVertical: 8,
  },
  tabsWrapperDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  tabPillDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  tabPillActive: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
    ...Shadows.sm,
  },
  tabPillText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  tabPillTextDark: {
    color: '#a1a1aa',
  },
  tabPillTextActive: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    ...Shadows.md,
  },
  petImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f1f5f9',
  },
  imageFallback: {
    width: '100%',
    height: 220,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speciesFloatingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesFloatingBadgeDark: {
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderColor: '#3f3f46',
  },
  speciesFloatingText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
  },
  speciesFloatingTextDark: {
    color: '#fafafa',
  },
  infoCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  nameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  petName: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  petBreed: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  genderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  genderTagText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  statBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  statLabel: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 2,
  },
  ownerSection: {
    backgroundColor: Palette.greenSoft,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
    marginBottom: 12,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
  },
  section: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  sectionTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    lineHeight: 20,
  },
  btnEditMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.greenSoft,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    borderRadius: Radius.md,
    paddingVertical: 12,
    marginTop: 14,
  },
  btnEditMainDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  btnEditMainText: {
    color: Palette.greenDeep,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  countBadge: {
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  countBadgeDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  countBadgeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  // NFC Card
  nfcCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nfcStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  nfcBadgeLinked: {
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  nfcBadgeUnlinked: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  nfcStatusBadgeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
  },
  nfcStatusTextLinked: {
    color: Palette.greenDeep,
  },
  nfcStatusTextUnlinked: {
    color: '#92400e',
  },
  nfcDetailsBox: {
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  nfcDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  nfcDetailLabel: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  nfcDetailValue: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: Typography.size.tiny,
  },
  relinkNfcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
    borderRadius: Radius.md,
    paddingVertical: 10,
    marginTop: 12,
  },
  relinkNfcBtnText: {
    color: Palette.greenDeep,
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
  unlinkedNfcBox: {
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 12,
  },
  unlinkedNfcDesc: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  linkNfcPrimaryBtn: {
    backgroundColor: Palette.greenDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  linkNfcPrimaryBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  // History
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    gap: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.greenDeep,
  },
  historyTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  historySubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  backHomeBtn: {
    marginTop: 18,
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadows.md,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.body,
    fontFamily: Typography.family.bodyBold,
  },
  textDark: {
    color: '#fafafa',
  },
  textSecondaryDark: {
    color: '#a1a1aa',
  },
  ownerSectionDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.15)',
    borderColor: 'rgba(8, 122, 67, 0.3)',
  },
  ownerLabelDark: {
    color: '#4ade80',
  },
  sectionDark: {
    borderTopColor: '#27272a',
  },
  nfcBadgeLinkedDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  nfcBadgeUnlinkedDark: {
    backgroundColor: '#451a03',
    borderColor: '#78350f',
  },
  nfcStatusTextLinkedDark: {
    color: '#4ade80',
  },
  nfcStatusTextUnlinkedDark: {
    color: '#fcd34d',
  },
  nfcDetailsBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  nfcDetailRowDark: {
    borderBottomColor: '#3f3f46',
  },
  relinkNfcBtnDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  relinkNfcBtnTextDark: {
    color: '#4ade80',
  },
  unlinkedNfcBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  imageFallbackDark: {
    backgroundColor: '#18181b',
  },
  historyRowDark: {
    borderBottomColor: '#27272a',
  },
  scrollViewDark: {
    backgroundColor: '#09090b',
  },
  btnToggleExtravio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  btnExtraviadaActive: {
    backgroundColor: Palette.redEmergency,
  },
  btnExtraviadaInactive: {
    backgroundColor: Palette.greenDeep,
  },
  btnToggleExtravioText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#ffffff',
  },
  lostAlertBox: {
    backgroundColor: Palette.redSoft,
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: Palette.redEmergency,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  lostAlertBoxTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.redEmergency,
  },
  lostAlertBoxText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  scanDetectedBox: {
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  scanDetectedBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  scanDetectedTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  scanDetectedDate: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  scanDetectedCoords: {
    fontSize: Typography.size.caption,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  btnOpenMap: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  btnOpenMapText: {
    color: '#ffffff',
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
  noScansText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textMuted,
    marginTop: 10,
    fontStyle: 'italic',
  },
  btnPreviewPublic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  btnPreviewPublicText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
});
