import React, { useState } from 'react';
import {
  Alert,
  Linking,
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
import { usePets, toggleEstadoExtravio } from '@/services/petService';
import { SosIcon } from '@/components/SosIcon';
import { PUNTOS_VETERINARIOS_PILAR, LugarMascotas } from '@/constants/veterinarias';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

// Centro de guardia principal 24hs de Pilar
const GUARDIA_PRINCIPAL = {
  id: 'vet-2',
  nombre: 'Hospital Veterinario San Roque (Guardia 24hs)',
  telefono: '0230-443-5566',
  direccion: 'Av. Tratado del Pilar 280, Pilar',
};

// Veterinarias con guardia 24hs y servicios de internación de urgencia en Pilar
const CLINICAS_URGENCIA: LugarMascotas[] = PUNTOS_VETERINARIOS_PILAR.filter(
  (v) =>
    v.guardia24hs ||
    v.servicios?.some((s) => {
      const lower = s.toLowerCase();
      return (
        lower.includes('urgencia') ||
        lower.includes('internación') ||
        lower.includes('guardia')
      );
    })
);

export default function SosScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { pets } = usePets();
  const [estadoExtravio, setEstadoExtravio] = useState<Record<string, boolean>>({});

  const getExtraviada = (pet: { id: string; extraviada?: boolean }) =>
    estadoExtravio[pet.id] !== undefined ? estadoExtravio[pet.id] : !!pet.extraviada;

  const handleToggleExtravio = (pet: { id: string; nombre: string; extraviada?: boolean }) => {
    const actual = getExtraviada(pet);
    const nuevoEstado = !actual;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      nuevoEstado ? 'Activar Alerta de Extravío' : 'Marcar como En Casa',
      nuevoEstado
        ? `¿Confirmas que ${pet.nombre} se ha extraviado? Cualquier persona que escanee la chapita QR / NFC verá la alerta y podrá enviar su ubicación GPS.`
        : `¿${pet.nombre} ya está a salvo en casa? Se desactivará la alerta de extravío.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: nuevoEstado ? 'Activar Búsqueda' : 'Confirmar En Casa',
          style: nuevoEstado ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await toggleEstadoExtravio(pet.id, nuevoEstado);
              setEstadoExtravio((prev) => ({ ...prev, [pet.id]: nuevoEstado }));
              Alert.alert('Éxito', nuevoEstado ? 'Alerta de extravío activada.' : 'Mascota marcada como a salvo.');
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado en el servidor.');
            }
          },
        },
      ]
    );
  };

  const handleCallVetContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const petsConTelefono = pets.filter((p) => p.telefonoContacto && p.telefonoContacto.trim() !== '');

    if (petsConTelefono.length === 0) {
      Alert.alert(
        'Contacto de Emergencia',
        'No tienes un teléfono de contacto o veterinario asignado en tus mascotas.\n\nPuedes agregarlo editando la ficha de tu mascota en "Mis Mascotas".',
        [
          { text: 'Entendido', style: 'cancel' },
          { text: 'Ir a Mascotas', onPress: () => router.push('/(tabs)/mascotas') },
        ]
      );
      return;
    }

    if (petsConTelefono.length === 1) {
      const pet = petsConTelefono[0];
      Alert.alert(
        'Llamar a Contacto',
        `¿Deseas llamar al teléfono registrado para ${pet.nombre} (${pet.telefonoContacto})?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar',
            onPress: () => {
              Linking.openURL(`tel:${pet.telefonoContacto}`).catch(() => {
                Alert.alert('Error', 'No se pudo iniciar la llamada.');
              });
            },
          },
        ]
      );
      return;
    }

    const opciones = petsConTelefono.map((pet) => ({
      text: `${pet.nombre} (${pet.telefonoContacto})`,
      onPress: () => {
        Linking.openURL(`tel:${pet.telefonoContacto}`).catch(() => {
          Alert.alert('Error', 'No se pudo iniciar la llamada.');
        });
      },
    }));

    Alert.alert(
      'Selecciona el Contacto',
      '¿A qué teléfono de contacto o veterinario deseas llamar?',
      [...opciones, { text: 'Cancelar', style: 'cancel' }]
    );
  };

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
      'Llamada de Urgencia Veterinaria',
      'Selecciona el centro médico al que deseas llamar de inmediato:',
      [
        {
          text: `Guardia 24hs San Roque (${GUARDIA_PRINCIPAL.telefono})`,
          onPress: () => handleCallNumber(GUARDIA_PRINCIPAL.telefono, 'Hospital San Roque (Guardia 24hs)'),
        },
        {
          text: 'Planeta Veterinario (011-6276-0994)',
          onPress: () => handleCallNumber('011-6276-0994', 'Planeta Veterinario'),
        },
        {
          text: 'Línea de Emergencias 911',
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
            <View style={[styles.badgeSosHeader, isDark && styles.badgeSosHeaderDark]}>
              <View style={styles.sosPulseDot} />
              <Text style={styles.badgeSosHeaderText}>CENTRO DE EMERGENCIAS</Text>
            </View>
            <Text style={[styles.titulo, isDark && styles.textDark]}>Atención SOS</Text>
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
            <SosIcon size={32} focused variant="custom" />
          </View>

          <View style={styles.heroSosContent}>
            <Text style={styles.heroSosTitle}>LLAMAR A URGENCIAS</Text>
            <Text style={styles.heroSosSubtitle}>
              Guardia 24hs Pilar ({GUARDIA_PRINCIPAL.telefono}) • Toca para discar
            </Text>
          </View>

          <Ionicons name="call-outline" size={24} color="#ffffff" />
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
            onPress={() => handleGoToMapGuardia('vet-2')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Palette.redSoft }]}>
              <MaterialCommunityIcons name="hospital-box-outline" size={24} color={Palette.redEmergency} />
            </View>
            <Text style={[styles.actionCardTitle, isDark && styles.textDark]}>
              Guardias 24hs
            </Text>
            <Text style={[styles.actionCardDesc, isDark && styles.subtituloDark]}>
              Abrir mapa con Zoom en guardia
            </Text>
          </Pressable>

          {/* Contacto Veterinario */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              isDark && styles.actionCardDark,
              pressed && styles.cardPressed,
            ]}
            onPress={handleCallVetContact}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Palette.greenSoft }]}>
              <MaterialCommunityIcons name="phone-outgoing-outline" size={24} color={Palette.greenDeep} />
            </View>
            <Text style={[styles.actionCardTitle, isDark && styles.textDark]}>
              Veterinario SOS
            </Text>
            <Text style={[styles.actionCardDesc, isDark && styles.subtituloDark]}>
              Llamada directa al doctor
            </Text>
          </Pressable>
        </View>

        {/* SECCIÓN DESTACADA: LÍNEAS DIRECTAS DE GUARDIAS Y URGENCIAS */}
        <View style={styles.seccionHeader}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="hospital-building" size={20} color={Palette.redEmergency} />
            <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
              Guardias y Urgencias
            </Text>
          </View>
          <Text style={[styles.seccionSubtitulo, isDark && styles.subtituloDark]}>
            Centros médicos con atención veterinaria permanente
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
                    {(vet.enHuellapp ?? vet.enVetlink) ? (
                      <View style={styles.badgeHuellappOn}>
                        <Ionicons name="checkmark-circle-outline" size={12} color={Palette.greenDeep} />
                        <Text style={styles.badgeHuellappOnText}>RED HUELLAPP</Text>
                      </View>
                    ) : (
                      <View style={[styles.badgeHuellappOff, isDark && styles.badgeHuellappOffDark]}>
                        <Text style={[styles.badgeHuellappOffText, isDark && styles.subtituloDark]}>EXTERNA</Text>
                      </View>
                    )}
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
                  <View style={styles.clinicMetaRow}>
                    <Ionicons name="location-outline" size={14} color={Palette.textMuted} />
                    <Text style={[styles.clinicAddress, isDark && styles.subtituloDark]}>
                      {vet.direccion}
                    </Text>
                  </View>
                  <View style={styles.clinicMetaRow}>
                    <Ionicons name="time-outline" size={14} color={Palette.greenDeep} />
                    <Text style={[styles.clinicHours, isDark && styles.clinicHoursDark]}>
                      {vet.horario}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.clinicActionButtons}>
                {/* Botón de Llamar al Teléfono Real */}
                <TouchableOpacity
                  style={styles.btnCallClinic}
                  activeOpacity={0.8}
                  onPress={() => handleCallNumber(vet.telefono, vet.nombre)}
                >
                  <Ionicons name="call-outline" size={15} color="#ffffff" />
                  <Text style={styles.btnCallClinicText}>Llamar ({vet.telefono})</Text>
                </TouchableOpacity>

                {/* Botón de Ver en Mapa con Zoom */}
                <TouchableOpacity
                  style={[styles.btnMapClinic, isDark && styles.btnMapClinicDark]}
                  activeOpacity={0.8}
                  onPress={() => handleGoToMapGuardia(vet.id)}
                >
                  <Ionicons name="map-outline" size={15} color={Palette.greenDeep} />
                  <Text style={[styles.btnMapClinicText, isDark && styles.btnMapClinicTextDark]}>
                    Ver en mapa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* SECCIÓN: ESTADO DE EXTRAVÍO POR MASCOTA */}
        <View style={styles.seccionHeader}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="search-outline" size={20} color={Palette.greenDeep} />
            <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
              Estado de Extravío
            </Text>
          </View>
          <Text style={[styles.seccionSubtitulo, isDark && styles.subtituloDark]}>
            Activa la alerta para que quien escanee la chapita pueda enviarte su ubicación
          </Text>
        </View>

        {pets.length === 0 ? (
          <View style={[styles.emptyPetsCard, isDark && styles.cardDark]}>
            <Ionicons name="paw-outline" size={32} color={Palette.textMuted} />
            <Text style={[styles.emptyPetsText, isDark && styles.subtituloDark]}>
              No tienes mascotas registradas aún. Registra una mascota para acceder a su ficha clínica y control de extravío.
            </Text>
            <Pressable
              style={styles.btnAddPet}
              onPress={() => router.push('/(tabs)/mascotas')}
            >
              <Text style={styles.btnAddPetText}>Ir a Mis Mascotas</Text>
            </Pressable>
          </View>
        ) : (
          pets.map((pet) => {
            const extraviada = getExtraviada(pet);
            const isGato = pet.especie?.toLowerCase().includes('gato');
            return (
              <View
                key={`extravio-${pet.id}`}
                style={[
                  styles.extravioCard,
                  isDark && styles.extravioCardDark,
                  extraviada && styles.extravioCardActive,
                ]}
              >
                <View style={styles.extravioCardLeft}>
                  <View
                    style={[
                      styles.petAvatarCircle,
                      extraviada ? { backgroundColor: Palette.redSoft } : { backgroundColor: Palette.greenSoft },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isGato ? 'cat' : 'dog'}
                      size={22}
                      color={extraviada ? Palette.redEmergency : Palette.greenDeep}
                    />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.petName, isDark && styles.textDark]}>{pet.nombre}</Text>
                    <Text style={[styles.petBreed, isDark && styles.subtituloDark]}>
                      {extraviada ? 'Alerta activa — en búsqueda' : 'En casa — protegido'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.btnToggleExtravio,
                    extraviada ? styles.btnExtraviadaActive : styles.btnExtraviadaInactive,
                  ]}
                  onPress={() => handleToggleExtravio(pet)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={extraviada ? 'alert-circle-outline' : 'shield-checkmark-outline'}
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.btnToggleExtravioText}>
                    {extraviada ? 'Extraviada' : 'En Casa'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* GUÍA DE PRIMEROS AUXILIOS VETERINARIOS */}
        <View style={styles.seccionHeader}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="medical-bag" size={20} color={Palette.greenDeep} />
            <Text style={[styles.seccionTitulo, isDark && styles.textDark]}>
              Primeros Auxilios Rápidos
            </Text>
          </View>
          <Text style={[styles.seccionSubtitulo, isDark && styles.subtituloDark]}>
            Instrucciones clave mientras te trasladas a la guardia
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <View style={styles.faqHeaderRow}>
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={styles.faqTitle}>Intoxicación o Envenenamiento</Text>
          </View>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            No induzcas el vómito sin indicación veterinaria, ya que sustancias cáusticas queman el tracto al subir. Acude urgente con la muestra o envase del tóxico.
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <View style={styles.faqHeaderRow}>
            <Ionicons name="sunny-outline" size={18} color="#D97706" />
            <Text style={styles.faqTitle}>Golpe de Calor</Text>
          </View>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            Traslada a la mascota a la sombra, humedece patas, ingle y cabeza con agua fresca (nunca helada). Ofrécele agua a temperatura ambiente en pequeños sorbos.
          </Text>
        </View>

        <View style={[styles.faqCard, isDark && styles.faqCardDark]}>
          <View style={styles.faqHeaderRow}>
            <Ionicons name="fitness-outline" size={18} color="#D97706" />
            <Text style={styles.faqTitle}>Hemorragias y Heridas</Text>
          </View>
          <Text style={[styles.faqBody, isDark && styles.subtituloDark]}>
            Aplica presión constante y firme con gasas limpias sobre la herida para contener el sangrado y traslada de inmediato al centro de atención.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
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
    backgroundColor: Palette.redSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  badgeSosHeaderDark: {
    backgroundColor: 'rgba(217, 74, 74, 0.15)',
    borderColor: 'rgba(217, 74, 74, 0.3)',
  },
  sosPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.redEmergency,
  },
  badgeSosHeaderText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.redEmergency,
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 26,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  subtitulo: {
    color: Palette.textSecondary,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
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
    backgroundColor: Palette.redEmergency,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    ...Shadows.md,
  },
  heroSosButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  heroSosIconWrapper: {
    backgroundColor: '#ffffff',
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSosContent: {
    flex: 1,
    marginHorizontal: 14,
  },
  heroSosTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroSosSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: '#fee2e2',
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
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  actionCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    lineHeight: 16,
  },

  // Sección títulos
  seccionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seccionTitulo: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  seccionSubtitulo: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
  },

  // Clínicas de Urgencia
  clinicasUrgenciaList: {
    marginBottom: 20,
    gap: 12,
  },
  clinicEmergencyCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  clinicEmergencyCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  clinicEmergencyCardHighlighted: {
    borderColor: Palette.redBorder,
    backgroundColor: Palette.redSoft,
    borderLeftWidth: 4,
    borderLeftColor: Palette.redEmergency,
  },
  clinicEmergencyCardHighlightedDark: {
    borderColor: 'rgba(217, 74, 74, 0.4)',
    backgroundColor: 'rgba(217, 74, 74, 0.08)',
    borderLeftColor: Palette.redEmergency,
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
  badgeHuellappOn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  badgeHuellappOnText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.greenDeep,
    letterSpacing: 0.3,
  },
  badgeHuellappOff: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  badgeHuellappOffDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  badgeHuellappOffText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textMuted,
    letterSpacing: 0.3,
  },
  badgeGuardia: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.redSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.redBorder,
  },
  badgeGuardiaText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.redEmergency,
    letterSpacing: 0.4,
  },
  badgeTipo: {
    backgroundColor: Palette.cyanLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeTipoDark: {
    backgroundColor: '#27272a',
  },
  badgeTipoText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textSecondary,
  },
  badgeTipoTextDark: {
    color: '#cbd5e1',
  },
  clinicName: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    flex: 1,
  },
  clinicHours: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  clinicHoursDark: {
    color: Palette.greenPrimary,
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
    backgroundColor: Palette.redEmergency,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  btnCallClinicText: {
    color: '#ffffff',
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
  btnMapClinic: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    gap: 4,
  },
  btnMapClinicDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: 'rgba(8, 122, 67, 0.4)',
  },
  btnMapClinicText: {
    color: Palette.greenDeep,
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
  },
  btnMapClinicTextDark: {
    color: '#86efac',
  },

  // Empty state
  emptyPetsCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyPetsText: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
    lineHeight: 18,
  },
  btnAddPet: {
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  btnAddPetText: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.bodySmall,
  },

  // Extravío Cards
  extravioCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  extravioCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  extravioCardActive: {
    borderColor: Palette.redBorder,
    borderLeftWidth: 4,
    borderLeftColor: Palette.redEmergency,
    backgroundColor: Palette.redSoft,
  },
  extravioCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  petAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  petBreed: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  btnToggleExtravio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  btnExtraviadaActive: {
    backgroundColor: Palette.redEmergency,
  },
  btnExtraviadaInactive: {
    backgroundColor: Palette.greenDeep,
  },
  btnToggleExtravioText: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.caption,
  },

  // FAQs
  faqCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Palette.peachWarm,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  faqCardDark: {
    backgroundColor: '#18181b',
    borderLeftColor: Palette.peachWarm,
    borderColor: '#27272a',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  faqTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#b45309',
  },
  faqBody: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
});
