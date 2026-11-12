import React, { useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { usePets } from '@/services/petService';
import { PUNTOS_VETERINARIOS_PILAR, type LugarMascotas } from '@/constants/veterinarias';
import { SolicitarTurnoInput, Turno } from '@/services/turnoService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (turno: Turno) => void;
  onSolicitar: (input: SolicitarTurnoInput) => Promise<Turno>;
}

const MOTIVOS_PRESET = [
  { id: '1', icon: '🩺', label: 'Consulta General' },
  { id: '2', icon: '💉', label: 'Vacunación Anual' },
  { id: '3', icon: '💊', label: 'Desparasitación' },
  { id: '4', icon: '✂️', label: 'Castración / Cirugía' },
  { id: '5', icon: '🦷', label: 'Control Odontológico' },
  { id: '6', icon: '🚿', label: 'Peluquería / Higiene' },
  { id: '7', icon: '🚨', label: 'Urgencia Leve' },
];

const HORARIOS_DISPONIBLES = [
  '09:00',
  '09:45',
  '10:30',
  '11:15',
  '12:00',
  '14:00',
  '15:00',
  '15:45',
  '16:30',
  '17:15',
  '18:00',
];

// Generar los próximos 14 días para selección rápida
function generarDiasDisponibles() {
  const dias = [];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  for (let i = 0; i < 14; i++) {
    const fecha = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const isoString = `${yyyy}-${mm}-${dd}`;

    let labelDia = nombresDias[fecha.getDay()];
    if (i === 0) labelDia = 'Hoy';
    else if (i === 1) labelDia = 'Mañ';

    dias.push({
      iso: isoString,
      diaSemana: labelDia,
      numeroDia: fecha.getDate(),
      mes: meses[fecha.getMonth()],
    });
  }
  return dias;
}

