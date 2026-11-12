import { auth } from '@/config/firebase';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { nfcService } from '@/services/nfcService';
import { getPetById, linkPetToUser, type Pet } from '@/services/petService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

export default function ScanScreen() {
  const { isDark } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [esperandoNFC, setEsperandoNFC] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mascota, setMascota] = useState<Pet | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState(false);

  // Vincula la mascota al usuario logueado en Firestore
  const handleVincularMascota = async () => {
    if (!mascota) return;
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para vincular una mascota a tu cuenta.');
      return;
    }

    setVinculando(true);
    try {
      await linkPetToUser(mascota.id, user.uid);
      Alert.alert(
        '¡Mascota vinculada!',
        `${mascota.nombre} ahora está vinculada a tu cuenta de forma permanente.`,
        [
          {
            text: 'Ir a Mis Mascotas',
            onPress: () => {
              setMascota(null);
              router.replace('/(tabs)/mascotas');
            },
          },
        ]
      );
      if (Platform.OS === 'web') {
        setMascota(null);
        router.replace('/(tabs)/mascotas');
      }
    } catch {
      Alert.alert('Error', 'No se pudo vincular la mascota en este momento.');
    } finally {
      setVinculando(false);
    }
  };

  const mostrarAviso = (msg: string) => {
    setAviso(msg);
    setTimeout(() => setAviso(null), 4000);
  };

  const buscarMascota = async (id: string) => {
    if (!auth.currentUser) {
      Alert.alert('Necesitas iniciar sesión', 'Inicia sesión para consultar la información de la mascota.');
      return;
    }

    setCargando(true);
    try {
      const resultado = await getPetById(id);
      if (resultado) {
        setMascota(resultado);
      } else {
        Alert.alert(
          'Mascota no encontrada',
          `Se leyó el ID "${id.toUpperCase()}", pero no existe ningún registro clínico asociado en el sistema.`
        );
      }
    } catch {
      Alert.alert('Error de conexión', 'No se pudo consultar la información. Por favor, verifica tu conexión a internet.');
    } finally {
      setCargando(false);
    }
  };

  // ── QR ──────────────────────────────────────────────────────────────────────
  const abrirCamara = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permiso requerido', 'Debes permitir el acceso a la cámara para escanear el código QR.');
        return;
      }
    }
    setMascota(null);
    setCamaraActiva(true);
  };

  const alEscanearQR = async (result: BarcodeScanningResult) => {
    setCamaraActiva(false);
    const petId = nfcService.parsePetIdFromPayload(result.data);
    if (!petId) {
      Alert.alert('QR no reconocido', 'El código QR escaneado no contiene un identificador válido de HuellaApp.');
      return;
    }

    await buscarMascota(petId);
  };

  // ── NFC ─────────────────────────────────────────────────────────────────────
  const leerNFC = async () => {
    if (Platform.OS === 'web') {
      mostrarAviso('NFC no disponible en navegador web. Utiliza la aplicación instalada en tu dispositivo móvil.');
      return;
    }

    if (!nfcService.isModuleAvailable()) {
      mostrarAviso('La función NFC requiere un dispositivo móvil compatible.');
      return;
    }

    setMascota(null);

    try {
      const soportado = await nfcService.isSupported();
      if (!soportado) {
        Alert.alert('NFC no soportado', 'Este dispositivo no cuenta con sensor NFC.');
        return;
      }

      const activado = await nfcService.isEnabled();
      if (!activado) {
        Alert.alert(
          'NFC desactivado',
          'Por favor, activa el sensor NFC en los ajustes de tu teléfono.',
          [
            { text: 'Ajustes', onPress: () => nfcService.goToSettings() },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
        return;
      }

      setEsperandoNFC(true);
      const resultado = await nfcService.readTag();

      if (resultado.isNdefEmpty) {
        Alert.alert('Etiqueta vacía', 'La etiqueta NFC leída no contiene datos grabados.');
        return;
      }

      if (!resultado.petId) {
        Alert.alert(
          'Etiqueta no reconocida',
          'La etiqueta contiene datos que no corresponden a una mascota registrada en HuellaApp.'
        );
        return;
      }

      await buscarMascota(resultado.petId);
    } catch (error: any) {
      if (error?.message !== 'cancelled') {
        Alert.alert('Lectura NFC', error?.message || 'No se pudo leer la etiqueta NFC.');
      }
    } finally {
      setEsperandoNFC(false);
      await nfcService.cancelSession();
    }
  };

  const cancelarNFC = async () => {
    await nfcService.cancelSession();
    setEsperandoNFC(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#09090b' : Palette.backgroundLight }}
      contentContainerStyle={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, isDark && styles.textDark]}>Identificar Mascota</Text>
          <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>
            Escanea la chapita con código QR o acerca el collar NFC
          </Text>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Banner de aviso */}
      {aviso && (
        <View style={[styles.avisoBanner, isDark && styles.avisoBannerDark]}>
          <Ionicons name="information-circle-outline" size={18} color="#92400E" />
          <Text style={[styles.avisoTexto, isDark && styles.avisoTextoDark]}>{aviso}</Text>
        </View>
      )}

      {cargando && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <ActivityIndicator size="large" color={Palette.greenPrimary} />
          <Text style={[styles.textoCargando, isDark && styles.subtituloDark]}>
            Buscando ficha de la mascota...
          </Text>
        </View>
      )}

      {/* Ficha de la mascota encontrada */}
      {mascota && !cargando && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.petHeaderRow}>
            <View style={styles.petIconCircle}>
              <MaterialCommunityIcons
                name={mascota.especie?.toLowerCase().includes('gato') ? 'cat' : 'dog'}
                size={24}
                color={Palette.greenDeep}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.nombreMascota, isDark && styles.textDark]}>{mascota.nombre}</Text>
              <Text style={[styles.subtituloMascota, isDark && styles.subtituloDark]}>
                {mascota.especie} • {mascota.raza || 'Mestizo'}
              </Text>
            </View>
          </View>

          <View style={[styles.separador, isDark && styles.separadorDark]} />

          <Dato label="ID de Ficha" valor={mascota.id} isDark={isDark} />
          <Dato label="Sexo" valor={mascota.sexo || 'No informado'} isDark={isDark} />
          <Dato label="Peso" valor={mascota.peso ? `${mascota.peso} kg` : 'Sin peso registrado'} isDark={isDark} />
          <Dato label="Fecha de Nacimiento" valor={mascota.fechaNacimiento || 'No informada'} isDark={isDark} />
          <Dato label="Tutor / Propietario" valor={mascota.propietario || 'No especificado'} isDark={isDark} />
          {mascota.telefonoContacto && (
            <Dato label="Teléfono de Contacto" valor={mascota.telefonoContacto} isDark={isDark} />
          )}
          <Dato
            label="Chip NFC"
            valor={mascota.nfcStatus === 'linked' ? 'Etiqueta Vinculada' : 'Sin etiqueta NFC'}
            isDark={isDark}
          />

          {/* Estado de vinculación al usuario */}
          {mascota.userId === auth.currentUser?.uid || mascota.ownerId === auth.currentUser?.uid ? (
            <View style={[styles.statusBox, styles.statusBoxOwned, isDark && styles.statusBoxOwnedDark]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Palette.greenDeep} />
              <Text style={[styles.statusBoxText, { color: Palette.greenDeep }]}>
                Esta mascota ya está vinculada a tu cuenta.
              </Text>
            </View>
          ) : mascota.userId || mascota.ownerId ? (
            <View style={[styles.statusBox, styles.statusBoxOther, isDark && styles.statusBoxOtherDark]}>
              <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
              <Text style={[styles.statusBoxText, { color: '#1d4ed8' }]}>
                Esta mascota ya tiene un dueño asignado.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.botonVerde, vinculando && { opacity: 0.7 }]}
              onPress={handleVincularMascota}
              disabled={vinculando}
              activeOpacity={0.85}
            >
              <Ionicons name="link-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.textoBoton}>
                {vinculando ? 'Vinculando a tu cuenta...' : 'Vincular a Mi Cuenta'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.botonSecundario, isDark && styles.botonSecundarioDark]}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: '/mascotas/[id]',
                params: {
                  id: mascota.id,
                  nombre: mascota.nombre,
                  especie: mascota.especie,
                  raza: mascota.raza,
                  sexo: mascota.sexo,
                  peso: String(mascota.peso),
                  edad: mascota.fechaNacimiento || 'No aclarado',
                  fotoUrl: '',
                  descripcion: `Propietario: ${mascota.propietario}${mascota.telefonoContacto ? ` - Tel: ${mascota.telefonoContacto}` : ''}`,
                },
              });
            }}
          >
            <Ionicons name="document-text-outline" size={16} color={Palette.greenDeep} style={{ marginRight: 6 }} />
            <Text style={[styles.textoBotonSecundario, isDark && styles.textDark]}>
              Ver Detalle Completo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonOutline, isDark && styles.botonOutlineDark]}
            activeOpacity={0.8}
            onPress={() => setMascota(null)}
          >
            <Text style={[styles.textoBotonOutline, isDark && styles.textDark]}>
              Escanear otra mascota
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vista de la cámara para QR */}
      {camaraActiva && (
        <View style={styles.cajaCamara}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={alEscanearQR}
          />
          {/* Overlay visor de escaneo */}
          <View style={styles.scannerOverlay}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scannerHint}>Apunta la cámara al código QR de la chapita</Text>
          </View>

          <TouchableOpacity style={styles.botonCancelar} onPress={() => setCamaraActiva(false)}>
            <Ionicons name="close-circle-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Esperando que el usuario acerque el tag NFC */}
      {esperandoNFC && (
        <View style={[styles.card, isDark && styles.cardDark, styles.nfcWaitCard]}>
          <View style={styles.nfcPulseCircle}>
            <MaterialCommunityIcons name="nfc" size={54} color={Palette.greenDeep} />
          </View>
          <Text style={[styles.textoNFCTitulo, isDark && styles.textDark]}>Sensor NFC Activo</Text>
          <Text style={[styles.textoNFC, isDark && styles.subtituloDark]}>
            Acerca la parte trasera de tu teléfono a la chapita o collar inteligente de la mascota.
          </Text>
          <TouchableOpacity style={styles.botonCancelarInline} onPress={cancelarNFC}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones iniciales: QR y NFC */}
      {!camaraActiva && !esperandoNFC && !mascota && !cargando && (
        <View style={styles.filaBotones}>
          <TouchableOpacity
            style={[styles.tarjetaAccion, isDark && styles.tarjetaAccionDark]}
            onPress={abrirCamara}
            activeOpacity={0.85}
          >
            <View style={styles.tarjetaIconCircle}>
              <Ionicons name="qr-code-outline" size={32} color={Palette.greenDeep} />
            </View>
            <Text style={styles.etiquetaAccion}>Escanear QR</Text>
            <Text style={[styles.descAccion, isDark && styles.subtituloDark]}>
              Abre la cámara para leer el código de la chapita
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tarjetaAccion, isDark && styles.tarjetaAccionDark]}
            onPress={leerNFC}
            activeOpacity={0.85}
          >
            <View style={styles.tarjetaIconCircle}>
              <MaterialCommunityIcons name="nfc" size={32} color={Palette.greenDeep} />
            </View>
            <Text style={styles.etiquetaAccion}>Leer NFC</Text>
            <Text style={[styles.descAccion, isDark && styles.subtituloDark]}>
              Acerca el teléfono al collar para lectura instantánea
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Dato({ label, valor, isDark }: { label: string; valor: string; isDark?: boolean }) {
  return (
    <View style={styles.datoRow}>
      <Text style={[styles.datoLabel, isDark && styles.datoLabelDark]}>{label}</Text>
      <Text style={[styles.datoValor, isDark && styles.textDark]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: Palette.backgroundLight,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  titulo: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
  },
  avisoBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 16,
  },
  avisoTexto: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: '#92400E',
    flex: 1,
  },
  avisoBannerDark: {
    backgroundColor: '#451a03',
    borderLeftColor: '#F59E0B',
  },
  avisoTextoDark: {
    color: '#fde68a',
  },
  card: {
    width: '100%',
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
    ...Shadows.md,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  textoCargando: {
    marginTop: 12,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  petHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  petIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombreMascota: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.greenDeep,
  },
  subtituloMascota: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: Palette.borderLight,
    marginVertical: 14,
    width: '100%',
  },
  separadorDark: {
    backgroundColor: '#27272a',
  },
  datoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  datoLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textSecondary,
  },
  datoLabelDark: {
    color: '#a1a1aa',
  },
  datoValor: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  statusBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 14,
  },
  statusBoxOwned: {
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  statusBoxOwnedDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.15)',
    borderColor: 'rgba(8, 122, 67, 0.3)',
  },
  statusBoxOther: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statusBoxOtherDark: {
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    borderColor: 'rgba(29, 78, 216, 0.3)',
  },
  statusBoxText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    flex: 1,
  },
  cajaCamara: {
    width: '100%',
    height: 380,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginTop: 10,
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: Palette.greenPrimary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scannerHint: {
    color: '#ffffff',
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  nfcWaitCard: {
    paddingVertical: 36,
  },
  nfcPulseCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textoNFCTitulo: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  textoNFC: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginTop: 10,
  },
  tarjetaAccion: {
    flex: 1,
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    padding: 20,
    alignItems: 'center',
    ...Shadows.sm,
  },
  tarjetaAccionDark: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(19, 168, 87, 0.4)',
  },
  tarjetaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  etiquetaAccion: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.greenDeep,
    marginBottom: 4,
  },
  descAccion: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  botonVerde: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
  },
  botonSecundario: {
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  botonSecundarioDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  botonOutline: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  botonOutlineDark: {},
  textoBoton: {
    color: '#FFFFFF',
    fontSize: Typography.size.body,
    fontFamily: Typography.family.bodyBold,
  },
  textoBotonSecundario: {
    color: Palette.greenDeep,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
  textoBotonOutline: {
    color: Palette.textSecondary,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
  },
  botonCancelar: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 74, 74, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: Radius.full,
  },
  botonCancelarInline: {
    backgroundColor: Palette.redEmergency,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: Radius.full,
  },
  textoCancelar: {
    color: '#FFFFFF',
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
});
