import { auth } from '@/config/firebase';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { nfcService } from '@/services/nfcService';
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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Pantalla para identificar mascotas por QR o NFC
export default function ScanScreen() {
  const { isDark } = useAppTheme();
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
    } catch {
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

  // Busca la mascota en Firestore con el ID dado (QR o NFC) - Firestore es la FUENTE DE VERDAD
  const buscarMascota = async (id: string) => {
    // Requerir que el usuario esté autenticado antes de leer Firestore
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
        Alert.alert('Permiso requerido', 'Debes permitir el acceso a la cámara.');
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
      Alert.alert('QR inválido', 'El código QR no contiene un identificador de mascota válido.');
      return;
    }

    await buscarMascota(petId);
  };

  // ── NFC ─────────────────────────────────────────────────────────────────────

  const leerNFC = async () => {
    // En web no hay soporte nativo
    if (Platform.OS === 'web') {
      mostrarAviso('⚠️ NFC no disponible en web. Utiliza la app instalada en Android.');
      return;
    }

    // Verificar si el módulo está disponible
    if (!nfcService.isModuleAvailable()) {
      mostrarAviso('⚠️ La función NFC requiere un dispositivo móvil compatible.');
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
          'Por favor, activa el NFC en los ajustes del dispositivo.',
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
        Alert.alert('Etiqueta vacía', 'La etiqueta NFC no contiene datos grabados.');
        return;
      }

      if (!resultado.petId) {
        Alert.alert(
          'Etiqueta no reconocida',
          'La etiqueta contiene datos que no corresponden a una mascota registrada en VetLink.'
        );
        return;
      }

      // Consultar Firestore en tiempo real con el ID extraído de la etiqueta
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

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#ffffff' }}
      contentContainerStyle={[styles.container, isDark && styles.containerDark]}
    >
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, isDark && styles.textDark]}>Identificar Mascota</Text>
          <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>Escaneá el código QR o acercá la etiqueta NFC</Text>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Banner de aviso (reemplaza Alert en web) */}
      {aviso && (
        <View style={[styles.avisoBanner, isDark && styles.avisoBannerDark]}>
          <Text style={[styles.avisoTexto, isDark && styles.avisoTextoDark]}>{aviso}</Text>
        </View>
      )}

      {cargando && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <ActivityIndicator size="large" color="#04b639" />
          <Text style={[styles.textoCargando, isDark && styles.subtituloDark]}>Buscando información de la mascota...</Text>
        </View>
      )}

      {/* Ficha de la mascota encontrada */}
      {mascota && !cargando && (
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={styles.nombreMascota}>🐾 {mascota.nombre}</Text>
          <Text style={[styles.subtituloMascota, isDark && styles.subtituloDark]}>{mascota.especie} — {mascota.raza}</Text>
          <View style={[styles.separador, isDark && styles.separadorDark]} />
          <Dato label="ID" valor={mascota.id} isDark={isDark} />
          <Dato label="Sexo" valor={mascota.sexo} isDark={isDark} />
          <Dato label="Peso" valor={String(mascota.peso)} isDark={isDark} />
          <Dato label="Nacimiento" valor={mascota.fechaNacimiento || 'No especificada'} isDark={isDark} />
          <Dato label="Propietario" valor={mascota.propietario || 'No especificado'} isDark={isDark} />
          {mascota.telefonoContacto && <Dato label="Teléfono" valor={mascota.telefonoContacto} isDark={isDark} />}
          <Dato
            label="Estado NFC"
            valor={mascota.nfcStatus === 'linked' ? '📶 Etiqueta Vinculada' : 'Sin etiqueta NFC'}
            isDark={isDark}
          />

          {/* Estado de vinculación al usuario */}
          {mascota.userId === auth.currentUser?.uid || mascota.ownerId === auth.currentUser?.uid ? (
            <View style={[styles.avisoBanner, isDark ? { backgroundColor: '#132e1f', borderColor: '#166534', borderLeftColor: '#04b639', marginTop: 12 } : { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderLeftColor: '#04b639', marginTop: 12 }]}>
              <Text style={[styles.avisoTexto, isDark ? { color: '#4ade80' } : { color: '#065F46' }]}>
                ✅ Esta mascota ya está vinculada a tu cuenta.
              </Text>
            </View>
          ) : mascota.userId || mascota.ownerId ? (
            <View style={[styles.avisoBanner, isDark ? { backgroundColor: '#172554', borderColor: '#1e3a8a', borderLeftColor: '#2563EB', marginTop: 12 } : { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', borderLeftColor: '#2563EB', marginTop: 12 }]}>
              <Text style={[styles.avisoTexto, isDark ? { color: '#60a5fa' } : { color: '#1E40AF' }]}>
                ℹ️ Esta mascota ya tiene un dueño asignado.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.botonVerde, vinculando && { opacity: 0.7 }]}
              onPress={handleVincularMascota}
              disabled={vinculando}
            >
              <Text style={styles.textoBoton}>
                {vinculando ? 'Vinculando a tu cuenta...' : '🔗 Vincular a Mi Cuenta'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.botonSecundario, isDark && styles.botonSecundarioDark]}
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
            <Text style={[styles.textoBotonSecundario, isDark && styles.textDark]}>Ver Detalle Completo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botonSecundario, isDark && styles.botonSecundarioDark, { marginTop: 6 }]} onPress={() => setMascota(null)}>
            <Text style={[styles.textoBotonSecundario, isDark && styles.textDark]}>Escanear otra mascota</Text>
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
        <View style={[styles.card, isDark && styles.cardDark]}>
          <MaterialIcons name="nfc" size={60} color="#04b639" style={{ marginBottom: 12 }} />
          <Text style={[styles.textoNFC, isDark && styles.textDark]}>Acercá el tag NFC al dispositivo...</Text>
          <TouchableOpacity style={styles.botonCancelarInline} onPress={cancelarNFC}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones iniciales: QR y NFC */}
      {!camaraActiva && !esperandoNFC && !mascota && !cargando && (
        <View style={styles.filaBotones}>
          <TouchableOpacity style={[styles.tarjetaAccion, isDark && styles.tarjetaAccionDark]} onPress={abrirCamara}>
            <MaterialIcons name="qr-code-scanner" size={48} color="#04b639" />
            <Text style={styles.etiquetaAccion}>Escanear QR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tarjetaAccion, isDark && styles.tarjetaAccionDark]} onPress={leerNFC}>
            <MaterialIcons name="nfc" size={48} color="#04b639" />
            <Text style={styles.etiquetaAccion}>Leer NFC</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}


function Dato({ label, valor, isDark }: { label: string; valor: string; isDark?: boolean }) {
  return (
    <Text style={[styles.dato, isDark && styles.textDark]}>
      <Text style={[styles.datoLabel, isDark && styles.datoLabelDark]}>{label}: </Text>{valor}
    </Text>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#ffffff',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748b',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
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
  avisoBannerDark: {
    backgroundColor: '#451a03',
    borderLeftColor: '#f59e0b',
  },
  avisoTextoDark: {
    color: '#fde68a',
  },
  card: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
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
  separadorDark: {
    backgroundColor: '#27272a',
  },
  dato: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  datoLabel: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  datoLabelDark: {
    color: '#e4e4e7',
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
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#04b639',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  tarjetaAccionDark: {
    backgroundColor: '#132e1f',
    borderColor: '#04b639',
  },
  etiquetaAccion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#04b639',
  },
  botonVerde: {
    backgroundColor: '#04b639',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    width: '100%',
  },
  botonSecundario: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  botonSecundarioDark: {
    backgroundColor: '#27272a',
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
