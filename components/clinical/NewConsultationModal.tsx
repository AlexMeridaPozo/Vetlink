import React, { useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { NewConsultationInput } from '@/types/clinicalRecord';

interface NewConsultationModalProps {
  visible: boolean;
  petName: string;
  mascotaId: string;
  onClose: () => void;
  onSave: (data: NewConsultationInput) => Promise<void>;
}

export function NewConsultationModal({
  visible,
  petName,
  mascotaId,
  onClose,
  onSave,
}: NewConsultationModalProps) {
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fecha, setFecha] = useState(getTodayDate());
  const [motivo, setMotivo] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    fecha?: string;
    motivo?: string;
    diagnostico?: string;
    tratamiento?: string;
  }>({});

  const resetForm = () => {
    setFecha(getTodayDate());
    setMotivo('');
    setDiagnostico('');
    setTratamiento('');
    setObservaciones('');
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async () => {
    const newErrors: {
      fecha?: string;
      motivo?: string;
      diagnostico?: string;
      tratamiento?: string;
    } = {};

    if (!fecha.trim()) {
      newErrors.fecha = 'La fecha de consulta es obligatoria.';
    }
    if (!motivo.trim()) {
      newErrors.motivo = 'El motivo de la consulta es obligatorio.';
    }
    if (!diagnostico.trim()) {
      newErrors.diagnostico = 'El diagnóstico clínico es obligatorio.';
    }
    if (!tratamiento.trim()) {
      newErrors.tratamiento = 'El tratamiento indicado es obligatorio.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Campos requeridos', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onSave({
        mascotaId,
        fecha: fecha.trim(),
        motivo: motivo.trim(),
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
        observaciones: observaciones.trim() || undefined,
        veterinariaNombre: 'Clínica Veterinaria VetLink',
      });

      resetForm();
      onClose();
      Alert.alert('Éxito', 'Consulta clínica registrada correctamente.');
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      Alert.alert('Error', 'No se pudo guardar la consulta. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Cabecera del Modal */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconWrapper}>
                <MaterialIcons name="add-circle-outline" size={24} color="#04b639" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Nueva Consulta</Text>
                <Text style={styles.modalSubtitle}>Paciente: {petName}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollForm} showsVerticalScrollIndicator={false}>
            {/* Campo: Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Fecha <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.fecha ? styles.inputError : null]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={fecha}
                onChangeText={(val) => {
                  setFecha(val);
                  if (errors.fecha) setErrors((prev) => ({ ...prev, fecha: undefined }));
                }}
              />
              {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
            </View>

            {/* Campo: Motivo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Motivo de la consulta <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput, errors.motivo ? styles.inputError : null]}
                placeholder="Ej: Fiebre, vómitos, tos, revisión de rutina..."
                placeholderTextColor="#9CA3AF"
                value={motivo}
                onChangeText={(val) => {
                  setMotivo(val);
                  if (errors.motivo) setErrors((prev) => ({ ...prev, motivo: undefined }));
                }}
                multiline
                numberOfLines={2}
              />
              {errors.motivo && <Text style={styles.errorText}>{errors.motivo}</Text>}
            </View>

            {/* Campo: Diagnóstico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Diagnóstico <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput, errors.diagnostico ? styles.inputError : null]}
                placeholder="Ej: Gastroenteritis aguda, sospecha alimentaria..."
                placeholderTextColor="#9CA3AF"
                value={diagnostico}
                onChangeText={(val) => {
                  setDiagnostico(val);
                  if (errors.diagnostico) setErrors((prev) => ({ ...prev, diagnostico: undefined }));
                }}
                multiline
                numberOfLines={2}
              />
              {errors.diagnostico && <Text style={styles.errorText}>{errors.diagnostico}</Text>}
            </View>

            {/* Campo: Tratamiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tratamiento indicado <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput, errors.tratamiento ? styles.inputError : null]}
                placeholder="Ej: Dieta blanda, antibióticos o analgésicos con dosis y frecuencia..."
                placeholderTextColor="#9CA3AF"
                value={tratamiento}
                onChangeText={(val) => {
                  setTratamiento(val);
                  if (errors.tratamiento) setErrors((prev) => ({ ...prev, tratamiento: undefined }));
                }}
                multiline
                numberOfLines={3}
              />
              {errors.tratamiento && <Text style={styles.errorText}>{errors.tratamiento}</Text>}
            </View>

            {/* Campo: Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observaciones (opcional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Notas adicionales, controles programados o advertencias..."
                placeholderTextColor="#9CA3AF"
                value={observaciones}
                onChangeText={setObservaciones}
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Guardar consulta</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollForm: {
    maxHeight: 460,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#04b639',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
