import QRMascotaCard from '@/components/QRMascotaCard';
import VincularNfcModal from '@/components/VincularNfcModal';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { getPetById, toggleEstadoExtravio, type Pet } from '@/services/petService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

export default function MascotaDetalleScreen() {
  const { isDark } = useAppTheme();
  const { isVeterinario } = useAuth();

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
  const displayPeso = pet?.peso !== undefined ? String(pet.peso) : params.peso || 'N/A';
  const displayEdad = pet?.edad !== undefined ? String(pet.edad) : pet?.fechaNacimiento || params.edad || 'N/A';
  const displayFotoUrl = pet?.fotoUrl || params.fotoUrl || '';
  const displayDescripcion = pet?.descripcion || params.descripcion || '';
  const displayPropietario = pet?.propietario || '';
  const displayTelefono = pet?.telefonoContacto || '';
  const isNfcLinked = pet?.nfcStatus === 'linked';

  const isMale = displaySexo.toLowerCase().includes('macho');
  const isGato = displayEspecie.toLowerCase().includes('gato');

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
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular o modificar etiquetas NFC en HuellaApp.\n\nPuedes cambiar tu rol a Veterinario en la sección "Mi Perfil" para probar esta funcionalidad.'
      );
      return;
    }
    setNfcModalVisible(true);
  };

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
          <Ionicons name="arrow-back" size={20} color={isDark ? '#fafafa' : Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDark && styles.textDark]}>
          Ficha Clínica
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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

      <ScrollView
        style={[{ flex: 1 }, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Palette.greenPrimary]} />
        }
      >
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
                { backgroundColor: isMale ? (isDark ? 'rgba(2, 132, 199, 0.2)' : Palette.cyanLight) : (isDark ? 'rgba(244, 114, 182, 0.2)' : '#fff1f2') },
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
                {displayEdad !== 'N/A' ? `${displayEdad} años` : 'Sin edad'}
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
        </View>

        {/* ── CARD DE SEGURIDAD, EXTRAVÍO Y LOCALIZACIÓN DE RESCATE ──────── */}
        <View style={[styles.infoCard, isDark && styles.cardDark, { marginTop: 14 }]}>
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
                  Último Escaneo Detectado
                </Text>
              </View>
              <Text style={[styles.scanDetectedDate, isDark && styles.textSecondaryDark]}>
                {new Date(pet.ultimoEscaneo.fecha).toLocaleString()}
              </Text>
              <Text style={[styles.scanDetectedCoords, isDark && styles.textSecondaryDark]}>
                GPS: {pet.ultimoEscaneo.lat.toFixed(5)}, {pet.ultimoEscaneo.lng.toFixed(5)}
              </Text>

              <TouchableOpacity
                style={styles.btnOpenMap}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${pet.ultimoEscaneo!.lat},${pet.ultimoEscaneo!.lng}`
                  )
                }
              >
                <Ionicons name="map-outline" size={16} color="#ffffff" />
                <Text style={styles.btnOpenMapText}>Ver Ubicación en Google Maps</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.noScansText, isDark && styles.textSecondaryDark]}>
              Aún no se registran escaneos de rescate para esta mascota.
            </Text>
          )}

          {/* Enlace para probar la ficha pública */}
          <TouchableOpacity
            style={styles.btnPreviewPublic}
            onPress={() => router.push({ pathname: '/pet', params: { id: displayId } } as any)}
          >
            <Ionicons name="open-outline" size={16} color={Palette.greenDeep} />
            <Text style={styles.btnPreviewPublicText}>Ver Ficha Pública de Rescate (Web)</Text>
          </TouchableOpacity>
        </View>

        {/* ── CARD DE IDENTIFICACIÓN NFC (SECCIÓN CLÍNICA) ────────────────── */}
        <View style={[styles.infoCard, isDark && styles.cardDark, { marginTop: 14 }]}>
          <View style={styles.nfcCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="nfc" size={22} color={Palette.greenDeep} />
              <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginBottom: 0 }]}>
                Identificación NFC
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
                {isNfcLinked ? 'Vinculada' : 'No vinculada'}
              </Text>
            </View>
          </View>

          {isNfcLinked ? (
            <View style={[styles.nfcDetailsBox, isDark && styles.nfcDetailsBoxDark]}>
              <View style={[styles.nfcDetailRow, isDark && styles.nfcDetailRowDark]}>
                <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>ID de Etiqueta:</Text>
                <Text style={[styles.nfcDetailValue, isDark && styles.textDark]}>{pet?.nfcTagId || 'N/A'}</Text>
              </View>
              <View style={[styles.nfcDetailRow, isDark && styles.nfcDetailRowDark]}>
                <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>Enlace Oficial:</Text>
                <Text style={[styles.nfcDetailValue, styles.monospace, isDark && styles.textDark]}>
                  {pet?.nfcUrl || `https://huellapp.app/pet?id=${displayId}`}
                </Text>
              </View>
              {pet?.nfcLinkedAt && (
                <View style={[styles.nfcDetailRow, isDark && styles.nfcDetailRowDark]}>
                  <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>Fecha de vinculación:</Text>
                  <Text style={[styles.nfcDetailValue, isDark && styles.textDark]}>
                    {new Date(pet.nfcLinkedAt).toLocaleString('es-AR')}
                  </Text>
                </View>
              )}
              {pet?.nfcLinkedBy && (
                <View style={[styles.nfcDetailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>Veterinario Emisor:</Text>
                  <Text style={[styles.nfcDetailValue, isDark && styles.textDark]}>{pet.nfcLinkedBy}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.relinkNfcBtn, isDark && styles.relinkNfcBtnDark]}
                onPress={handleOpenVincularNfc}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="nfc" size={18} color={Palette.greenDeep} style={{ marginRight: 6 }} />
                <Text style={[styles.relinkNfcBtnText, isDark && styles.relinkNfcBtnTextDark]}>
                  Reasignar o Reescribir Etiqueta NFC
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.unlinkedNfcBox, isDark && styles.unlinkedNfcBoxDark]}>
              <Text style={[styles.unlinkedNfcDesc, isDark && styles.textSecondaryDark]}>
                Esta mascota aún no tiene una etiqueta NFC asociada. Acerca una etiqueta compatible para vincularla a este registro oficial.
              </Text>
              <TouchableOpacity
                style={styles.linkNfcPrimaryBtn}
                onPress={handleOpenVincularNfc}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="nfc" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.linkNfcPrimaryBtnText}>Vincular Etiqueta NFC</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Secciones de Salud & Historial Clínico */}
        <View style={[styles.infoCard, isDark && styles.cardDark, { marginTop: 14 }]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Historial Clínico
          </Text>

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
            <View style={styles.historyEmptyBox}>
              <Ionicons name="medical-outline" size={26} color={Palette.textMuted} />
              <Text style={[styles.historyEmptyText, isDark && styles.textDark]}>
                Sin registros clínicos previos
              </Text>
              <Text style={[styles.historyEmptySubtext, isDark && styles.textSecondaryDark]}>
                Las consultas, vacunas y observaciones registradas para esta mascota aparecerán en esta sección.
              </Text>
            </View>
          )}
        </View>

        {/* Sección QR — Generador nativo y Placas STL 3D */}
        <QRMascotaCard
          petId={displayId}
          petName={displayNombre}
          isDark={isDark}
        />

        {/* Botón de volver */}
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeBtnText}>Volver a Mis Mascotas</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Vincular NFC Integrado */}
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
    paddingVertical: 12,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
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
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    ...Shadows.md,
  },
  petImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f1f5f9',
  },
  imageFallback: {
    width: '100%',
    height: 240,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speciesFloatingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesFloatingText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
  },
  infoCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 20,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.md,
    padding: 12,
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
    marginBottom: 14,
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
    marginTop: 8,
    paddingTop: 14,
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
  historyEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  historyEmptyText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  historyEmptySubtext: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  backHomeBtn: {
    marginTop: 24,
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.md,
    paddingVertical: 15,
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
  speciesFloatingBadgeDark: {
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderColor: '#3f3f46',
  },
  speciesFloatingTextDark: {
    color: '#fafafa',
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
