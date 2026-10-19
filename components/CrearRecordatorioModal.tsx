import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  crearRecordatorio,
  getUsuariosDestinatarios,
  type UsuarioDestinatario,
  type Recordatorio,
} from '@/services/reminderService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (recordatorio: Recordatorio) => void;
}

const PRESET_TITULOS = [
  { icon: '💉', label: 'Vacuna Antirrábica', desc: 'Dosis anual de refuerzo contra la rabia.' },
  { icon: '🩺', label: 'Control Clínico General', desc: 'Chequeo preventivo de rutina y control de peso.' },
  { icon: '💊', label: 'Antiparasitario Interno', desc: 'Administrar pastilla antiparasitaria con el alimento.' },
  { icon: '✂️', label: 'Retiro de Puntos', desc: 'Revisión de cicatrización y retiro de suturas.' },
  { icon: '🦷', label: 'Control Dental', desc: 'Limpieza dental y revisión de encías.' },
  { icon: '🧪', label: 'Análisis de Sangre', desc: 'Venir en ayunas de 8 horas para extracción de muestra.' },
];

export default function CrearRecordatorioModal({ visible, onClose, onSuccess }: Props) {
  const { isDark } = useAppTheme();
  const { user, profile, isVeterinario } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioDestinatario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioDestinatario | null>(null);
  const [mostrarSelectorUsuario, setMostrarSelectorUsuario] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('10:00');
  const [guardando, setGuardando] = useState(false);

  // Inicializar fecha sugerida (mañana)
  useEffect(() => {
    if (visible) {
      const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const yyyy = manana.getFullYear();
      const mm = String(manana.getMonth() + 1).padStart(2, '0');
      const dd = String(manana.getDate()).padStart(2, '0');
      setFecha(`${yyyy}-${mm}-${dd}`);
      setHora('10:00');
      setTitulo('');
      setDescripcion('');
      setUsuarioSeleccionado(null);
      setBusquedaUsuario('');
      setMostrarSelectorUsuario(false);

      cargarUsuarios();
    }
  }, [visible]);

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true);
    try {
      const list = await getUsuariosDestinatarios();
      setUsuarios(list);
    } catch {
      // Ignorar error menor
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const setFechaRapida = (diasAdelante: number, horaDefecto: string = '10:00') => {
    const target = new Date(Date.now() + diasAdelante * 24 * 60 * 60 * 1000);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setFecha(`${yyyy}-${mm}-${dd}`);
    setHora(horaDefecto);
  };

  const handleSeleccionarPreset = (preset: { label: string; desc: string }) => {
    setTitulo(preset.label);
    if (!descripcion) {
      setDescripcion(preset.desc);
    }
  };

  const handleGuardar = async () => {
    if (!isVeterinario) {
      Alert.alert(
        'Acceso Restringido',
        'Solo los usuarios con rol de Veterinario pueden programar recordatorios sanitarios.'
      );
      return;
    }

    if (!usuarioSeleccionado) {
      Alert.alert('Falta Destinatario', 'Por favor selecciona el usuario al que se le enviará el recordatorio.');
      return;
    }

    if (!titulo.trim()) {
      Alert.alert('Falta Título', 'Por favor ingresa el título o motivo del recordatorio.');
      return;
    }

    if (!fecha || !hora) {
      Alert.alert('Falta Fecha y Hora', 'Por favor especifica la fecha y hora programadas.');
      return;
    }

    setGuardando(true);
    try {
      const vetNombre = profile?.displayName || user?.displayName || 'Dr. Veterinario';
      const vetId = user?.uid || 'vet-uid';

      const nuevo = await crearRecordatorio(
        {
          userId: usuarioSeleccionado.uid,
          userName: usuarioSeleccionado.displayName,
          userEmail: usuarioSeleccionado.email,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: fecha.trim(),
          hora: hora.trim(),
          veterinarioId: vetId,
          veterinarioNombre: vetNombre,
        },
        isVeterinario
      );

      Alert.alert(
        '¡Recordatorio Creado!',
        `El recordatorio se ha guardado correctamente y se programó una notificación automática para ${usuarioSeleccionado.displayName} el ${fecha} a las ${hora} hs.`
      );

      onSuccess(nuevo);
      onClose();
    } catch (error: any) {
      Alert.alert('Error al Guardar', error?.message || 'No se pudo guardar el recordatorio. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busquedaUsuario.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, isDark && styles.containerDark]}
      >
        {/* Barra Superior */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={isDark ? '#fafafa' : '#0f172a'} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, isDark && styles.textDark]}>
              Nuevo Recordatorio Automático
            </Text>
            <Text style={[styles.headerSubtitle, isDark && styles.subtituloDark]}>
              Notificación automática para el tutor
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner Informativo */}
          <View style={[styles.infoBanner, isDark && styles.infoBannerDark]}>
            <Ionicons name="notifications-outline" size={24} color="#04b639" />
            <Text style={[styles.infoBannerText, isDark && styles.subtituloDark]}>
              El usuario recibirá una notificación automática en su teléfono en la fecha y hora configuradas, incluso si la app está cerrada.
            </Text>
          </View>

          {/* 1. SELECCIÓN DE USUARIO ASOCIADO */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>
              Usuario Destinatario (Tutor) <Text style={styles.required}>*</Text>
            </Text>

            {usuarioSeleccionado ? (
              <View style={[styles.selectedUserCard, isDark && styles.selectedUserCardDark]}>
                <View style={styles.userAvatarCircle}>
                  <Ionicons name="person" size={20} color="#04b639" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectedUserName, isDark && styles.textDark]}>
                    {usuarioSeleccionado.displayName}
                  </Text>
                  <Text style={[styles.selectedUserEmail, isDark && styles.subtituloDark]}>
                    {usuarioSeleccionado.email}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.changeUserBtn}
                  onPress={() => setMostrarSelectorUsuario(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.changeUserBtnText}>Cambiar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.selectUserTrigger, isDark && styles.inputDark]}
                onPress={() => setMostrarSelectorUsuario(!mostrarSelectorUsuario)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={20} color="#04b639" style={{ marginRight: 8 }} />
                <Text style={[styles.selectUserPlaceholder, isDark && styles.subtituloDark]}>
                  Seleccionar usuario del sistema...
                </Text>
                <Ionicons name="chevron-down" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}

            {/* Desplegable de búsqueda y selección de usuarios */}
            {mostrarSelectorUsuario && (
              <View style={[styles.userDropdown, isDark && styles.userDropdownDark]}>
                <View style={[styles.searchBox, isDark && styles.searchBoxDark]}>
                  <Ionicons name="search" size={16} color="#94a3b8" style={{ marginRight: 6 }} />
                  <TextInput
                    style={[styles.searchInput, isDark && styles.textDark]}
                    placeholder="Buscar por nombre o correo..."
                    placeholderTextColor="#94a3b8"
                    value={busquedaUsuario}
                    onChangeText={setBusquedaUsuario}
                    autoCapitalize="none"
                  />
                  {busquedaUsuario ? (
                    <TouchableOpacity onPress={() => setBusquedaUsuario('')}>
                      <Ionicons name="close-circle" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {cargandoUsuarios ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#04b639" />
                  </View>
                ) : usuariosFiltrados.length === 0 ? (
                  <Text style={[styles.emptyUserText, isDark && styles.subtituloDark]}>
                    No se encontraron usuarios registrados.
                  </Text>
                ) : (
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {usuariosFiltrados.map((u) => (
                      <TouchableOpacity
                        key={u.uid}
                        style={[
                          styles.userOptionItem,
                          isDark && styles.userOptionItemDark,
                          usuarioSeleccionado?.uid === u.uid && styles.userOptionItemSelected,
                        ]}
                        onPress={() => {
                          setUsuarioSeleccionado(u);
                          setMostrarSelectorUsuario(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="person-circle-outline" size={22} color="#04b639" style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.userOptionName, isDark && styles.textDark]}>
                            {u.displayName}
                          </Text>
                          <Text style={[styles.userOptionEmail, isDark && styles.subtituloDark]}>
                            {u.email}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* 2. SUGERENCIAS RÁPIDAS DE TÍTULOS */}
          <View style={styles.formGroup}>
            <Text style={[styles.subLabel, isDark && styles.subtituloDark]}>
              Plantillas Rápidas:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {PRESET_TITULOS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetChip,
                    isDark && styles.presetChipDark,
                    titulo === p.label && styles.presetChipActive,
                  ]}
                  onPress={() => handleSeleccionarPreset(p)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>
                    {p.icon} {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 3. TÍTULO DEL RECORDATORIO */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>
              Título del Recordatorio <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]}
              placeholder="Ej: Vacuna Séxtuple canina / Control de peso"
              placeholderTextColor="#94a3b8"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          {/* 4. FECHA Y HORA */}
          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, isDark && styles.textDark]}>
                Fecha (AAAA-MM-DD) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]}
                placeholder="2026-10-25"
                placeholderTextColor="#94a3b8"
                value={fecha}
                onChangeText={setFecha}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, isDark && styles.textDark]}>
                Hora (HH:mm) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark, isDark && styles.textDark]}
                placeholder="10:00"
                placeholderTextColor="#94a3b8"
                value={hora}
                onChangeText={setHora}
              />
            </View>
          </View>

          {/* Botones de fecha rápida */}
          <View style={styles.quickDateRow}>
            <TouchableOpacity
              style={[styles.quickDateBtn, isDark && styles.quickDateBtnDark]}
              onPress={() => setFechaRapida(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDateBtnText}>Mañana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickDateBtn, isDark && styles.quickDateBtnDark]}
              onPress={() => setFechaRapida(3)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDateBtnText}>En 3 días</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickDateBtn, isDark && styles.quickDateBtnDark]}
              onPress={() => setFechaRapida(7)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDateBtnText}>En 1 semana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickDateBtn, isDark && styles.quickDateBtnDark]}
              onPress={() => setFechaRapida(30)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDateBtnText}>En 1 mes</Text>
            </TouchableOpacity>
          </View>

          {/* 5. DESCRIPCIÓN / INDICACIONES */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>
              Descripción / Indicaciones para el tutor
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                isDark && styles.inputDark,
                isDark && styles.textDark,
              ]}
              placeholder="Instrucciones clínicas, dosis, si requiere ayuno, o detalles para la consulta..."
              placeholderTextColor="#94a3b8"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* BOTÓN PROGRAMAR */}
          <TouchableOpacity
            style={[styles.submitButton, guardando && styles.submitButtonDisabled]}
            onPress={handleGuardar}
            disabled={guardando}
            activeOpacity={0.85}
          >
            {guardando ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialIcons name="alarm-add" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Programar Recordatorio Automático</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerDark: {
    borderBottomColor: '#27272a',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  infoBannerDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  inputDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    color: '#fafafa',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  quickDateBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickDateBtnDark: {
    backgroundColor: '#27272a',
  },
  quickDateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#04b639',
  },
  // Selector de usuario
  selectUserTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectUserPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  selectedUserCardDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  userAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  selectedUserEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  changeUserBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#04b639',
    borderRadius: 8,
  },
  changeUserBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  userDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
    padding: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  userDropdownDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  searchBoxDark: {
    backgroundColor: '#27272a',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 4,
  },
  emptyUserText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  userOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userOptionItemDark: {
    borderBottomColor: '#27272a',
  },
  userOptionItemSelected: {
    backgroundColor: '#f0fdf4',
  },
  userOptionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  userOptionEmail: {
    fontSize: 11,
    color: '#64748b',
  },
  // Presets
  presetsRow: {
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  presetChipDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  presetChipActive: {
    backgroundColor: '#04b639',
    borderColor: '#04b639',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#04b639',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
