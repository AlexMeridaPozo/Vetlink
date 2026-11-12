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
import { Turno } from '@/services/turnoService';

interface Props {
  visible: boolean;
  turno: Turno | null;
  onClose: () => void;
  onConfirmarAtencion: (turnoId: string, notasVeterinario: string, vetInfo?: { id?: string; nombre?: string }) => Promise<void>;
}

const OBSERVACIONES_PRESET = [
  'Paciente en excelente estado general. Vacunación aplicada sin incidencias.',
  'Se realizó desparasitación interna y externa. Próximo control en 3 meses.',
  'Consulta clínica completada. Se indican gotas óticas cada 12 hs por 7 días.',
  'Control post-quirúrgico satisfactorio. Herida limpia con buena cicatrización.',
  'Higiene y corte de uñas completados satisfactoriamente.',
];

export default function AtenderTurnoModal({
  visible,
  turno,
  onClose,
  onConfirmarAtencion,
}: Props) {
  const { isDark } = useAppTheme();
  const { user, profile } = useAuth();

  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);

  React.useEffect(() => {
    if (visible && turno) {
      setNotas('');
    }
  }, [visible, turno]);

  if (!turno) return null;

  const vetNombre = profile?.displayName || user?.displayName || 'Dr. Profesional';

  const handleGuardar = async () => {
    const textoFinal = notas.trim() || 'Consulta médica realizada con éxito. Paciente en buen estado general.';
    setEnviando(true);
    try {
      await onConfirmarAtencion(turno.id, textoFinal, {
        id: user?.uid || 'vet-pro-1',
        nombre: vetNombre,
      });

      const msg = `Atención de ${turno.mascotaNombre} registrada como completada.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Turno Atendido', msg);
      }
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || 'No se pudo actualizar el estado de la cita.';
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
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, isDark && styles.textDark]}>
                Completar Atención Médica
              </Text>
              <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
                Registrá las observaciones del paciente para el historial
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
            {/* Resumen del paciente y turno */}
            <View style={[styles.patientCard, isDark && styles.patientCardDark]}>
              <View style={styles.patientAvatarBox}>
                <MaterialCommunityIcons
                  name={turno.mascotaEspecie === 'gato' ? 'cat' : 'dog'}
                  size={24}
                  color={Palette.greenDeep}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.patientName, isDark && styles.textDark]}>
                  {turno.mascotaNombre}
                </Text>
                <Text style={[styles.patientDetail, isDark && styles.subtituloDark]}>
                  Tutor: {turno.tutorNombre} • Motivo: {turno.motivo}
                </Text>
                <Text style={[styles.patientDetail, isDark && styles.subtituloDark]}>
                  Horario: {turno.fecha} a las {turno.hora} hs
                </Text>
              </View>
            </View>

            {/* Profesional firmante */}
            <View style={[styles.vetSignBox, isDark && styles.vetSignBoxDark]}>
              <Ionicons name="shield-checkmark" size={16} color={Palette.greenDeep} />
              <Text style={[styles.vetSignText, isDark && styles.textDark]}>
                Atendido por: <Text style={{ fontWeight: '700' }}>{vetNombre}</Text>
                {profile?.matricula ? ` (Matrícula: ${profile.matricula})` : ''}
              </Text>
            </View>

            {/* Opciones rápidas de diagnóstico */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              Plantillas Rápidas de Diagnóstico
            </Text>
            <View style={styles.presetsContainer}>
              {OBSERVACIONES_PRESET.map((obs, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetPill,
                    isDark && styles.presetPillDark,
                    notas === obs && styles.presetPillActive,
                  ]}
                  onPress={() => setNotas(obs)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={notas === obs ? '#ffffff' : (isDark ? '#a1a1aa' : Palette.textSecondary)}
                  />
                  <Text
                    style={[
                      styles.presetText,
                      isDark && styles.textDark,
                      notas === obs && styles.presetTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {obs}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo de notas clínicas */}
            <Text style={[styles.sectionLabel, isDark && styles.textDark, { marginTop: 14 }]}>
              Observaciones Clínicas / Indicaciones
            </Text>
            <TextInput
              style={[styles.textArea, isDark && styles.textAreaDark]}
              placeholder="Ingresá detalles de la revisión médica, medicamentos recetados o próximas pautas para el tutor..."
              placeholderTextColor={isDark ? '#71717a' : Palette.textMuted}
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={[styles.footer, isDark && styles.footerDark]}>
            <TouchableOpacity
              style={[styles.submitButton, enviando && { opacity: 0.7 }]}
              onPress={handleGuardar}
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Marcar Atendido y Guardar</Text>
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
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.backgroundLight,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 12,
  },
  patientCardDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  patientAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  patientDetail: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  vetSignBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginTop: 10,
  },
  vetSignBoxDark: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  vetSignText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
    flex: 1,
  },
  sectionLabel: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  presetsContainer: {
    gap: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Palette.backgroundLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  presetPillDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  presetPillActive: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.greenDeep,
  },
  presetText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    flex: 1,
  },
  presetTextActive: {
    color: '#ffffff',
    fontWeight: '700',
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
    minHeight: 90,
  },
  textAreaDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    color: '#fafafa',
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
