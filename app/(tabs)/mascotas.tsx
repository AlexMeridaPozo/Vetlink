import React, { useCallback, useState } from 'react';
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
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import {
  getNextSuggestedPetId,
  registerPet,
  usePets,
  type Pet,
} from '@/services/petService';
import QRMascotaCard from '@/components/QRMascotaCard';
import VincularNfcModal from '@/components/VincularNfcModal';

// ── 1. Componente Tarjeta de Mascota (Memoizado) ──────────────────────────────
interface PetCardProps {
  pet: Pet;
  onPress: (pet: Pet) => void;
  onQrPress: (pet: Pet) => void;
  onNfcPress: (pet: Pet) => void;
  isDark?: boolean;
}

const PetCard = React.memo(function PetCard({
  pet,
  onPress,
  onQrPress,
  onNfcPress,
  isDark = false,
}: PetCardProps) {
  const isMale = pet.sexo?.toLowerCase().includes('macho');
  const isNfcLinked = pet.nfcStatus === 'linked';

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      activeOpacity={0.85}
      onPress={() => onPress(pet)}
    >
      <View style={styles.cardHeader}>
        {/* Foto o Avatar */}
        <View style={styles.avatarContainer}>
          {pet.fotoUrl ? (
            <Image
              source={{ uri: pet.fotoUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.avatarFallback, isDark && styles.avatarFallbackDark]}>
              <MaterialIcons name="pets" size={32} color={isDark ? '#4ade80' : '#15803d'} />
            </View>
          )}
          <View style={[styles.speciesBadge, isDark && styles.speciesBadgeDark]}>
            <Text style={styles.speciesBadgeText}>
              {pet.especie === 'Gato' ? '🐱' : '🐶'}
            </Text>
          </View>
        </View>

        {/* Información Principal */}
        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.petName, isDark && styles.petNameDark]}>{pet.nombre}</Text>
            <View
              style={[
                styles.genderBadge,
                { backgroundColor: isMale ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#831843' : '#fce7f3') },
              ]}
            >
              <Ionicons
                name={isMale ? 'male' : 'female'}
                size={12}
                color={isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d')}
              />
              <Text
                style={[
                  styles.genderText,
                  { color: isMale ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#f472b6' : '#be185d') },
                ]}
              >
                {pet.sexo}
              </Text>
            </View>
          </View>

          {/* Badges de Identificación Oficial y NFC */}
          <View style={styles.badgesRow}>
            <View style={[styles.idChip, isDark && styles.idChipDark]}>
              <Text style={[styles.idChipText, isDark && styles.idChipTextDark]}>{pet.id}</Text>
            </View>
            {isNfcLinked ? (
              <View style={[styles.nfcChipLinked, isDark && styles.nfcChipLinkedDark]}>
                <MaterialIcons name="nfc" size={12} color={isDark ? '#4ade80' : '#15803d'} />
                <Text style={[styles.nfcChipLinkedText, isDark && styles.nfcChipLinkedTextDark]}>
                  NFC Activo
                </Text>
              </View>
            ) : (
              <View style={[styles.nfcChipUnlinked, isDark && styles.nfcChipUnlinkedDark]}>
                <MaterialIcons name="nfc" size={12} color={isDark ? '#71717a' : '#9ca3af'} />
                <Text style={[styles.nfcChipUnlinkedText, isDark && styles.nfcChipUnlinkedTextDark]}>
                  Sin NFC
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.petBreed, isDark && styles.petBreedDark]}>
            {pet.especie} • {pet.raza}
          </Text>

          {/* Fila de Peso y Edad */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <MaterialIcons name="scale" size={14} color="#04b639" />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.peso}
              </Text>
            </View>

            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <MaterialIcons name="cake" size={14} color="#04b639" />
              <Text style={[styles.metricText, isDark && styles.metricTextDark]}>
                {pet.edad}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isDark ? '#71717a' : '#a1a1aa'}
          />
        </View>
      </View>

      {/* Fila de Acciones Rápidas: QR y Vincular NFC */}
      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, styles.qrQuickBtn, isDark && styles.qrQuickBtnDark]}
          onPress={(e) => {
            e.stopPropagation?.();
            onQrPress(pet);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="qr-code" size={16} color="#04b639" />
          <Text style={styles.quickActionBtnText}>QR / 3D</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionBtn,
            isNfcLinked
              ? (isDark ? styles.nfcQuickBtnLinkedDark : styles.nfcQuickBtnLinked)
              : (isDark ? styles.nfcQuickBtnDark : styles.nfcQuickBtn),
          ]}
          onPress={(e) => {
            e.stopPropagation?.();
            onNfcPress(pet);
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="nfc"
            size={16}
            color={isNfcLinked ? (isDark ? '#4ade80' : '#15803d') : '#04b639'}
          />
          <Text
            style={[
              styles.quickActionBtnText,
              isNfcLinked && { color: isDark ? '#4ade80' : '#15803d', fontWeight: '700' },
            ]}
          >
            {isNfcLinked ? '✓ NFC Vinculado' : 'Vincular NFC'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

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
  const [loading, setLoading] = useState(false);

  const handleModalShow = () => {
    setNombre('');
    setRaza('');
    setPeso('');
    setEdad('');
    setPropietario('');
    setTelefono('');
    setDescripcion('');
    getNextSuggestedPetId().then((sug) => setPetId(sug));
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
          telefonoContacto: telefono.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
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
                <MaterialIcons name="pets" size={24} color="#04b639" />
              </View>
              <View>
                <Text style={[styles.formTitle, isDark && styles.textDark]}>Registrar Mascota</Text>
                <Text style={[styles.formSubtitle, isDark && styles.formSubtitleDark]}>Alta clínica oficial en el sistema</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={isDark ? '#a1a1aa' : '#6b7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formBody} showsVerticalScrollIndicator={false}>
            {/* ID Estable */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Identificador Estable Único</Text>
                <Text style={[styles.formBadgeLabel, isDark && { backgroundColor: '#132e1f', color: '#4ade80' }]}>Código oficial</Text>
              </View>
              <View style={styles.idRow}>
                <TextInput
                  style={[styles.formInput, styles.idInput, isDark && styles.formInputDark]}
                  value={petId}
                  onChangeText={setPetId}
                  autoCapitalize="characters"
                  placeholder="PET-001"
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                />
                <TouchableOpacity
                  style={[styles.suggestBtn, isDark && { backgroundColor: '#132e1f', borderColor: '#166534' }]}
                  onPress={() => getNextSuggestedPetId().then((sug) => setPetId(sug))}
                >
                  <Ionicons name="refresh" size={16} color="#04b639" />
                  <Text style={[styles.suggestBtnText, isDark && { color: '#4ade80' }]}>Auto</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.formHint, isDark && styles.formSubtitleDark]}>
                Este código identifica a la mascota y se vinculará a su etiqueta o collar NFC.
              </Text>
            </View>

            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Nombre de la Mascota *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Max, Luna, Rocky"
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              />
            </View>

            {/* Especie y Sexo */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Especie</Text>
                <View style={styles.selectorRow}>
                  {['Perro', 'Gato'].map((esp) => (
                    <TouchableOpacity
                      key={esp}
                      style={[
                        styles.selectorBtn,
                        isDark && styles.selectorBtnDark,
                        especie === esp && (isDark ? { backgroundColor: '#132e1f', borderColor: '#04b639' } : styles.selectorBtnActive),
                      ]}
                      onPress={() => setEspecie(esp)}
                    >
                      <Text
                        style={[
                          styles.selectorBtnText,
                          isDark && styles.formSubtitleDark,
                          especie === esp && styles.selectorBtnTextActive,
                        ]}
                      >
                        {esp === 'Perro' ? '🐶 Perro' : '🐱 Gato'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Sexo</Text>
                <View style={styles.selectorRow}>
                  {['Macho', 'Hembra'].map((sx) => (
                    <TouchableOpacity
                      key={sx}
                      style={[
                        styles.selectorBtn,
                        isDark && styles.selectorBtnDark,
                        sexo === sx && (isDark ? { backgroundColor: '#132e1f', borderColor: '#04b639' } : styles.selectorBtnActive),
                      ]}
                      onPress={() => setSexo(sx)}
                    >
                      <Text
                        style={[
                          styles.selectorBtnText,
                          isDark && styles.formSubtitleDark,
                          sexo === sx && styles.selectorBtnTextActive,
                        ]}
                      >
                        {sx}
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
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.8 }]}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Peso</Text>
                <TextInput
                  style={[styles.formInput, isDark && styles.formInputDark]}
                  value={peso}
                  onChangeText={setPeso}
                  placeholder="Ej: 28 kg"
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
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
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              />
            </View>

            {/* Propietario y Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={[styles.formLabel, isDark && styles.textDark]}>Propietario / Tutor *</Text>
              <TextInput
                style={[styles.formInput, isDark && styles.formInputDark]}
                value={propietario}
                onChangeText={setPropietario}
                placeholder="Nombre completo del dueño"
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
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
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
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
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={18} color="#ffffff" style={{ marginRight: 8 }} />
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
        peso: String(pet.peso ?? ''),
        edad: String(pet.edad ?? pet.fechaNacimiento ?? ''),
        fotoUrl: pet.fotoUrl || '',
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
    if (!isVeterinario) {
      Alert.alert(
        'Acceso Denegado (Seguridad)',
        'Solo los profesionales veterinarios autorizados tienen permisos para vincular o reasignar etiquetas NFC en VetLink.\n\nPuedes cambiar tu rol a Veterinario en la sección "Mi Perfil" para probar esta funcionalidad.'
      );
      return;
    }
    setNfcMascota(pet);
  };

  const renderPetCard = ({ item }: { item: Pet }) => (
    <PetCard
      pet={item}
      onPress={handlePetPress}
      onQrPress={setQrMascota}
      onNfcPress={handleVincularNfcPress}
      isDark={isDark}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, isDark && styles.emptyIconCircleDark]}>
        <MaterialIcons name="pets" size={56} color="#04b639" />
      </View>
      <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
        No tienes mascotas registradas
      </Text>
      <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
        {isVeterinario
          ? 'Registra pacientes clínicos para gestionar sus fichas y etiquetas NFC.'
          : 'Registra a tu primera mascota o vincula su placa para ver sus datos.'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleRegisterPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
        <Text style={styles.emptyButtonText}>
          {isVeterinario ? 'Registrar nuevo paciente' : 'Registrar mi primera mascota'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Superior */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View>
          <Text style={styles.headerBrand}>VetLink</Text>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            {isVeterinario ? 'Mascotas Clínicas' : 'Mis Mascotas'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggleButton style={{ marginRight: 6 }} />
          <TouchableOpacity
            style={[styles.reloadButton, isDark && styles.reloadButtonDark]}
            onPress={refresh}
            activeOpacity={0.7}
            accessibilityLabel="Recargar mascotas"
          >
            <Ionicons name="refresh-outline" size={20} color={isDark ? '#fafafa' : '#18181b'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerPrimaryButton}
            onPress={handleRegisterPress}
            activeOpacity={0.8}
          >
            <Ionicons name={isVeterinario ? 'add-circle-outline' : 'qr-code-outline'} size={18} color="#ffffff" />
            <Text style={styles.headerPrimaryButtonText}>
              {isVeterinario ? 'Registrar' : 'Vincular'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido Principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#04b639" />
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
              colors={['#04b639']}
              tintColor="#04b639"
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
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                🐾 {qrMascota?.nombre}
              </Text>
              <TouchableOpacity onPress={() => setQrMascota(null)}>
                <Ionicons name="close" size={24} color={isDark ? '#a1a1aa' : '#6b7280'} />
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

      {/* Modal Vincular NFC (Compartido con [id].tsx) */}
      {nfcMascota && (
        <VincularNfcModal
          visible={!!nfcMascota}
          mascota={nfcMascota}
          onClose={() => setNfcMascota(null)}
          onSuccess={() => {
            setNfcMascota(null);
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
    backgroundColor: '#ffffff',
  },
  safeAreaDark: {
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerDark: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
  },
  headerBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: '#04b639',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerTitleDark: {
    color: '#f4f4f5',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reloadButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButtonDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  headerPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  headerPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
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
    color: '#64748b',
    fontWeight: '500',
  },
  loadingTextDark: {
    color: '#a1a1aa',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircleDark: {
    backgroundColor: '#14532d33',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: '#f4f4f5',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptySubtitleDark: {
    color: '#a1a1aa',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b639',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#04b639',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  // Card styles
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 14,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#15803d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(21, 128, 61, 0.07)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  speciesBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  speciesBadgeDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  speciesBadgeText: {
    fontSize: 13,
  },
  petInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14532d',
  },
  petNameDark: {
    color: '#f4f4f5',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  petBreed: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  petBreedDark: {
    color: '#a1a1aa',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  idChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  idChipDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  idChipTextDark: {
    color: '#e4e4e7',
  },
  nfcChipLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcChipLinkedDark: {
    backgroundColor: '#064e3b33',
    borderColor: '#059669',
  },
  nfcChipLinkedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  nfcChipLinkedTextDark: {
    color: '#4ade80',
  },
  nfcChipUnlinked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nfcChipUnlinkedDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  nfcChipUnlinkedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  nfcChipUnlinkedTextDark: {
    color: '#a1a1aa',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  metricItemDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  metricTextDark: {
    color: '#e4e4e7',
  },
  arrowContainer: {
    marginLeft: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  quickActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#04b639',
  },
  qrQuickBtn: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  qrQuickBtnDark: {
    backgroundColor: '#14532d22',
    borderColor: '#166534',
  },
  nfcQuickBtn: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  nfcQuickBtnDark: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  nfcQuickBtnLinked: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nfcQuickBtnLinkedDark: {
    backgroundColor: '#064e3b33',
    borderWidth: 1,
    borderColor: '#059669',
  },
  // Bottom Sheet Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalSheetDark: {
    backgroundColor: '#18181b',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
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
    borderBottomColor: '#f1f5f9',
    marginBottom: 4,
  },
  modalHeaderDark: {
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalTitleDark: {
    color: '#f4f4f5',
  },
  // Form Modal styles
  formSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
    fontWeight: '700',
    color: '#334155',
  },
  formBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#04b639',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  suggestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#04b639',
  },
  formHint: {
    fontSize: 12,
    color: '#64748b',
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnActive: {
    borderColor: '#04b639',
    backgroundColor: '#ecfdf5',
  },
  selectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  selectorBtnTextActive: {
    color: '#04b639',
    fontWeight: '700',
  },
  formTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#04b639',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  formSheetContainerDark: {
    backgroundColor: '#18181b',
  },
  formHeaderDark: {
    borderBottomColor: '#27272a',
  },
  formIconCircleDark: {
    backgroundColor: '#064e3b',
  },
  formSubtitleDark: {
    color: '#a1a1aa',
  },
  formInputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#f4f4f5',
  },
  selectorBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  textDark: {
    color: '#fafafa',
  },
});
