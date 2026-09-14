import { auth } from '@/config/firebase';
import { getPetById, linkPetToUser, type Pet } from '@/services/petService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';

// Import dinámico: evita que Expo Go crashee al cargar el módulo nativo
// En Expo Go el require falla silenciosamente; en el dev-client funciona normal
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;
try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch {
  // Módulo nativo no disponible (Expo Go / web)
}

// Pantalla para identificar mascotas por QR o NFC
export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [esperandoNFC, setEsperandoNFC] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mascota, setMascota] = useState<Pet | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState(false);

  // Vincula la mascota al usuario logueado en Firestore y redirige a Mis Mascotas
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo vincular la mascota en este momento.');
    } finally {
      setVinculando(false);
    }
  };

  // Muestra un mensaje en pantalla (funciona en web y en app)
  const mostrarAviso = (msg: string) => {
    setAviso(msg);
    setTimeout(() => setAviso(null), 4000);
  };

  // Busca la mascota en Firestore con el ID dado (QR o NFC)
  const buscarMascota = async (id: string) => {
    // Requerir que el usuario esté autenticado antes de leer Firestore
    if (!auth.currentUser) {
      Alert.alert('Necesitas iniciar sesión', 'Inicia sesión para buscar mascotas en la base de datos.');
      return;
    }

    setCargando(true);
    try {
      const resultado = await getPetById(id);
      if (resultado) {
        setMascota(resultado);
      } else {
        Alert.alert('No encontrada', `No hay mascota con el ID "${id.toUpperCase()}".`);
      }
    } catch {
      Alert.alert('Error', 'No se pudo consultar la base de datos.');
    } finally {
      setCargando(false);
    }
  };

  // ── QR ──────────────────────────────────────────────────────────────────────

  const abrirCamara = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permiso requerido', 'Debes permitir el acceso a la cámara.');
        return;
      }
    }
    setMascota(null);
    setCamaraActiva(true);
  };

  const alEscanearQR = async (result: BarcodeScanningResult) => {
    setCamaraActiva(false);
    // Extraer un ID válido del texto del QR (acepta "PET-001", URLs con ?id=PET-001, o paths que terminen en PET-001)
    const petId = parsePetIdFromQR(result.data);
    if (!petId) {
      Alert.alert('QR inválido', 'El código QR no contiene un identificador de mascota válido.');
      return;
    }

    await buscarMascota(petId);
  };

  // ── NFC ─────────────────────────────────────────────────────────────────────

  const leerNFC = async () => {
    // En web no hay soporte nativo
    if (Platform.OS === 'web') {
      mostrarAviso('⚠️ NFC no disponible en web. Usá la app instalada en Android.');
      return;
    }

    // Si el módulo nativo no cargó (Expo Go), mostramos aviso y salimos
    if (!NfcManager) {
      mostrarAviso('⚠️ NFC requiere el development build (APK). No funciona en Expo Go.');
      return;
    }

    setMascota(null);

    try {
      const soportado = await NfcManager.isSupported();
      if (!soportado) {
        Alert.alert('NFC no disponible', 'Este dispositivo no soporta NFC.');
        return;
      }

      await NfcManager.start();

      const activado = await NfcManager.isEnabled();
      if (!activado) {
        Alert.alert('NFC desactivado', 'Activá el NFC en los ajustes del dispositivo.');
        return;
      }

      setEsperandoNFC(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      if (!tag?.ndefMessage?.[0]) {
        Alert.alert('Tag inválido', 'El tag NFC no contiene datos NDEF.');
        return;
      }

      const payload = tag.ndefMessage[0].payload;
      const petId = Ndef.text.decodePayload(new Uint8Array(payload));

      await buscarMascota(petId);
    } catch (error: any) {
      if (error?.message !== 'cancelled') {
        Alert.alert('NFC no disponible', 'No se pudo leer el tag. Probá desde la app en Android.');
      }
    } finally {
      setEsperandoNFC(false);
      NfcManager?.cancelTechnologyRequest().catch(() => { });
    }
  };

  const cancelarNFC = () => {
    NfcManager?.cancelTechnologyRequest().catch(() => { });
    setEsperandoNFC(false);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Identificar Mascota</Text>
      <Text style={styles.subtitulo}>Escaneá el QR o acercá el tag NFC</Text>

      {/* Banner de aviso (reemplaza Alert en web) */}
      {aviso && (
        <View style={styles.avisoBanner}>
          <Text style={styles.avisoTexto}>{aviso}</Text>
        </View>
      )}

      {cargando && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#04b639" />
          <Text style={styles.textoCargando}>Buscando en la base de datos...</Text>
        </View>
      )}

      {/* Ficha de la mascota encontrada */}
      {mascota && !cargando && (
        <View style={styles.card}>
          <Text style={styles.nombreMascota}>🐾 {mascota.nombre}</Text>
          <Text style={styles.subtituloMascota}>{mascota.especie} — {mascota.raza}</Text>
          <View style={styles.separador} />
          <Dato label="ID" valor={mascota.id} />
          <Dato label="Sexo" valor={mascota.sexo} />
          <Dato label="Peso" valor={mascota.peso} />
          <Dato label="Nacimiento" valor={mascota.fechaNacimiento} />
          <Dato label="Propietario" valor={mascota.propietario} />
          {mascota.telefonoContacto && <Dato label="Teléfono" valor={mascota.telefonoContacto} />}
          
          <TouchableOpacity
            style={[styles.botonVerde, vinculando && { opacity: 0.7 }]}
            onPress={handleVincularMascota}
            disabled={vinculando}
          >
            <Text style={styles.textoBoton}>
              {vinculando ? 'Vinculando a tu cuenta...' : '🔗 Vincular a Mi Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
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
            <Text style={styles.textoBotonSecundario}>Ver Detalle Completo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botonSecundario, { marginTop: 6 }]} onPress={() => setMascota(null)}>
            <Text style={styles.textoBotonSecundario}>Escanear otra mascota</Text>
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
          <TouchableOpacity style={styles.botonCancelar} onPress={() => setCamaraActiva(false)}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Esperando que el usuario acerque el tag NFC */}
      {esperandoNFC && (
        <View style={styles.card}>
          <MaterialIcons name="nfc" size={60} color="#04b639" style={{ marginBottom: 12 }} />
          <Text style={styles.textoNFC}>Acercá el tag NFC al dispositivo...</Text>
          <TouchableOpacity style={styles.botonCancelarInline} onPress={cancelarNFC}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones iniciales: QR y NFC */}
      {!camaraActiva && !esperandoNFC && !mascota && !cargando && (
        <View style={styles.filaBotones}>
          <TouchableOpacity style={styles.tarjetaAccion} onPress={abrirCamara}>
            <MaterialIcons name="qr-code-scanner" size={48} color="#04b639" />
            <Text style={styles.etiquetaAccion}>Escanear QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tarjetaAccion} onPress={leerNFC}>
            <MaterialIcons name="nfc" size={48} color="#04b639" />
            <Text style={styles.etiquetaAccion}>Leer NFC</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// Intenta extraer un ID con formato PET-123 desde el texto del QR.
function parsePetIdFromQR(text: string): string | null {
  if (!text) return null;
  const t = text.trim();

  // 1) Buscar patrón PET- seguido de números
  const re = /PET-\d+/i;
  const m = t.match(re);
  if (m) return m[0].toUpperCase();

  try {
    // 2) Si es una URL con query param (ej: ?id=PET-001)
    const url = new URL(t);
    const idParam = url.searchParams.get('id') || url.searchParams.get('petId') || url.searchParams.get('pet');
    if (idParam && idParam.match(re)) return idParam.trim().toUpperCase();

    // 3) Intentar extraer el último segmento de la path
    const segments = url.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && last.match(re)) return last.toUpperCase();
  } catch {
    // no es una URL válida, ya intentamos el patrón simple arriba
  }

  return null;
}

// Componente simple para una fila de dato (Ej: "Peso: 28 kg")
function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <Text style={styles.dato}>
      <Text style={styles.datoLabel}>{label}: </Text>{valor}
    </Text>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  avisoBanner: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  avisoTexto: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  nombreMascota: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#04b639',
    alignSelf: 'flex-start',
  },
  subtituloMascota: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  separador: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
    width: '100%',
  },
  dato: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  datoLabel: {
    fontWeight: 'bold',
  },
  cajaCamara: {
    width: '100%',
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    position: 'relative',
  },
  textoNFC: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginTop: 10,
  },
  tarjetaAccion: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#04b639',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  etiquetaAccion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#04b639',
  },
  botonVerde: {
    backgroundColor: '#04b639',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    width: '100%',
  },
  botonSecundario: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotonSecundario: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  botonCancelar: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  botonCancelarInline: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  textoCancelar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
