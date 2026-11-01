import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { SosIcon } from '@/components/SosIcon';
import { PUNTOS_VETERINARIOS_PILAR, LugarMascotas } from '@/constants/veterinarias';

// Centro de guardia principal 24hs de Pilar
const GUARDIA_PRINCIPAL = {
  id: 'vet-2',
  nombre: 'Hospital Veterinario San Roque (Guardia 24hs)',
  telefono: '0230-443-5566',
  direccion: 'Av. Tratado del Pilar 280, Pilar',
};

// Veterinarias con guardia 24hs y servicios de internación de urgencia en Pilar
const CLINICAS_URGENCIA: LugarMascotas[] = PUNTOS_VETERINARIOS_PILAR.filter(
  (v) => v.guardia24hs || v.servicios?.some((s) => s.toLowerCase().includes('urgencia') || s.toLowerCase().includes('internación') || s.toLowerCase().includes('guardia'))
);

export default function SosScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { pets } = usePets();

  const handleCallNumber = (phone: string, label: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    const cleaned = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('Error', `No se pudo iniciar la llamada a ${label} (${phone}).`);
    });
  };

  const handleCallEmergency = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch {}

    Alert.alert(
      '🚨 Llamada de Urgencia Veterinaria',
      'Selecciona el centro médico al que deseas llamar inmediatamente:',
      [
        {
          text: `🏥 Guardia 24hs San Roque (${GUARDIA_PRINCIPAL.telefono})`,
          onPress: () => handleCallNumber(GUARDIA_PRINCIPAL.telefono, 'Hospital San Roque (Guardia 24hs)'),
        },
        {
          text: '🩺 Planeta Veterinario (011-6276-0994)',
          onPress: () => handleCallNumber('011-6276-0994', 'Planeta Veterinario'),
        },
        {
          text: '🚑 Emergencias Generales (911)',
          style: 'destructive',
          onPress: () => handleCallNumber('911', 'Línea 911'),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleGoToMapGuardia = (clinicId: string = 'vet-2') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    router.push({
      pathname: '/(tabs)/mapa',
      params: {
        filter: 'guardia',
        focusId: clinicId,
        zoomGuardia: 'true',
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con Alerta de Emergencia */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeSosHeader}>
              <View style={styles.sosPulseDot} />
              <Text style={styles.badgeSosHeaderText}>CENTRO DE EMERGENCIAS</Text>
            </View>
            <Text style={[styles.titulo, isDark && styles.textDark]}>Atención SOS 🐾</Text>
            <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>
              Asistencia inmediata y guardia veterinaria activa
            </Text>
          </View>
          <ThemeToggleButton />
        </View>

        {/* BOTÓN PRINCIPAL: LLAMADA DE URGENCIA */}
        <Pressable
          style={({ pressed }) => [
            styles.heroSosButton,
            pressed && styles.heroSosButtonPressed,
          ]}
          onPress={handleCallEmergency}
          accessibilityRole="button"
          accessibilityLabel="Llamar a línea de emergencias veterinarias"
        >
          <View style={styles.heroSosIconWrapper}>
            <SosIcon size={34} focused variant="custom" />
          </View>

          <View style={styles.heroSosContent}>
            <Text style={styles.heroSosTitle}>LLAMAR A URGENCIAS</Text>
            <Text style={styles.heroSosSubtitle}>
              Guardia 24hs Pilar ({GUARDIA_PRINCIPAL.telefono}) • Toca para discar
            </Text>
          </View>

          <Ionicons name="call" size={26} color="#ffffff" />
        </Pressable>

        {/* ACCESOS RÁPIDOS DE EMERGENCIA */}
        <View style={styles.quickActionsGrid}>
          {/* Clínicas de Guardia: Navega al mapa y hace ZOOM a la guardia 24hs */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              isDark && styles.actionCardDark,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleGoToMapGuardia('vet-2')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#fee2e2' }]}>
              <MaterialCommunityIcons name="hospital-box" size={24} color="#dc2626" />
            </View>
            <Text style={[styles.actionCardTitle, isDark && styles.textDark]}>
              Guardias 24hs
            </Text>
            <Text style={[styles.actionCardDesc, isDark && styles.subtituloDark]}>
              Abrir mapa con Zoom en guardia
            </Text>
          </Pressable>

          {/* Triaje con Asistente IA */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              isDark && styles.actionCardDark,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/chat')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#dbeafe' }]}>
              <MaterialCommunityIcons name="robot" size={24} color="#2563eb" />
            </View>
            <Text style={[styles.actionCardTitle, isDark && styles.textDark]}>
              Triaje Asistente IA
            </Text>
            <Text style={[styles.actionCardDesc, isDark && styles.subtituloDark]}>
              Evalúa síntomas de alarma
            </Text>
          </Pressable>
        </View>

        {/* SECCIÓN DESTACADA: LÍNEAS DIRECTAS DE GUARDIAS Y URGENCIAS */}
        <View style={styles.seccionHeader}>
          <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
            Guardias Veterinarias y Urgencias 🏥
          </Text>
          <Text style={[styles.seccionSubtitulo, isDark && styles.subtituloDark]}>
            Números de contacto directo vinculados a las clínicas del mapa
          </Text>
        </View>

        <View style={styles.clinicasUrgenciaList}>
          {CLINICAS_URGENCIA.map((vet) => (
            <View
              key={vet.id}
              style={[
                styles.clinicEmergencyCard,
                isDark && styles.clinicEmergencyCardDark,
                vet.guardia24hs && styles.clinicEmergencyCardHighlighted,
                isDark && vet.guardia24hs && styles.clinicEmergencyCardHighlightedDark,
              ]}
            >
              <View style={styles.clinicCardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.clinicBadgeRow}>
                    {vet.guardia24hs && (
                      <View style={styles.badgeGuardia}>
                        <View style={styles.sosPulseDot} />
                        <Text style={styles.badgeGuardiaText}>GUARDIA 24 HORAS</Text>
                      </View>
                    )}
                    <View style={[styles.badgeTipo, isDark && styles.badgeTipoDark]}>
                      <Text style={[styles.badgeTipoText, isDark && styles.badgeTipoTextDark]}>
                        {vet.tipo.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.clinicName, isDark && styles.textDark]}>
                    {vet.nombre}
                  </Text>
                  <Text style={[styles.clinicAddress, isDark && styles.subtituloDark]}>
                    📍 {vet.direccion}
                  </Text>
                  <Text style={[styles.clinicHours, isDark && styles.subtituloDark]}>
                    ⏰ {vet.horario}
                  </Text>
                </View>
              </View>

              <View style={styles.clinicActionButtons}>
                {/* Botón de Llamar al Teléfono Real de la Veterinaria */}
                <TouchableOpacity
                  style={styles.btnCallClinic}
                  activeOpacity={0.8}
                  onPress={() => handleCallNumber(vet.telefono, vet.nombre)}
                >
                  <Ionicons name="call" size={16} color="#ffffff" />
                  <Text style={styles.btnCallClinicText}>Llamar ({vet.telefono})</Text>
                </TouchableOpacity>

                {/* Botón de Ver en Mapa y hacer Zoom en esa veterinaria */}
                <TouchableOpacity
                  style={[styles.btnMapClinic, isDark && styles.btnMapClinicDark]}
                  activeOpacity={0.8}
                  onPress={() => handleGoToMapGuardia(vet.id)}
                >
                  <Ionicons name="map-outline" size={16} color={isDark ? '#4ade80' : '#04b639'} />
                  <Text style={[styles.btnMapClinicText, isDark && styles.btnMapClinicTextDark]}>
                    Ver en mapa (Zoom)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {pets.length === 0 ? (
          <View style={[styles.emptyPetsCard, isDark && styles.cardDark]}>
            <Ionicons name="paw-outline" size={32} color={isDark ? '#71717a' : '#9ca3af'} />
            <Text style={[styles.emptyPetsText, isDark && styles.subtituloDark]}>
              No tienes mascotas registradas aún. Registra una mascota para disponer de su historial clínico en urgencias.
            </Text>
            <Pressable
              style={styles.btnAddPet}
              onPress={() => router.push('/(tabs)/mascotas')}
            >
              <Text style={styles.btnAddPetText}>Ir a Mis Mascotas</Text>
            </Pressable>
          </View>
        ) : (
          pets.map((pet) => (
            <View
              key={pet.id}
              style={[styles.petEmergencyCard, isDark && styles.petEmergencyCardDark]}
            >
              <View style={styles.petCardTop}>
                <View style={styles.petAvatarCircle}>
                  <Text style={styles.petAvatarEmoji}>
                    {pet.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.petName, isDark && styles.textDark]}>
                    {pet.nombre}
                  </Text>
                  <Text style={[styles.petBreed, isDark && styles.subtituloDark]}>
                    {pet.especie} • {pet.raza || 'Mestizo'}
                  </Text>
                </View>
                <View style={styles.petWeightBadge}>
                  <Text style={styles.petWeightText}>{pet.peso ? `${pet.peso} kg` : 'Sin peso'}</Text>
                </View>
              </View>

              <View style={styles.petDetailsRow}>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailLabel}>Sexo</Text>
                  <Text style={[styles.petDetailVal, isDark && styles.textDark]}>
                    {pet.sexo || 'No informado'}
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailLabel}>Edad</Text>
                  <Text style={[styles.petDetailVal, isDark && styles.textDark]}>
                    {pet.edad ? `${pet.edad} años` : 'No informada'}
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailLabel}>Tel. Contacto</Text>
                  <Text style={[styles.petDetailVal, isDark && styles.textDark]}>
                    {pet.telefonoContacto || 'No informado'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* GUÍA DE PRIMEROS AUXILIOS VETERINARIOS */}
        <View style={styles.seccionHeader}>
          <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
            Primeros Auxilios Rápidos 🩺
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <Text style={styles.faqTitle}>⚠️ Intoxicación o Envenenamiento</Text>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            No induzcas el vómito sin indicación médica, ya que ciertas sustancias cáusticas queman al subir. Acude urgente con la muestra o envase del tóxico.
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <Text style={styles.faqTitle}>🌡️ Golpe de Calor</Text>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            Traslada a la mascota a la sombra, humedece patas, ingle y cabeza con agua fresca (nunca helada). Ofrécele agua a temperatura ambiente en pequeños sorbos.
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <Text style={styles.faqTitle}>🩸 Hemorragias y Heridas</Text>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            Aplica presión constante y firme con gasas limpias sobre la herida para cortar el sangrado y traslada de inmediato al centro de atención.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  badgeSosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  sosPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  badgeSosHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitulo: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
  },

  // Hero SOS Button
  heroSosButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  heroSosButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  heroSosIconWrapper: {
    backgroundColor: '#ffffff',
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSosContent: {
    flex: 1,
    marginHorizontal: 14,
  },
  heroSosTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroSosSubtitle: {
    fontSize: 12,
    color: '#fee2e2',
    fontWeight: '500',
    marginTop: 2,
  },

  // Grid de acciones rápidas
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },

  // Sección títulos
  seccionHeader: {
    marginTop: 6,
    marginBottom: 12,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  seccionSubtitulo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  // Ficha de mascotas
  petEmergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  petEmergencyCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#3f1c1c',
    borderLeftColor: '#ef4444',
  },
  petCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petAvatarEmoji: {
    fontSize: 22,
  },
  petName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  petBreed: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 1,
  },
  petWeightBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  petWeightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  petDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  petDetailItem: {
    flex: 1,
  },
  petDetailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  petDetailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },

  emptyPetsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyPetsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 18,
  },
  btnAddPet: {
    backgroundColor: '#04b639',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAddPetText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  // FAQs
  faqCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  faqCardDark: {
    backgroundColor: '#18181b',
    borderLeftColor: '#f59e0b',
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 4,
  },
  faqBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  // Lista de clínicas de urgencia
  clinicasUrgenciaList: {
    marginBottom: 20,
    gap: 12,
  },
  clinicEmergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  clinicEmergencyCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  clinicEmergencyCardHighlighted: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    borderLeftWidth: 5,
    borderLeftColor: '#dc2626',
  },
  clinicEmergencyCardHighlightedDark: {
    borderColor: '#7f1d1d',
    backgroundColor: '#1c1315',
    borderLeftColor: '#ef4444',
  },
  clinicCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clinicBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  badgeGuardia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeGuardiaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.4,
  },
  badgeTipo: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTipoDark: {
    backgroundColor: '#27272a',
  },
  badgeTipoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  badgeTipoTextDark: {
    color: '#cbd5e1',
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  clinicHours: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  clinicActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnCallClinic: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  btnCallClinicText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnMapClinic: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  btnMapClinicDark: {
    backgroundColor: '#064e3b26',
    borderColor: '#065f46',
  },
  btnMapClinicText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  btnMapClinicTextDark: {
    color: '#4ade80',
  },
});
