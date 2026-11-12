import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';

import { app } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { FontFamily, Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { updatePetData, type Pet } from '@/services/petService';

export interface EditarMascotaModalProps {
  visible: boolean;
  pet: Pet | null;
  onClose: () => void;
  onPetUpdated: (updatedPet: Pet) => void;
}

/**
 * 🐾 EditarMascotaModal
 * Permite modificar los datos editables de una mascota existente:
 * - Nombre, Foto, Sexo (Macho/Hembra), Especie, Raza, Peso, Fecha de nacimiento / Edad,
 *   Tutor/Propietario, Teléfono y Notas clínicas/Características físicas.
 * - Respeta permisos: Veterinarios y Tutores dueños de la mascota.
 * - Preserva el identificador oficial único (read-only) y la estructura de Firestore sin duplicar documentos.
 */
export function EditarMascotaModal({
  visible,
  pet,
  onClose,
  onPetUpdated,
}: EditarMascotaModalProps) {
  const { user, isVeterinario } = useAuth();
  const { isDark } = useAppTheme();

  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('Perro');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState('Macho');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState('');
  const [propietario, setPropietario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Inicializar el formulario con los datos actuales de la mascota al abrir
  useEffect(() => {
    if (visible && pet) {
      setNombre(pet.nombre || '');
      setEspecie(pet.especie || 'Perro');
      setRaza(pet.raza || '');
      setSexo(pet.sexo || 'Macho');
      setPeso(pet.peso !== undefined && pet.peso !== 'N/A' ? String(pet.peso) : '');
      setEdad(String(pet.edad ?? pet.fechaNacimiento ?? ''));
      setPropietario(pet.propietario || '');
      setTelefono(pet.telefonoContacto || '');
      setDescripcion(pet.descripcion || '');
      setFotoUrl(pet.fotoUrl || '');
    }
  }, [visible, pet]);

  const seleccionarFotoModal = () => {
    Alert.alert(
      'Foto de Perfil',
      'Elige el método para la foto:',
      [
        {
          text: 'Tomar foto',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permiso Requerido', 'Se requiere acceso a la cámara.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.2,
              base64: true,
            });
            if (!res.canceled && res.assets?.[0]) {
              const a = res.assets[0];
              if (a.base64 && a.base64.length > 900000) {
                Alert.alert(
                  'Foto demasiado grande',
                  'La imagen supera el límite permitido. Por favor recórtala más de cerca.'
                );
                return;
              }
              setFotoUrl(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
            }
          },
        },
        {
          text: 'Elegir de galería',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permiso Requerido', 'Se requiere acceso a la galería.');
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.2,
              base64: true,
            });
            if (!res.canceled && res.assets?.[0]) {
              const a = res.assets[0];
              if (a.base64 && a.base64.length > 900000) {
                Alert.alert(
                  'Foto demasiado grande',
                  'La imagen supera el límite permitido. Por favor recórtala más de cerca.'
                );
                return;
              }
              setFotoUrl(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    if (!pet) return;

    if (!user) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para editar una mascota.');
      return;
    }

    // Validación de permisos estricta: Veterinario o Dueño legítimo verificado
    const esPropietario = Boolean(
      user &&
      ((pet.userId && pet.userId === user.uid) ||
       (pet.ownerId && pet.ownerId === user.uid))
    );

    if (!isVeterinario && !esPropietario) {
      Alert.alert(
        'Acceso Restringido',
        'Solo el tutor registrado de la mascota o un veterinario autorizado pueden editar esta ficha.'
      );
      return;
    }

    if (!nombre.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor, ingresa el nombre de la mascota.');
      return;
    }

    if (!propietario.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor, ingresa el nombre del tutor o propietario.');
      return;
    }

    setLoading(true);
    try {
      let finalFoto = fotoUrl;

      // Si la foto cambió y es una nueva imagen local o base64
      if (fotoUrl && fotoUrl !== pet.fotoUrl) {
        if (fotoUrl.startsWith('data:') && fotoUrl.length > 900000) {
          Alert.alert(
            'Foto demasiado grande',
            'La foto seleccionada supera el límite permitido (1MB). Por favor recórtala.'
          );
          setLoading(false);
          return;
        }

        try {
          const storage = getStorage(app);
          const cleanSafeId = pet.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const storageRef = ref(storage, `pets/${cleanSafeId}_${Date.now()}.jpg`);

          if (fotoUrl.startsWith('data:image/jpeg;base64,')) {
            const rawBase64 = fotoUrl.replace('data:image/jpeg;base64,', '');
            await uploadString(storageRef, rawBase64, 'base64', { contentType: 'image/jpeg' });
            finalFoto = await getDownloadURL(storageRef);
          } else if (fotoUrl.startsWith('file:') || fotoUrl.startsWith('blob:')) {
            const res = await fetch(fotoUrl);
            const blob = await res.blob();
            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
            finalFoto = await getDownloadURL(storageRef);
          }
        } catch (storageErr) {
          console.warn('[EditarMascotaModal] Error subiendo foto a Storage, manteniendo URI local:', storageErr);
          finalFoto = fotoUrl;
        }
      }

      const updates: Partial<Pet> = {
        nombre: nombre.trim(),
        especie,
        raza: raza.trim() || 'Mestizo',
        sexo,
        peso: peso.trim() || 'N/A',
        edad: edad.trim() || 'No especificada',
        fechaNacimiento: edad.trim() || 'No especificada',
        propietario: propietario.trim(),
        telefonoContacto: telefono.trim() || '',
        descripcion: descripcion.trim() || '',
        fotoUrl: finalFoto || '',
      };

      // Guardar cambios directamente en el documento existente de Firestore
      await updatePetData(pet.id, updates);

      const updatedPet: Pet = {
        ...pet,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      Alert.alert(
        '¡Cambios guardados!',
        `La ficha de ${updatedPet.nombre} se actualizó con éxito.`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              onPetUpdated(updatedPet);
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('[EditarMascotaModal] Error guardando cambios:', err);
      Alert.alert(
        'Error al guardar',
        err?.message || 'No se pudieron actualizar los datos de la mascota en Firestore.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!pet) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.formSheetContainer, isDark && styles.formSheetContainerDark]}>
          {/* Header del Modal */}
          <View style={[styles.formHeader, isDark && styles.formHeaderDark]}>
            <View style={styles.formTitleRow}>
              <View style={[styles.formIconCircle, isDark && styles.formIconCircleDark]}>
                <Ionicons name="create-outline" size={22} color={Palette.greenDeep} />
              </View>
              <View>
                <Text style={[styles.formTitle, isDark && styles.textDark]}>Editar Mascota</Text>
                <Text style={[styles.formSubtitle, isDark && styles.formSubtitleDark]}>
                  Modificar datos de {pet.nombre}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar modal">
              <Ionicons name="close-outline" size={24} color={isDark ? '#a1a1aa' : Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formBody} showsVerticalScrollIndicator={false}>
            {/* Foto de Perfil */}
            <View style={styles.photoPickerContainer}>
              {fotoUrl ? (
                <View style={styles.photoPreviewWrapper}>
                  <Image source={{ uri: fotoUrl }} style={styles.photoPreview} contentFit="cover" />
                  <View style={styles.photoActionsRow}>
                    <TouchableOpacity
                      style={[styles.photoActionBtn, styles.photoChangeBtn]}
                      onPress={seleccionarFotoModal}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera-outline" size={15} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.photoActionBtnText}>Cambiar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.photoActionBtn, styles.photoRemoveBtn, isDark && styles.photoRemoveBtnDark]}
                      onPress={() => setFotoUrl('')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={15} color={Palette.redEmergency} style={{ marginRight: 4 }} />
                      <Text style={[styles.photoActionBtnText, { color: Palette.redEmergency }]}>Quitar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.photoPickerBtn, isDark && styles.photoPickerBtnDark]}
                  onPress={seleccionarFotoModal}
                  activeOpacity={0.8}
                >
                  <View style={[styles.photoPickerIconCircle, isDark && styles.photoPickerIconCircleDark]}>
                    <Ionicons name="camera-outline" size={24} color={Palette.greenDeep} />
                  </View>
                  <Text style={[styles.photoPickerTitle, isDark && styles.textDark]}>
                    Foto de Perfil
                  </Text>
                  <Text style={[styles.photoPickerSubtitle, isDark && styles.formSubtitleDark]}>
                    Tomar foto o elegir de galería
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Nombre de la Mascota *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Max, Luna, Rocky"
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
              />
            </View>

            {/* Especie y Sexo (Selección con íconos Line Art) */}
            <View style={styles.formRow}>
              {/* Especie */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Especie</Text>
                <View style={styles.selectorRow}>
                  {[
                    { id: 'Perro', icon: 'dog' as const },
                    { id: 'Gato', icon: 'cat' as const },
                  ].map((esp) => (
                    <TouchableOpacity
                      key={esp.id}
                      style={[
                        styles.selectorBtn,
                        isDark && styles.selectorBtnDark,
                        especie === esp.id && (isDark ? styles.selectorBtnActiveDark : styles.selectorBtnActive),
                      ]}
                      onPress={() => setEspecie(esp.id)}
                    >
                      <MaterialCommunityIcons
                        name={esp.icon}
                        size={16}
                        color={especie === esp.id ? Palette.greenDeep : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.selectorBtnText,
                          isDark && styles.formSubtitleDark,
                          especie === esp.id && styles.selectorBtnTextActive,
                        ]}
                      >
                        {esp.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sexo (Permite modificar Macho/Hembra) */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Sexo</Text>
                <View style={styles.selectorRow}>
                  {[
                    { id: 'Macho', icon: 'male-outline' as const },
                    { id: 'Hembra', icon: 'female-outline' as const },
                  ].map((sx) => (
                    <TouchableOpacity
                      key={sx.id}
                      style={[
                        styles.selectorBtn,
                        isDark && styles.selectorBtnDark,
                        sexo === sx.id && (isDark ? styles.selectorBtnActiveDark : styles.selectorBtnActive),
                      ]}
                      onPress={() => setSexo(sx.id)}
                    >
                      <Ionicons
                        name={sx.icon}
                        size={14}
                        color={sexo === sx.id ? Palette.greenDeep : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.selectorBtnText,
                          isDark && styles.formSubtitleDark,
                          sexo === sx.id && styles.selectorBtnTextActive,
                        ]}
                      >
                        {sx.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Raza y Peso */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Raza</Text>
                <TextInput
                  style={[styles.formInput, isDark && styles.formInputDark]}
                  value={raza}
                  onChangeText={setRaza}
                  placeholder="Ej: Golden Retriever"
                  placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.8 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Peso</Text>
                <TextInput
                  style={[styles.formInput, isDark && styles.formInputDark]}
                  value={peso}
                  onChangeText={setPeso}
                  placeholder="Ej: 28 kg"
                  placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                />
              </View>
            </View>

            {/* Edad o Fecha de Nacimiento */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Edad o Fecha de Nacimiento</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={edad}
                onChangeText={setEdad}
                placeholder="Ej: 3 años o 15/03/2023"
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
              />
            </View>

            {/* Propietario y Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Propietario / Tutor *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={propietario}
                onChangeText={setPropietario}
                placeholder="Nombre completo del tutor"
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Teléfono de Contacto (Emergencias)</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                placeholder="+54 9 11 2345-6789"
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
              />
            </View>

            {/* Características físicas y Notas */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>
                Características Físicas y Notas Clínicas
              </Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, isDark && styles.formInputDark]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Manchas, collar, señas particulares, alergias..."
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Botón Guardar Cambios */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  formSheetContainer: {
    backgroundColor: Palette.cardLight,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Shadows.lg,
  },
  formSheetContainerDark: {
    backgroundColor: '#18181b',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  formHeaderDark: {
    borderBottomColor: '#27272a',
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formIconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
  },
  formTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  formSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  formSubtitleDark: {
    color: Palette.textSecondaryDark,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBody: {
    padding: 20,
    paddingBottom: 30,
  },
  photoPickerContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  photoPreviewWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  photoPreview: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: Palette.greenDeep,
    marginBottom: 10,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  photoChangeBtn: {
    backgroundColor: Palette.greenDeep,
  },
  photoRemoveBtn: {
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  photoRemoveBtnDark: {
    backgroundColor: '#381616',
    borderColor: '#7f1d1d',
  },
  photoActionBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: '#ffffff',
  },
  photoPickerBtn: {
    width: '100%',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    borderStyle: 'dashed',
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerBtnDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.1)',
    borderColor: 'rgba(8, 122, 67, 0.3)',
  },
  photoPickerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...Shadows.sm,
  },
  photoPickerIconCircleDark: {
    backgroundColor: '#27272a',
  },
  photoPickerTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
  },
  photoPickerSubtitle: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  formLabel: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  formBadgeLabel: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    backgroundColor: Palette.greenSoft,
    color: Palette.greenDeep,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  idReadOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    height: 46,
  },
  idReadOnlyBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  idReadOnlyText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  formInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Palette.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
    backgroundColor: '#ffffff',
  },
  formInputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#fafafa',
  },
  formTextArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  formHint: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 4,
    lineHeight: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  selectorBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  selectorBtnActive: {
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.greenBorder,
  },
  selectorBtnActiveDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.25)',
    borderColor: Palette.greenDeep,
  },
  selectorBtnText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  selectorBtnTextActive: {
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  submitBtn: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadows.md,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: Typography.size.body,
    fontFamily: Typography.family.bodyBold,
  },
  textDark: {
    color: '#fafafa',
  },
});