export default function SolicitarTurnoModal({
  visible,
  onClose,
  onSuccess,
  onSolicitar,
}: Props) {
  const { isDark } = useAppTheme();
  const { user, profile } = useAuth();
  const { pets } = usePets();

  const dias = generarDiasDisponibles();

  // Estados del formulario
  const [mascotaSeleccionadaId, setMascotaSeleccionadaId] = useState<string>('');
  const [nombreMascotaManual, setNombreMascotaManual] = useState<string>('');
  const [especieMascota, setEspecieMascota] = useState<'perro' | 'gato' | 'otro'>('perro');

  const [veterinariaSeleccionada, setVeterinariaSeleccionada] = useState<LugarMascotas>(
    PUNTOS_VETERINARIOS_PILAR[0]
  );
  const [mostrarSelectorClinica, setMostrarSelectorClinica] = useState(false);

  const [motivo, setMotivo] = useState('Consulta General');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dias[0]?.iso || '');
  const [horaSeleccionada, setHoraSeleccionada] = useState('10:30');
  const [notas, setNotas] = useState('');

  const [enviando, setEnviando] = useState(false);

  // Inicializar mascota seleccionada si hay disponibles
  React.useEffect(() => {
    if (pets && pets.length > 0 && !mascotaSeleccionadaId) {
      setMascotaSeleccionadaId(pets[0].id);
    }
  }, [pets, mascotaSeleccionadaId]);

  const mascotaElegida = pets?.find((p) => p.id === mascotaSeleccionadaId);
  const nombreFinalMascota = mascotaElegida ? mascotaElegida.nombre : nombreMascotaManual || 'Mi Mascota';
  const especieFinal = mascotaElegida
    ? (mascotaElegida.especie?.toLowerCase().includes('gat') ? 'gato' : 'perro')
    : especieMascota;

  const handleSubmit = async () => {
    if (!nombreFinalMascota.trim()) {
      const msg = 'Por favor ingresa o selecciona el nombre de la mascota.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Atención', msg);
      return;
    }

    if (!fechaSeleccionada || !horaSeleccionada) {
      const msg = 'Por favor selecciona fecha y horario para el turno.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Atención', msg);
      return;
    }

    setEnviando(true);
    try {
      const motivoFinal = motivo === 'Otro' ? (motivoPersonalizado.trim() || 'Consulta') : motivo;
      const input: SolicitarTurnoInput = {
        mascotaId: mascotaElegida ? mascotaElegida.id : undefined,
        mascotaNombre: nombreFinalMascota.trim(),
        mascotaEspecie: especieFinal,
        tutorId: user?.uid || 'tutor-default',
        tutorNombre: profile?.displayName || user?.displayName || 'Santino Bravo',
        tutorEmail: profile?.email || user?.email || 'santinobravo2007@gmail.com',
        tutorTelefono: profile?.telefono || '011-3456-7890',
        veterinariaId: veterinariaSeleccionada.id,
        veterinariaNombre: veterinariaSeleccionada.nombre,
        veterinariaDireccion: veterinariaSeleccionada.direccion,
        veterinariaTelefono: veterinariaSeleccionada.telefono,
        motivo: motivoFinal,
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        notasTutor: notas.trim() || undefined,
      };

      const turnoCreado = await onSolicitar(input);
      const exitoMsg = `¡Turno solicitado con éxito!\n\n${turnoCreado.mascotaNombre} en ${turnoCreado.veterinariaNombre} el día ${turnoCreado.fecha} a las ${turnoCreado.hora} hs. La clínica revisará tu solicitud a la brevedad.`;

      if (Platform.OS === 'web') {
        window.alert(exitoMsg);
      } else {
        Alert.alert('¡Turno Solicitado!', exitoMsg);
      }

      onSuccess(turnoCreado);
      onClose();
    } catch (err: any) {
      console.error('[SolicitarTurnoModal] Error al solicitar:', err);
      const errorMsg = err?.message || 'No se pudo procesar la solicitud del turno.';
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert('Error', errorMsg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, isDark && styles.sheetDark]}>
          {/* Header del Modal */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, isDark && styles.textDark]}>
                Solicitar Turno Veterinario
              </Text>
              <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
                Elegí tu mascota, clínica y horario deseado
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, isDark && styles.closeButtonDark]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={isDark ? '#fafafa' : Palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. SELECCIÓN DE MASCOTA */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark]}>
              1. Seleccioná tu Mascota
            </Text>

            {pets && pets.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalChipsRow}
              >
                {pets.map((p) => {
                  const selected = mascotaSeleccionadaId === p.id;
                  const isCat = p.especie?.toLowerCase().includes('gat');
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.petChip,
                        isDark && styles.chipDark,
                        selected && styles.chipSelected,
                      ]}
                      onPress={() => {
                        setMascotaSeleccionadaId(p.id);
                        setNombreMascotaManual('');
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={isCat ? 'cat' : 'dog'}
                        size={18}
                        color={selected ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.greenDeep)}
                      />
                      <Text
                        style={[
                          styles.petChipText,
                          isDark && styles.textDark,
                          selected && styles.chipSelectedText,
                        ]}
                      >
                        {p.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={[
                    styles.petChip,
                    isDark && styles.chipDark,
                    mascotaSeleccionadaId === 'manual' && styles.chipSelected,
                  ]}
                  onPress={() => setMascotaSeleccionadaId('manual')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color={mascotaSeleccionadaId === 'manual' ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                  />
                  <Text
                    style={[
                      styles.petChipText,
                      isDark && styles.textDark,
                      mascotaSeleccionadaId === 'manual' && styles.chipSelectedText,
                    ]}
                  >
                    Otra mascota
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}

            {(!pets || pets.length === 0 || mascotaSeleccionadaId === 'manual') && (
              <View style={styles.manualPetBox}>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Nombre de la mascota (ej: Rocky)"
                  placeholderTextColor={isDark ? '#71717a' : Palette.textMuted}
                  value={nombreMascotaManual}
                  onChangeText={setNombreMascotaManual}
                />
                <View style={styles.speciesRow}>
                  <TouchableOpacity
                    style={[
                      styles.speciesPill,
                      isDark && styles.chipDark,
                      especieMascota === 'perro' && styles.chipSelected,
                    ]}
                    onPress={() => setEspecieMascota('perro')}
                  >
                    <MaterialCommunityIcons
                      name="dog"
                      size={16}
                      color={especieMascota === 'perro' ? '#fff' : (isDark ? '#a1a1aa' : Palette.greenDeep)}
                    />
                    <Text
                      style={[
                        styles.speciesPillText,
                        isDark && styles.textDark,
                        especieMascota === 'perro' && styles.chipSelectedText,
                      ]}
                    >
                      Perro
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.speciesPill,
                      isDark && styles.chipDark,
                      especieMascota === 'gato' && styles.chipSelected,
                    ]}
                    onPress={() => setEspecieMascota('gato')}
                  >
                    <MaterialCommunityIcons
                      name="cat"
                      size={16}
                      color={especieMascota === 'gato' ? '#fff' : (isDark ? '#a1a1aa' : '#0284c7')}
                    />
                    <Text
                      style={[
                        styles.speciesPillText,
                        isDark && styles.textDark,
                        especieMascota === 'gato' && styles.chipSelectedText,
                      ]}
                    >
                      Gato
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 2. SELECCIÓN DE CLÍNICA VETERINARIA */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              2. Clínica Veterinaria
            </Text>

            <TouchableOpacity
              style={[styles.clinicSelectorButton, isDark && styles.cardDark]}
              onPress={() => setMostrarSelectorClinica(!mostrarSelectorClinica)}
              activeOpacity={0.8}
            >
              <View style={styles.clinicIconBox}>
                <Ionicons name="business" size={20} color={Palette.greenDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.clinicName, isDark && styles.textDark]}>
                  {veterinariaSeleccionada.nombre}
                </Text>
                <Text style={[styles.clinicAddress, isDark && styles.subtituloDark]}>
                  {veterinariaSeleccionada.direccion}
                </Text>
              </View>
              <Ionicons
                name={mostrarSelectorClinica ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={isDark ? '#a1a1aa' : Palette.textMuted}
              />
            </TouchableOpacity>

            {mostrarSelectorClinica && (
              <View style={[styles.clinicsListDropdown, isDark && styles.cardDark]}>
                {PUNTOS_VETERINARIOS_PILAR.slice(0, 5).map((vet) => {
                  const isThis = vet.id === veterinariaSeleccionada.id;
                  return (
                    <TouchableOpacity
                      key={vet.id}
                      style={[
                        styles.clinicDropdownItem,
                        isThis && (isDark ? styles.clinicItemActiveDark : styles.clinicItemActive),
                      ]}
                      onPress={() => {
                        setVeterinariaSeleccionada(vet);
                        setMostrarSelectorClinica(false);
                      }}
                    >
                      <Ionicons
                        name={isThis ? 'checkmark-circle' : 'medical-outline'}
                        size={16}
                        color={isThis ? Palette.greenDeep : (isDark ? '#a1a1aa' : Palette.textMuted)}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.clinicDropdownName,
                            isDark && styles.textDark,
                            isThis && { fontWeight: '700', color: Palette.greenDeep },
                          ]}
                        >
                          {vet.nombre}
                        </Text>
                        <Text style={[styles.clinicDropdownAddress, isDark && styles.subtituloDark]}>
                          {vet.direccion}
                        </Text>
                      </View>
                      {vet.guardia24hs && (
                        <View style={styles.guardiaBadge}>
                          <Text style={styles.guardiaBadgeText}>24hs</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* 3. MOTIVO DE CONSULTA */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              3. Motivo de la Cita
            </Text>
            <View style={styles.motivosGrid}>
              {MOTIVOS_PRESET.map((m) => {
                const selected = motivo === m.label;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.motivoChip,
                      isDark && styles.chipDark,
                      selected && styles.chipSelected,
                    ]}
                    onPress={() => setMotivo(m.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 13, marginRight: 5 }}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.motivoChipText,
                        isDark && styles.textDark,
                        selected && styles.chipSelectedText,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. SELECCIÓN DE FECHA */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              4. Fecha
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChipsRow}
            >
              {dias.map((d) => {
                const selected = fechaSeleccionada === d.iso;
                return (
                  <TouchableOpacity
                    key={d.iso}
                    style={[
                      styles.dateCard,
                      isDark && styles.chipDark,
                      selected && styles.dateCardSelected,
                    ]}
                    onPress={() => setFechaSeleccionada(d.iso)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dateDayName,
                        isDark && styles.subtituloDark,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {d.diaSemana}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        isDark && styles.textDark,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {d.numeroDia}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        isDark && styles.subtituloDark,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {d.mes}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 5. SELECCIÓN DE HORA */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              5. Horario
            </Text>
            <View style={styles.horasGrid}>
              {HORARIOS_DISPONIBLES.map((h) => {
                const selected = horaSeleccionada === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.horaChip,
                      isDark && styles.chipDark,
                      selected && styles.chipSelected,
                    ]}
                    onPress={() => setHoraSeleccionada(h)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={selected ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.horaChipText,
                        isDark && styles.textDark,
                        selected && styles.chipSelectedText,
                      ]}
                    >
                      {h} hs
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 6. SÍNTOMAS / NOTAS ADICIONALES */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              6. Síntomas o notas para el profesional (opcional)
            </Text>
            <TextInput
              style={[styles.textArea, isDark && styles.inputDark]}
              placeholder="Ej: Tiene apetito disminuido desde ayer y necesita actualización de libreta sanitaria..."
              placeholderTextColor={isDark ? '#71717a' : Palette.textMuted}
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Botón de Confirmación */}
          <View style={[styles.footer, isDark && styles.footerDark]}>
            <TouchableOpacity
              style={[styles.submitButton, enviando && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="calendar" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Confirmar Solicitud de Turno</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.cardLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetDark: {
    backgroundColor: '#18181b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  headerDark: {
    borderBottomColor: '#27272a',
  },
  title: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonDark: {
    backgroundColor: '#27272a',
  },
  body: {
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingVertical: 14,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  horizontalChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  petChipText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
  },
  manualPetBox: {
    marginTop: 10,
    gap: 8,
  },
  speciesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speciesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  speciesPillText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
  },
  input: {
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: Typography.size.bodySmall,
    color: Palette.textPrimary,
    fontFamily: Typography.family.body,
  },
  inputDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#fafafa',
  },
  textArea: {
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: Typography.size.bodySmall,
    color: Palette.textPrimary,
    fontFamily: Typography.family.body,
    minHeight: 70,
  },
  clinicSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.lg,
    padding: 12,
    gap: 12,
  },
  clinicIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicName: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  clinicAddress: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  clinicsListDropdown: {
    backgroundColor: Palette.cardLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    borderRadius: Radius.lg,
    marginTop: 6,
    overflow: 'hidden',
    ...Shadows.md,
  },
  clinicDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  clinicItemActive: {
    backgroundColor: Palette.greenSoft,
  },
  clinicItemActiveDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  clinicDropdownName: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
  },
  clinicDropdownAddress: {
    fontSize: Typography.size.tiny,
    color: Palette.textSecondary,
  },
  guardiaBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  guardiaBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  motivosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motivoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  motivoChipText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    minWidth: 58,
  },
  dateCardSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
    ...Shadows.sm,
  },
  dateDayName: {
    fontSize: 11,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  dateNumber: {
    fontSize: 17,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textTransform: 'uppercase',
  },
  dateTextSelected: {
    color: '#ffffff',
  },
  horasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  horaChipText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
  },
  chipDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  cardDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  chipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
  },
  chipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  footerDark: {
    borderTopColor: '#27272a',
  },
  submitButton: {
    backgroundColor: Palette.greenDeep,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
