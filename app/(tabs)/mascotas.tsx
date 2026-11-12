import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

import { EmptyState } from '@/components/EmptyState';
import QRMascotaCard from '@/components/QRMascotaCard';
import VincularNfcModal from '@/components/VincularNfcModal';
import { app } from '@/config/firebase';
import { FontFamily, Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import {
  deletePet,
  getNextSuggestedPetId,
  registerPet,
  updatePetData,
  usePets,
  type Pet,
} from '@/services/petService';

import { PetCard } from '@/components/PetCard';

// ── 2. Modal de Registro de Mascotas (Veterinarios) ───────────────────────────
interface RegistrarMascotaModalProps {
  visible: boolean;
  onClose: () => void;
  onPetCreated: (pet: Pet) => void;
}

function RegistrarMascotaModal({
  visible,
  onClose,
  onPetCreated,
}: RegistrarMascotaModalProps) {
  const { user, isVeterinario } = useAuth();
  const { isDark } = useAppTheme();

  const [petId, setPetId] = useState('');
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

  const handleModalShow = () => {
    setNombre('');
    setRaza('');
    setPeso('');
    setEdad('');
    setPropietario('');
    setTelefono('');
    setDescripcion('');
    setFotoUrl('');
    getNextSuggestedPetId().then((sug) => setPetId(sug));
  };

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
                  'La imagen es muy pesada para guardarse. Por favor recórtala más de cerca.'
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
                  'La imagen es muy pesada para guardarse. Por favor recórtala más de cerca.'
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
    if (!user) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para registrar una mascota.');
      return;
    }

    if (!isVeterinario) {
      Alert.alert(
        'Acceso denegado',
        'Solo los veterinarios autorizados tienen permisos para dar de alta nuevas mascotas con identificador clínico oficial.'
      );
      return;
    }

    if (!nombre.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor, ingresa el nombre de la mascota.');
      return;
    }

    if (!propietario.trim()) {
      Alert.alert('Campo obligatorio', 'Por favor, ingresa el nombre del propietario o tutor.');
      return;
    }

    const cleanId = (petId || 'PET-001').trim().toUpperCase();

    setLoading(true);
    try {
      let finalFoto = fotoUrl;
      if (fotoUrl) {
        if (fotoUrl.startsWith('data:') && fotoUrl.length > 900000) {
          Alert.alert(
            'Foto demasiado grande',
            'La foto seleccionada supera el límite permitido (1MB). Por favor recórtala más de cerca.'
          );
          setLoading(false);
          return;
        }
        try {
          const storage = getStorage(app);
          const cleanSafeId = cleanId.replace(/[^a-zA-Z0-9_-]/g, '_');
          const storageRef = ref(storage, `pets/${cleanSafeId}_${Date.now()}.jpg`);
          if (fotoUrl.startsWith('data:image/jpeg;base64,')) {
            const rawBase64 = fotoUrl.replace('data:image/jpeg;base64,', '');
            await uploadString(storageRef, rawBase64, 'base64', { contentType: 'image/jpeg' });
            finalFoto = await getDownloadURL(storageRef);
          } else {
            const res = await fetch(fotoUrl);
            const blob = await res.blob();
            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
            finalFoto = await getDownloadURL(storageRef);
          }
        } catch {
          finalFoto = fotoUrl;
        }
      }

      const nuevaMascota = await registerPet(
        {
          id: cleanId,
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
          userId: '',
          ownerId: '',
        },
        user.uid
      );

      Alert.alert(
        '¡Mascota registrada con éxito!',
        `Se ha creado el registro clínico de ${nuevaMascota.nombre} (${nuevaMascota.id}). Ahora puedes vincular su etiqueta NFC.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onPetCreated(nuevaMascota);
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error al registrar mascota', err?.message || 'No se pudo guardar la mascota.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalShow}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.formSheetContainer, isDark && styles.formSheetContainerDark]}>
          <View style={[styles.formHeader, isDark && styles.formHeaderDark]}>
            <View style={styles.formTitleRow}>
              <View style={[styles.formIconCircle, isDark && styles.formIconCircleDark]}>
                <Ionicons name="paw-outline" size={22} color={Palette.greenDeep} />
              </View>
              <View>
                <Text style={[styles.formTitle, isDark && styles.textDark]}>Registrar Mascota</Text>
                <Text style={[styles.formSubtitle, isDark && styles.formSubtitleDark]}>Alta clínica oficial en el sistema</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
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

            {/* Especie y Sexo (Con íconos Line Art) */}
            <View style={styles.formRow}>
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

            {/* Edad */}
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

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Notas Clínicas Iniciales</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, isDark && styles.formInputDark]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Vacunación, alergias, observaciones médicas..."
                placeholderTextColor={isDark ? '#71717a' : Palette.textPlaceholder}
                multiline
                numberOfLines={3}
              />
            </View>

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
                  <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Guardar Mascota</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── 3. Pantalla Principal de Mascotas ──────────────────────────────────────────
export default function MascotasScreen() {
  const { isDark } = useAppTheme();
  const { isVeterinario } = useAuth();
  const { pets, loading, refreshing, refresh } = usePets();

  const [qrMascota, setQrMascota] = useState<Pet | null>(null);
  const [nfcMascota, setNfcMascota] = useState<Pet | null>(null);
  const [showRegistrarModal, setShowRegistrarModal] = useState<boolean>(false);
  const [updatingPetId, setUpdatingPetId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handlePetPress = (pet: Pet) => {
    router.push({
      pathname: '/mascotas/[id]',
      params: {
        id: pet.id,
        nombre: pet.nombre,
        especie: pet.especie,
        raza: pet.raza,
        sexo: pet.sexo,
        peso: pet.peso !== undefined && pet.peso !== 'N/A' ? String(pet.peso) : '',
        edad: String(pet.edad ?? pet.fechaNacimiento ?? ''),
        // No pasar cadenas Base64 pesadas por los parámetros de navegación para evitar cuelgues de memoria
        fotoUrl: pet.fotoUrl && !pet.fotoUrl.startsWith('data:') ? pet.fotoUrl : '',
        descripcion: pet.descripcion || '',
      },
    });
  };

  const handleRegisterPress = () => {
    if (isVeterinario) {
      setShowRegistrarModal(true);
    } else {
      router.push('/(tabs)/scan');
    }
  };

  const handleVincularNfcPress = (pet: Pet) => {
    const isLinked = pet.nfcStatus === 'linked' || Boolean(pet.nfcTagId);
    if (!isVeterinario && !isLinked) {
      Alert.alert(
        'Acceso Restringido',
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular etiquetas NFC nuevas en HuellApp.'
      );
      return;
    }
    setNfcMascota(pet);
  };

  const handleDeletePetPress = useCallback(
    (pet: Pet) => {
      if (pet.nfcStatus === 'linked' || Boolean(pet.nfcTagId)) {
        Alert.alert(
          'Desvincular NFC/QR requerido',
          `Antes de borrar a ${pet.nombre}, primero debes desvincular la mascota de su NFC/QR y dejarlo en blanco.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Desvincular NFC',
              onPress: () => setNfcMascota(pet),
            },
          ]
        );
        return;
      }

      Alert.alert(
        'Eliminar mascota',
        `¿Estás seguro de que querés eliminar a ${pet.nombre}? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePet(pet.id);
                await refresh();
                Alert.alert('Mascota eliminada', `Se eliminó el registro de ${pet.nombre}.`);
              } catch (err: any) {
                Alert.alert(
                  'Error al eliminar',
                  err?.message || 'No se pudo eliminar la mascota en este momento.'
                );
              }
            },
          },
        ]
      );
    },
    [refresh]
  );

  const capturarYGuardarFoto = useCallback(
    async (pet: Pet, origen: 'camera' | 'gallery') => {
      try {
        let result: ImagePicker.ImagePickerResult;

        if (origen === 'camera') {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert(
              'Permiso Requerido',
              'Se requiere acceso a la cámara para tomar una foto de perfil.'
            );
            return;
          }

          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
            base64: true,
          });
        } else {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert(
              'Permiso Requerido',
              'Se requiere acceso a la galería para seleccionar una foto de perfil.'
            );
            return;
          }

          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
            base64: true,
          });
        }

        if (result.canceled || !result.assets || result.assets.length === 0) {
          return;
        }

        const asset = result.assets[0];
        setUpdatingPetId(pet.id);

        let finalFotoUrl = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        try {
          const storage = getStorage(app);
          const cleanSafeId = pet.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const storageRef = ref(storage, `pets/${cleanSafeId}_${Date.now()}.jpg`);
          if (asset.base64) {
            await uploadString(storageRef, asset.base64, 'base64', { contentType: 'image/jpeg' });
            finalFotoUrl = await getDownloadURL(storageRef);
          } else {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
            finalFotoUrl = await getDownloadURL(storageRef);
          }
        } catch (storageError) {
          console.info('[MascotasScreen] Fallback a imagen base64:', storageError);
          if (asset.base64) {
            finalFotoUrl = `data:image/jpeg;base64,${asset.base64}`;
          }
        }

        if (finalFotoUrl && finalFotoUrl.startsWith('data:') && finalFotoUrl.length > 900000) {
          Alert.alert(
            'Foto demasiado grande',
            'La foto supera el límite permitido por la base de datos (1MB). Por favor recórtala más de cerca o toma una nueva foto.'
          );
          return;
        }

        await updatePetData(pet.id, { fotoUrl: finalFotoUrl });
        await refresh();
        Alert.alert('¡Foto Actualizada!', `Se guardó la foto de perfil de ${pet.nombre}.`);
      } catch (error: any) {
        console.error('[MascotasScreen] Error al guardar foto de perfil:', error);
        Alert.alert(
          'Error al guardar foto',
          error?.message || 'No se pudo guardar la foto de perfil de la mascota. Intenta nuevamente.'
        );
      } finally {
        setUpdatingPetId(null);
      }
    },
    [refresh]
  );

  const handlePhotoPress = useCallback(
    (pet: Pet) => {
      Alert.alert(
        `Foto de perfil: ${pet.nombre}`,
        'Selecciona una opción para la foto de tu mascota:',
        [
          {
            text: 'Tomar foto',
            onPress: () => capturarYGuardarFoto(pet, 'camera'),
          },
          {
            text: 'Elegir de galería',
            onPress: () => capturarYGuardarFoto(pet, 'gallery'),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    },
    [capturarYGuardarFoto]
  );

  const renderPetCard = ({ item }: { item: Pet }) => (
    <PetCard
      pet={item}
      onPress={handlePetPress}
      onQrPress={setQrMascota}
      onNfcPress={handleVincularNfcPress}
      onDeletePress={handleDeletePetPress}
      onPhotoPress={handlePhotoPress}
      isUpdatingPhoto={updatingPetId === item.id}
      isDark={isDark}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      variant="pets"
      title="No hay mascotas registradas."
      message={
        isVeterinario
          ? 'Agregá a tus pacientes clínicos para gestionar sus historiales y chapitas inteligentes.'
          : 'Agregá a tu compañero para comenzar a cuidar su salud y vincular su chapita inteligente.'
      }
      actionLabel={isVeterinario ? 'Registrar nuevo paciente' : 'Registrar mi primera mascota'}
      actionIcon={isVeterinario ? 'add-circle-outline' : 'qr-code-outline'}
      onAction={handleRegisterPress}
    />
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Superior Responsivo */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerBrandGreen}>Huell</Text>
            <Text style={[styles.headerBrandDark, isDark && styles.textDark]}>App</Text>
          </View>
          <Text
            style={[styles.headerTitle, isDark && styles.headerTitleDark]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {isVeterinario ? 'Mascotas Clínicas' : 'Mis Mascotas'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggleButton style={{ marginRight: 2 }} />
          <TouchableOpacity
            style={[styles.reloadButton, isDark && styles.reloadButtonDark]}
            onPress={refresh}
            activeOpacity={0.7}
            accessibilityLabel="Recargar mascotas"
          >
            <Ionicons name="refresh-outline" size={19} color={isDark ? '#fafafa' : Palette.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerPrimaryButton}
            onPress={handleRegisterPress}
            activeOpacity={0.85}
          >
            <Ionicons name={isVeterinario ? 'add-circle-outline' : 'qr-code-outline'} size={17} color="#ffffff" />
            <Text style={styles.headerPrimaryButtonText} numberOfLines={1}>
              {isVeterinario ? 'Registrar' : 'Vincular'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.greenPrimary} />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Cargando mascotas...
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          contentContainerStyle={[
            styles.listContent,
            pets.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[Palette.greenPrimary]}
              tintColor={Palette.greenPrimary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botón Flotante (FAB) */}
      {pets.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleRegisterPress}
          activeOpacity={0.85}
          accessibilityLabel="Registrar Mascota"
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Modal QR de mascota */}
      <Modal
        visible={!!qrMascota}
        transparent
        animationType="slide"
        onRequestClose={() => setQrMascota(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQrMascota(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalSheet, isDark && styles.modalSheetDark]}
            onPress={() => { }}
          >
            <View style={styles.modalHandle} />
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                {qrMascota?.nombre}
              </Text>
              <TouchableOpacity onPress={() => setQrMascota(null)}>
                <Ionicons name="close-outline" size={24} color={isDark ? '#a1a1aa' : Palette.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {qrMascota && (
                <QRMascotaCard
                  petId={qrMascota.id}
                  petName={qrMascota.nombre}
                  isDark={isDark}
                />
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal Vincular NFC */}
      {nfcMascota && (
        <VincularNfcModal
          visible={!!nfcMascota}
          mascota={nfcMascota}
          onClose={() => setNfcMascota(null)}
          onSuccess={(updatedPet) => {
            setNfcMascota(updatedPet);
            refresh();
          }}
        />
      )}

      {/* Modal Registrar Mascota en Firestore (Veterinarios) */}
      <RegistrarMascotaModal
        visible={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
        onPetCreated={() => {
          setShowRegistrarModal(false);
          refresh();
        }}
      />
    </SafeAreaView>
  );
}

// ── 4. Estilos Consolidados ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  safeAreaDark: {
    backgroundColor: Palette.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  headerDark: {
    backgroundColor: Palette.surfaceDark,
    borderBottomColor: Palette.borderDark,
  },
  headerBrandGreen: {
    fontSize: 13,
    fontFamily: FontFamily.headingBold,
    color: Palette.greenPrimary,
    letterSpacing: 0.5,
  },
  headerBrandDark: {
    fontSize: 13,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  headerTitleDark: {
    color: Palette.textPrimaryDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  reloadButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Palette.surfaceSubtle,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButtonDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  headerPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
    gap: 4,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerPrimaryButtonText: {
    color: '#ffffff',
    fontFamily: FontFamily.bodyBold,
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },
  loadingTextDark: {
    color: Palette.textSecondaryDark,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Palette.surfaceLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalSheetDark: {
    backgroundColor: Palette.surfaceDark,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Palette.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    marginBottom: 4,
  },
  modalHeaderDark: {
    borderBottomColor: Palette.borderDark,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  modalTitleDark: {
    color: Palette.textPrimaryDark,
  },
  formSheetContainer: {
    backgroundColor: Palette.surfaceLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  formSheetContainerDark: {
    backgroundColor: Palette.surfaceDark,
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
    borderBottomColor: Palette.borderDark,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formIconCircleDark: {
    backgroundColor: '#133324',
  },
  formTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  formSubtitleDark: {
    color: Palette.textSecondaryDark,
  },
  closeBtn: {
    padding: 6,
  },
  formBody: {
    padding: 20,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formLabel: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
  },
  formBadgeLabel: {
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  formInput: {
    borderWidth: 1.5,
    borderColor: Palette.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textPrimary,
    backgroundColor: Palette.surfaceLight,
  },
  formInputDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
    color: Palette.textPrimaryDark,
  },
  idRow: {
    flexDirection: 'row',
    gap: 8,
  },
  idInput: {
    flex: 1,
    fontWeight: '700',
    letterSpacing: 1,
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    backgroundColor: Palette.greenSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  suggestBtnText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
  },
  formHint: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
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
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Palette.borderLight,
    backgroundColor: Palette.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
  },
  selectorBtnActive: {
    borderColor: Palette.greenDeep,
    backgroundColor: Palette.greenSoft,
  },
  selectorBtnActiveDark: {
    borderColor: '#4ade80',
    backgroundColor: '#133324',
  },
  selectorBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textSecondary,
  },
  selectorBtnTextActive: {
    color: Palette.greenDeep,
    fontFamily: FontFamily.bodyBold,
  },
  formTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Palette.greenDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },
  photoPickerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  photoPickerBtn: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.greenBorder,
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerBtnDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  photoPickerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoPickerIconCircleDark: {
    backgroundColor: '#20302B',
  },
  photoPickerTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  photoPickerSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  photoPreviewWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: Palette.greenPrimary,
    marginBottom: 10,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  photoChangeBtn: {
    backgroundColor: Palette.greenDeep,
  },
  photoRemoveBtn: {
    backgroundColor: Palette.redSoft,
  },
  photoRemoveBtnDark: {
    backgroundColor: '#381616',
  },
  photoActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },
  textDark: {
    color: Palette.textPrimaryDark,
  },
});
