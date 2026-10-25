import QRMascotaCard from '@/components/QRMascotaCard';
import VincularNfcModal from '@/components/VincularNfcModal';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { getPetById, type Pet } from '@/services/petService';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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

  // Firestore es la FUENTE DE VERDAD: Consultamos los datos actualizados del documento
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

  // Datos consolidados (prioriza Firestore en tiempo real, con fallback a route params)
  const displayId = pet?.id || params.id || 'PET-001';
  const displayNombre = pet?.nombre || params.nombre || 'Mascota';
  const displayEspecie = pet?.especie || params.especie || 'Perro';
  const displayRaza = pet?.raza || params.raza || 'Raza no especificada';
  const displaySexo = pet?.sexo || params.sexo || 'N/A';
  const displayPeso = pet?.peso !== undefined ? String(pet.peso) : params.peso || 'N/A';
  const displayEdad = pet?.edad !== undefined ? String(pet.edad) : pet?.fechaNacimiento || params.edad || 'N/A';
  const displayFotoUrl = pet?.fotoUrl || params.fotoUrl || '';
  const displayDescripcion = pet?.descripcion || params.descripcion || '';
  const displayPropietario = pet?.propietario || '';
  const displayTelefono = pet?.telefonoContacto || '';
  const isNfcLinked = pet?.nfcStatus === 'linked';

  const isMale = displaySexo.toLowerCase().includes('macho');

  const handleOpenVincularNfc = () => {
    if (!isVeterinario) {
      Alert.alert(
        'Acceso Denegado (Seguridad)',
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular o modificar etiquetas NFC en VetLink.\n\nPuedes cambiar tu rol a Veterinario en la sección "Mi Perfil" para probar esta funcionalidad.'
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
          <Ionicons name="arrow-back" size={22} color={isDark ? '#fafafa' : '#0f172a'} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDark && styles.textDark]}>
          Ficha Clínica: {displayNombre}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ThemeToggleButton />
          <TouchableOpacity
            style={[styles.backButton, isDark && styles.buttonDark]}
            activeOpacity={0.7}
            onPress={onRefresh}
            accessibilityLabel="Actualizar ficha"
          >
            <Ionicons name="refresh" size={20} color="#04b639" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[{ flex: 1 }, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#04b639']} />
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
              <MaterialIcons name="pets" size={72} color="#04b639" />
            </View>
          )}

          <View style={[styles.speciesFloatingBadge, isDark && styles.speciesFloatingBadgeDark]}>
            <Text style={[styles.speciesFloatingText, isDark && styles.speciesFloatingTextDark]}>
              {displayEspecie === 'Gato' ? '🐱 Gato' : '🐶 Perro'} • {displayId}
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
                { backgroundColor: isMale ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#831843' : '#fce7f3') },
              ]}
            >
              <Ionicons
                name={isMale ? 'male' : 'female'}
                size={14}
                color={isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d')}
              />
              <Text
                style={[
                  styles.genderTagText,
                  { color: isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d') },
                ]}
              >
                {displaySexo}
              </Text>
            </View>
          </View>

          {/* Ficha técnica rápida */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="scale" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Peso</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>{displayPeso}</Text>
            </View>

            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="cake" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>Edad</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>{displayEdad}</Text>
            </View>

            <View style={[styles.statBox, isDark && styles.statBoxDark]}>
              <MaterialIcons name="verified" size={20} color="#04b639" />
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>ID Estable</Text>
              <Text style={[styles.statValue, isDark && styles.textDark]}>{displayId}</Text>
            </View>
          </View>

          {/* Propietario / Contacto */}
          {displayPropietario ? (
            <View style={[styles.ownerSection, isDark && styles.ownerSectionDark]}>
              <View style={styles.ownerRow}>
                <Ionicons name="person" size={16} color="#04b639" />
                <Text style={[styles.ownerLabel, isDark && styles.ownerLabelDark]}>
                  Tutor / Propietario:{' '}
                  <Text style={{ fontWeight: '700' }}>{displayPropietario}</Text>
                </Text>
              </View>
              {displayTelefono ? (
                <View style={[styles.ownerRow, { marginTop: 4 }]}>
                  <Ionicons name="call" size={16} color="#04b639" />
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

        {/* ── CARD DE IDENTIFICACIÓN NFC (SECCIÓN CLÍNICA) ────────────────── */}
        <View style={[styles.infoCard, isDark && styles.cardDark, { marginTop: 14 }]}>
          <View style={styles.nfcCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="nfc" size={22} color="#04b639" />
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
                name={isNfcLinked ? 'checkmark-circle' : 'alert-circle'}
                size={14}
                color={isNfcLinked ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#fcd34d' : '#92400e')}
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
                <Text style={[styles.nfcDetailLabel, isDark && styles.textSecondaryDark]}>Enlace de Identificación:</Text>
                <Text style={[styles.nfcDetailValue, styles.monospace, isDark && styles.textDark]}>
                  {pet?.nfcUrl || `https://vetlink.app/pet?id=${displayId}`}
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
                <MaterialIcons name="nfc" size={18} color="#04b639" style={{ marginRight: 6 }} />
                <Text style={[styles.relinkNfcBtnText, isDark && styles.relinkNfcBtnTextDark]}>Reasignar o Reescribir Etiqueta NFC</Text>
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
                <MaterialIcons name="nfc" size={18} color="#ffffff" style={{ marginRight: 8 }} />
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
                  name={item.completado ? 'checkmark-circle' : 'time-outline'}
                  size={20}
                  color={item.completado ? '#04b639' : '#f59e0b'}
                />
              </View>
            ))
          ) : (
            <View style={styles.historyEmptyBox}>
              <Ionicons name="medical-outline" size={26} color={isDark ? '#71717a' : '#9ca3af'} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  ownerSection: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 14,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerLabel: {
    fontSize: 13,
    color: '#166534',
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
    borderRadius: 20,
  },
  nfcBadgeLinked: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcBadgeUnlinked: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  nfcStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nfcStatusTextLinked: {
    color: '#15803d',
  },
  nfcStatusTextUnlinked: {
    color: '#92400e',
  },
  nfcDetailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nfcDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  nfcDetailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  nfcDetailValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: 11,
  },
  relinkNfcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  relinkNfcBtnText: {
    color: '#04b639',
    fontSize: 13,
    fontWeight: '700',
  },
  unlinkedNfcBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  unlinkedNfcDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  linkNfcPrimaryBtn: {
    backgroundColor: '#04b639',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  linkNfcPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // History
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
  historyEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  historyEmptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
    textAlign: 'center',
  },
  historyEmptySubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
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
  ownerSectionDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  ownerLabelDark: {
    color: '#4ade80',
  },
  sectionDark: {
    borderTopColor: '#27272a',
  },
  nfcBadgeLinkedDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
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
    backgroundColor: '#132e1f',
    borderColor: '#166534',
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
});
