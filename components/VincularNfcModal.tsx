import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { nfcService } from '@/services/nfcService';
import {
  checkNfcTagInFirestore,
  linkNfcTagToPet,
  type Pet,
  type NfcTagDocument,
} from '@/services/petService';

function generateFallbackTagId(petId: string, prefix = 'TAG'): string {
  const ts = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
  return `${prefix}-${petId}-${ts}`;
}

interface VincularNfcModalProps {
  visible: boolean;
  mascota: Pet | null;
  onClose: () => void;
  onSuccess: (updatedPet: Pet) => void;
}

type PasoVinculacion =
  | 'idle'
  | 'checking'
  | 'waiting_tag'
  | 'tag_conflict'
  | 'writing_nfc'
  | 'saving_firestore'
  | 'firestore_error'
  | 'success'
  | 'no_hardware';

export default function VincularNfcModal({
  visible,
  mascota,
  onClose,
  onSuccess,
}: VincularNfcModalProps) {
  const { user, isVeterinario } = useAuth();
  const { isDark } = useAppTheme();

  const [paso, setPaso] = useState<PasoVinculacion>('idle');
  const [mensajeEstado, setMensajeEstado] = useState<string>('');
  const [tagTecnicoId, setTagTecnicoId] = useState<string>('');
  const [tagConflicto, setTagConflicto] = useState<NfcTagDocument | null>(null);
  const [urlGrabada, setUrlGrabada] = useState<string>('');
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  // Inicializar estado al mostrar el modal (evento onShow, evitando cascading renders)
  const handleModalShow = () => {
    setPaso('idle');
    setMensajeEstado('');
    setTagTecnicoId('');
    setTagConflicto(null);
    setUrlGrabada('');
    setErrorDetalle(null);
  };

  useEffect(() => {
    return () => {
      nfcService.cancelSession().catch(() => {});
    };
  }, []);

  // Manejo de cancelación / cierre seguro
  const handleCerrar = async () => {
    await nfcService.cancelSession().catch(() => {});
    onClose();
  };

  /**
   * Inicia el flujo de vinculación física
   */
  const handleIniciarVinculacion = async () => {
    if (!mascota) return;

    // 1. Verificación obligatoria de permisos de veterinario
    if (!isVeterinario) {
      Alert.alert(
        'Acceso denegado',
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular etiquetas NFC a las mascotas.'
      );
      return;
    }

    // 2. Comprobar si el módulo nativo está disponible (no disponible en web / Expo Go puro)
    if (!nfcService.isModuleAvailable()) {
      setPaso('no_hardware');
      return;
    }

    try {
      setPaso('checking');
      setMensajeEstado('Comprobando hardware NFC del dispositivo...');

      const soportado = await nfcService.isSupported();
      if (!soportado) {
        setPaso('no_hardware');
        return;
      }

      const encendido = await nfcService.isEnabled();
      if (!encendido) {
        Alert.alert(
          'NFC desactivado',
          'Debes activar el NFC en los ajustes de tu dispositivo para vincular la etiqueta.',
          [
            { text: 'Ir a Ajustes', onPress: () => nfcService.goToSettings() },
            { text: 'Cancelar', style: 'cancel', onPress: () => setPaso('idle') },
          ]
        );
        setPaso('idle');
        return;
      }

      // 3. Solicitar acercar la etiqueta
      setPaso('waiting_tag');
      setMensajeEstado('Acerca la etiqueta NFC al reverso de tu dispositivo...');

      // Iniciar sesión NFC: primero leemos la etiqueta para validar si contiene datos previos
      const lectura = await nfcService.readTag();

      if (!lectura.success && lectura.error) {
        throw new Error(lectura.error);
      }

      // Determinar el ID técnico o identificador de tag
      const rawTagId = lectura.tagId || generateFallbackTagId(mascota.id);
      setTagTecnicoId(rawTagId);

      // 4. Comprobar si la etiqueta ya estaba vinculada en Firestore a otra mascota
      if (lectura.tagId) {
        const asociacionExistente = await checkNfcTagInFirestore(lectura.tagId);
        if (
          asociacionExistente &&
          asociacionExistente.status === 'linked' &&
          asociacionExistente.petId !== mascota.id
        ) {
          // Conflicto detectado: la etiqueta pertenece a otra mascota
          setTagConflicto(asociacionExistente);
          setPaso('tag_conflict');
          return;
        }
      }

      // 5. Proceder a escribir físicamente la etiqueta y guardarla en Firestore
      await escribirYVincular(rawTagId);
    } catch (err: any) {
      if (err?.message !== 'cancelled') {
        setErrorDetalle(err?.message || 'Error durante la comunicación NFC.');
        setPaso('idle');
        Alert.alert('Error NFC', err?.message || 'No se pudo leer la etiqueta.');
      } else {
        setPaso('idle');
      }
    }
  };

  /**
   * Escribe el registro NDEF en la etiqueta física y registra la asociación en Firestore
   */
  const escribirYVincular = async (technicalTagId: string) => {
    if (!mascota || !user) return;

    try {
      // Paso 5: Escribir registro NDEF con URL HTTPS
      setPaso('writing_nfc');
      setMensajeEstado(`Grabando identificador en la etiqueta NFC (ID: ${mascota.id})...`);

      const escritura = await nfcService.writePetTag(mascota.id);

      if (!escritura.success) {
        throw new Error(escritura.error || 'Fallo en la escritura física de la etiqueta.');
      }

      setUrlGrabada(escritura.writtenUrl);

      // Paso 6 y 7: Guardar la asociación en el sistema
      setPaso('saving_firestore');
      setMensajeEstado('Verificando y guardando vinculación...');

      await linkNfcTagToPet(mascota.id, {
        tagId: technicalTagId,
        ndefUrl: escritura.writtenUrl,
        vetUid: user.uid,
        tagTech: escritura.tech,
      });

      // Paso 8: Confirmación final (éxito verificado en ambos extremos)
      setPaso('success');

      const mascotaActualizada: Pet = {
        ...mascota,
        nfcTagId: technicalTagId,
        nfcStatus: 'linked',
        nfcUrl: escritura.writtenUrl,
        nfcLinkedAt: new Date().toISOString(),
        nfcLinkedBy: user.uid,
      };

      onSuccess(mascotaActualizada);
    } catch (err: any) {
      console.error('[VincularNfcModal] Error:', err);
      // Si la escritura física funcionó pero falló Firestore:
      if (paso === 'saving_firestore' || urlGrabada !== '') {
        setPaso('firestore_error');
        setErrorDetalle(
          'La etiqueta NFC fue escrita correctamente, pero no se pudo completar el registro en el sistema. La operación quedó incompleta.'
        );
      } else {
        setPaso('idle');
        setErrorDetalle(err?.message || 'No se pudo completar la operación.');
        Alert.alert('Fallo de vinculación', err?.message || 'Ocurrió un error inesperado.');
      }
    }
  };

  /**
   * Reintenta únicamente la asociación en Firestore si la escritura física ya finalizó
   */
  const handleReintentarFirestore = async () => {
    if (!mascota || !user || !tagTecnicoId) return;

    try {
      setPaso('saving_firestore');
      setMensajeEstado('Reintentando sincronización...');

      const targetUrl = urlGrabada || nfcService.buildIdentificationUrl(mascota.id);

      await linkNfcTagToPet(mascota.id, {
        tagId: tagTecnicoId,
        ndefUrl: targetUrl,
        vetUid: user.uid,
        tagTech: 'Ndef',
      });

      setPaso('success');

      const mascotaActualizada: Pet = {
        ...mascota,
        nfcTagId: tagTecnicoId,
        nfcStatus: 'linked',
        nfcUrl: targetUrl,
        nfcLinkedAt: new Date().toISOString(),
        nfcLinkedBy: user.uid,
      };

      onSuccess(mascotaActualizada);
    } catch {
      setPaso('firestore_error');
      setErrorDetalle(
        'El reintento de sincronización falló. Revisa tu conexión a internet e inténtalo nuevamente.'
      );
    }
  };

  /**
   * Prueba contra Firestore (Modo Test DB) claramente diferenciada de la prueba física
   */
  const handleSimularPruebaFirestore = async () => {
    if (!mascota || !user) return;

    try {
      setPaso('saving_firestore');
      setMensajeEstado('Guardando vinculación de prueba...');

      const simulatedTagId = generateFallbackTagId(mascota.id, 'TAG-TEST');
      const simulatedUrl = nfcService.buildIdentificationUrl(mascota.id);

      setTagTecnicoId(simulatedTagId);
      setUrlGrabada(simulatedUrl);

      await linkNfcTagToPet(mascota.id, {
        tagId: simulatedTagId,
        ndefUrl: simulatedUrl,
        vetUid: user.uid,
        tagTech: 'Ndef-Emulated',
      });

      setPaso('success');

      const mascotaActualizada: Pet = {
        ...mascota,
        nfcTagId: simulatedTagId,
        nfcStatus: 'linked',
        nfcUrl: simulatedUrl,
        nfcLinkedAt: new Date().toISOString(),
        nfcLinkedBy: user.uid,
      };

      onSuccess(mascotaActualizada);
    } catch {
      setPaso('firestore_error');
      setErrorDetalle('Error al guardar la vinculación durante la prueba.');
    }
  };

  if (!mascota) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCerrar}
      onShow={handleModalShow}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, isDark && styles.sheetContainerDark]}>
          {/* Header del Modal */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                <MaterialIcons name="nfc" size={24} color="#04b639" />
              </View>
              <View>
                <Text style={[styles.headerTitle, isDark && styles.textDark]}>Vincular Etiqueta NFC</Text>
                <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
                  Mascota: {mascota.nombre} ({mascota.id})
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCerrar} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={isDark ? '#a1a1aa' : '#6b7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Estado: INICIAL (IDLE) */}
            {paso === 'idle' && (
              <View style={styles.stepContainer}>
                <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
                  <Text style={[styles.infoBoxTitle, isDark && styles.textDark]}>📋 Proceso de Vinculación</Text>
                  <Text style={[styles.infoBoxText, isDark && styles.infoBoxTextDark]}>
                    1. La app solicitará acercar la etiqueta o collar NFC.{'\n'}
                    2. Se comprobará que la etiqueta no esté asignada a otra mascota.{'\n'}
                    3. Se grabará el enlace de identificación oficial:{'\n'}
                    <Text style={[styles.codeText, isDark && styles.codeTextDark]}>https://vetlink.app/pet?id={mascota.id}</Text>
                    {'\n'}
                    4. Se guardará la vinculación y se actualizará la ficha médica de la mascota.
                  </Text>
                </View>

                {mascota.nfcStatus === 'linked' && (
                  <View style={[styles.alreadyLinkedNotice, isDark && styles.alreadyLinkedNoticeDark]}>
                    <Ionicons name="information-circle" size={20} color="#0284c7" />
                    <Text style={[styles.alreadyLinkedText, isDark && styles.alreadyLinkedTextDark]}>
                      Esta mascota ya cuenta con un tag vinculado ({mascota.nfcTagId || 'N/A'}).
                      Si vinculas otra etiqueta, la anterior será reemplazada.
                    </Text>
                  </View>
                )}

                {errorDetalle && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                    <Text style={styles.errorBannerText}>{errorDetalle}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleIniciarVinculacion}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="nfc" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Acercar y Vincular Tag NFC</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Estado: ESPERANDO ETIQUETA / PROCESANDO */}
            {(paso === 'checking' ||
              paso === 'waiting_tag' ||
              paso === 'writing_nfc' ||
              paso === 'saving_firestore') && (
              <View style={styles.progressContainer}>
                <View style={[styles.radarCircle, isDark && styles.radarCircleDark]}>
                  <ActivityIndicator size="large" color="#04b639" />
                  <MaterialIcons
                    name="nfc"
                    size={42}
                    color="#04b639"
                    style={{ position: 'absolute' }}
                  />
                </View>

                <Text style={[styles.progressTitle, isDark && styles.textDark]}>
                  {paso === 'waiting_tag'
                    ? 'Acerca la Etiqueta NFC'
                    : paso === 'writing_nfc'
                    ? 'Escribiendo en Etiqueta NFC'
                    : 'Guardando vinculación'}
                </Text>

                <Text style={[styles.progressSubtitle, isDark && styles.headerSubtitleDark]}>{mensajeEstado}</Text>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCerrar}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancelar Operación</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Estado: CONFLICTO DE ETIQUETA (Ya vinculada a otra mascota) */}
            {paso === 'tag_conflict' && tagConflicto && (
              <View style={styles.stepContainer}>
                <View style={[styles.conflictBanner, isDark && styles.conflictBannerDark]}>
                  <Ionicons name="warning" size={32} color="#d97706" style={{ marginBottom: 8 }} />
                  <Text style={[styles.conflictTitle, isDark && styles.conflictTitleDark]}>Etiqueta Ya Vinculada</Text>
                  <Text style={[styles.conflictText, isDark && styles.conflictTextDark]}>
                    Esta etiqueta ya se encuentra registrada y asociada a la mascota:{' '}
                    <Text style={{ fontWeight: 'bold' }}>{tagConflicto.petId}</Text>.
                  </Text>
                  <Text style={[styles.conflictText, isDark && styles.conflictTextDark, { marginTop: 8 }]}>
                    ¿Deseas sobreescribir la etiqueta y reasignarla a{' '}
                    <Text style={{ fontWeight: 'bold' }}>
                      {mascota.nombre} ({mascota.id})
                    </Text>
                    ? La mascota anterior quedará desvinculada.
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark, { flex: 1 }]}
                    onPress={handleCerrar}
                  >
                    <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1, backgroundColor: '#d97706' }]}
                    onPress={() => escribirYVincular(tagTecnicoId)}
                  >
                    <Text style={styles.primaryBtnText}>Reasignar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Estado: ERROR EN FIRESTORE (Escritura NFC OK, Falló Firestore) */}
            {paso === 'firestore_error' && (
              <View style={styles.stepContainer}>
                <View style={[styles.incompleteBanner, isDark && styles.incompleteBannerDark]}>
                  <Ionicons name="cloud-offline" size={36} color="#dc2626" style={{ marginBottom: 8 }} />
                  <Text style={[styles.incompleteTitle, isDark && styles.incompleteTitleDark]}>Operación Incompleta</Text>
                  <Text style={[styles.incompleteText, isDark && styles.incompleteTextDark]}>
                    La etiqueta física fue grabada correctamente, pero no se pudo confirmar la vinculación en el sistema.
                  </Text>
                  <Text style={[styles.incompleteText, isDark && styles.incompleteTextDark, { marginTop: 6, fontWeight: '600' }]}>
                    La vinculación no se considerará finalizada hasta que quede confirmada en el sistema.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleReintentarFirestore}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Reintentar guardado</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]} onPress={handleCerrar}>
                  <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Estado: ÉXITO VERIFICADO (Escritura NFC y Firestore verificados) */}
            {paso === 'success' && (
              <View style={styles.stepContainer}>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={56} color="#04b639" />
                  <Text style={styles.successTitle}>¡Vinculación Verificada!</Text>
                  <Text style={[styles.successSubtitle, isDark && styles.headerSubtitleDark]}>
                    La etiqueta NFC y la ficha de la mascota están sincronizadas con éxito.
                  </Text>
                </View>

                <View style={[styles.receiptCard, isDark && styles.receiptCardDark]}>
                  <View style={[styles.receiptRow, isDark && styles.receiptRowDark]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>Mascota:</Text>
                    <Text style={[styles.receiptValue, isDark && styles.textDark]}>
                      {mascota.nombre} ({mascota.id})
                    </Text>
                  </View>
                  <View style={[styles.receiptRow, isDark && styles.receiptRowDark]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>ID de Etiqueta:</Text>
                    <Text style={[styles.receiptValue, isDark && styles.textDark]}>{tagTecnicoId || 'N/A'}</Text>
                  </View>
                  <View style={[styles.receiptRow, isDark && styles.receiptRowDark]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>Enlace de Identificación:</Text>
                    <Text style={[styles.receiptValue, styles.codeSmall, isDark && styles.textDark]}>
                      {urlGrabada || `https://vetlink.app/pet?id=${mascota.id}`}
                    </Text>
                  </View>
                  <View style={[styles.receiptRow, isDark && styles.receiptRowDark]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>Veterinario:</Text>
                    <Text style={[styles.receiptValue, isDark && styles.textDark]}>{user?.displayName || user?.email || user?.uid}</Text>
                  </View>
                  <View style={[styles.receiptRow, isDark && styles.receiptRowDark]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>Registro:</Text>
                    <Text style={[styles.receiptValue, isDark && styles.textDark]}>Identificación y Ficha Clínica</Text>
                  </View>
                  <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.receiptLabel, isDark && styles.headerSubtitleDark]}>Estado:</Text>
                    <Text style={[styles.receiptValue, { color: '#04b639', fontWeight: 'bold' }]}>
                      ACTIVO / VINCULADO
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleCerrar}>
                  <Text style={styles.primaryBtnText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Estado: SIN HARDWARE NATIVO (Expo Go / Web) */}
            {paso === 'no_hardware' && (
              <View style={styles.stepContainer}>
                <View style={[styles.noHardwareCard, isDark && styles.noHardwareCardDark]}>
                  <MaterialIcons name="phonelink-erase" size={44} color={isDark ? '#9ca3af' : '#6b7280'} style={{ marginBottom: 8 }} />
                  <Text style={[styles.noHardwareTitle, isDark && styles.textDark]}>NFC No Disponible</Text>
                  <Text style={[styles.noHardwareText, isDark && styles.headerSubtitleDark]}>
                    La lectura y escritura de etiquetas NFC requiere un teléfono móvil compatible con sensor NFC habilitado.
                  </Text>
                  <Text style={[styles.noHardwareText, isDark && styles.headerSubtitleDark, { marginTop: 8 }]}>
                    Esta función no se encuentra disponible en navegadores web o dispositivos sin sensor.
                  </Text>
                </View>

                <View style={[styles.testSection, isDark && styles.testSectionDark]}>
                  <Text style={[styles.testSectionTitle, isDark && styles.testSectionTitleDark]}>🧪 Modo de Simulación de Prueba</Text>
                  <Text style={[styles.testSectionText, isDark && styles.testSectionTextDark]}>
                    Para verificar la vinculación en el sistema sin necesidad del sensor físico, puedes realizar una prueba de registro:
                  </Text>

                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: '#15803d', marginTop: 10 }]}
                    onPress={handleSimularPruebaFirestore}
                  >
                    <Ionicons name="checkmark-done" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Realizar vinculación de prueba</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.secondaryBtn, isDark && styles.secondaryBtnDark]} onPress={handleCerrar}>
                  <Text style={[styles.secondaryBtnText, isDark && styles.secondaryBtnTextDark]}>Volver</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 20,
  },
  stepContainer: {
    gap: 16,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  codeSmall: {
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    fontSize: 11,
  },
  alreadyLinkedNotice: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  alreadyLinkedText: {
    flex: 1,
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    alignItems: 'center',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#b91c1c',
  },
  primaryBtn: {
    backgroundColor: '#04b639',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  radarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  conflictBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  conflictTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
  },
  conflictText: {
    fontSize: 14,
    color: '#78350f',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  incompleteBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  incompleteTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 6,
  },
  incompleteText: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center',
    lineHeight: 20,
  },
  successBadge: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803d',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  receiptCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  receiptLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  noHardwareCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noHardwareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  noHardwareText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  testSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  testSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 6,
  },
  testSectionText: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 18,
  },
  sheetContainerDark: {
    backgroundColor: '#18181b',
  },
  headerDark: {
    borderBottomColor: '#27272a',
  },
  iconCircleDark: {
    backgroundColor: '#064e3b',
  },
  textDark: {
    color: '#f4f4f5',
  },
  headerSubtitleDark: {
    color: '#a1a1aa',
  },
  infoBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  infoBoxTextDark: {
    color: '#d4d4d8',
  },
  receiptCardDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  receiptRowDark: {
    borderBottomColor: '#3f3f46',
  },
  noHardwareCardDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  testSectionDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  codeTextDark: {
    backgroundColor: '#3f3f46',
    color: '#f4f4f5',
  },
  alreadyLinkedNoticeDark: {
    backgroundColor: '#0c2a4d',
    borderLeftColor: '#38bdf8',
  },
  alreadyLinkedTextDark: {
    color: '#7dd3fc',
  },
  radarCircleDark: {
    backgroundColor: '#064e3b',
  },
  secondaryBtnDark: {
    backgroundColor: '#27272a',
  },
  secondaryBtnTextDark: {
    color: '#e4e4e7',
  },
  conflictBannerDark: {
    backgroundColor: '#451a03',
    borderColor: '#78350f',
  },
  conflictTitleDark: {
    color: '#fcd34d',
  },
  conflictTextDark: {
    color: '#fed7aa',
  },
  incompleteBannerDark: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  incompleteTitleDark: {
    color: '#fca5a5',
  },
  incompleteTextDark: {
    color: '#fecaca',
  },
  testSectionTitleDark: {
    color: '#4ade80',
  },
  testSectionTextDark: {
    color: '#86efac',
  },
});
