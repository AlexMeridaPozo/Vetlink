import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { SosIcon } from '@/components/SosIcon';

// Teléfono de urgencias por defecto (puede ser 911 o número de guardia local)
const EMERGENCY_PHONE = '911';

export default function SosScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { pets } = usePets();

  const handleCallEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      '🚨 Llamada de Urgencia',
      `¿Deseas iniciar una llamada telefónica inmediata a la línea de emergencias (${EMERGENCY_PHONE})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar ahora',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${EMERGENCY_PHONE}`).catch((err) => {
              Alert.alert('Error', 'No se pudo abrir la aplicación de llamadas telefónicas.');
            });
          },
        },
      ]
    );
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
          accessibilityLabel="Llamar a línea de emergencias"
        >
          <View style={styles.heroSosIconWrapper}>
            <SosIcon size={34} focused variant="custom" />
          </View>

          <View style={styles.heroSosContent}>
            <Text style={styles.heroSosTitle}>LLAMAR A URGENCIAS</Text>
            <Text style={styles.heroSosSubtitle}>
              Línea directa ({EMERGENCY_PHONE}) • Guardias de turno
            </Text>
          </View>

          <Ionicons name="call" size={26} color="#ffffff" />
        </Pressable>

        {/* ACCESOS RÁPIDOS DE EMERGENCIA */}
        <View style={styles.quickActionsGrid}>
          {/* Clínicas de Guardia */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              isDark && styles.actionCardDark,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/(tabs)/mapa')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#fee2e2' }]}>
              <MaterialCommunityIcons name="hospital-box" size={24} color="#dc2626" />
            </View>
            <Text style={[styles.actionCardTitle, isDark && styles.textDark]}>
              Guardias 24hs
            </Text>
            <Text style={[styles.actionCardDesc, isDark && styles.subtituloDark]}>
              Clínicas con atención nocturna
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

        {/* Ficha Médica de Emergencia de Mascotas */}
        <View style={styles.seccionHeader}>
          <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
            Ficha de Urgencia de tus Mascotas
          </Text>
          <Text style={[styles.seccionSubtitulo, isDark && styles.subtituloDark]}>
            Datos vitales para mostrar al veterinario de guardia
          </Text>
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
});
