import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ClinicalConsultation } from '@/types/clinicalRecord';

interface ConsultationCardProps {
  consultation: ClinicalConsultation;
  initialExpanded?: boolean;
}

export function ConsultationCard({
  consultation,
  initialExpanded = false,
}: ConsultationCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  // Formato amigable de fecha (ej: 14/08/2026)
  const formatFecha = (fechaStr: string) => {
    try {
      const [year, month, day] = fechaStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return fechaStr;
    } catch {
      return fechaStr;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, expanded && styles.cardExpanded]}
      onPress={toggleExpand}
      activeOpacity={0.7}
    >
      {/* Cabecera de la consulta: Fecha e indicador de expansión */}
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <MaterialIcons name="event" size={14} color="#04b639" />
          <Text style={styles.dateText}>{formatFecha(consultation.fecha)}</Text>
        </View>

        <View style={styles.expandAction}>
          <Text style={styles.expandActionText}>
            {expanded ? 'Ocultar detalle' : 'Ver detalle'}
          </Text>
          <MaterialIcons
            name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color="#6B7280"
          />
        </View>
      </View>

      {/* Motivo de la consulta */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Motivo de la consulta</Text>
        <Text style={styles.fieldValue}>{consultation.motivo}</Text>
      </View>

      {/* Diagnóstico */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Diagnóstico</Text>
        <Text style={[styles.fieldValue, styles.diagnosisValue]}>
          {consultation.diagnostico}
        </Text>
      </View>

      {/* Contenido expandible: Tratamiento y Observaciones */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.expandedDivider} />

          {/* Tratamiento */}
          <View style={[styles.fieldSection, styles.treatmentBox]}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="healing" size={16} color="#04b639" />
              <Text style={[styles.fieldLabel, styles.highlightLabel]}>Tratamiento indicado</Text>
            </View>
            <Text style={styles.fieldValue}>{consultation.tratamiento}</Text>
          </View>

          {/* Observaciones (si existen) */}
          {consultation.observaciones && consultation.observaciones.trim().length > 0 && (
            <View style={styles.fieldSection}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="notes" size={16} color="#6B7280" />
                <Text style={styles.fieldLabel}>Observaciones</Text>
              </View>
              <Text style={styles.fieldValue}>{consultation.observaciones}</Text>
            </View>
          )}

          {/* Profesional / Veterinaria */}
          {(consultation.veterinariaNombre || consultation.veterinarioMatricula) && (
            <View style={styles.vetFooter}>
              <MaterialIcons name="verified-user" size={14} color="#6B7280" />
              <Text style={styles.vetFooterText}>
                Atendido en: {consultation.veterinariaNombre || 'Clínica Veterinaria'}
                {consultation.veterinarioMatricula ? ` (${consultation.veterinarioMatricula})` : ''}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardExpanded: {
    borderColor: '#04b639',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#04b639',
  },
  expandAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expandActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  fieldSection: {
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  highlightLabel: {
    color: '#04b639',
  },
  fieldValue: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  diagnosisValue: {
    fontWeight: '500',
    color: '#111827',
  },
  expandedContent: {
    marginTop: 6,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  treatmentBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#04b639',
  },
  vetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  vetFooterText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
