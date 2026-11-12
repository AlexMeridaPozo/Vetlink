import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { getPetById, registrarEscaneoRescate, type Pet } from '@/services/petService';
import { useAppTheme } from '@/context/ThemeContext';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

export default function FichaRescatePublicaScreen() {
  const params = useLocalSearchParams<{ id?: string; petId?: string }>();
  const petId = (params.id || params.petId || '').trim().toUpperCase();

  const { isDark } = useAppTheme();
  const [pet, setPet] = useState<Pet | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de geolocalización de rescate
  const [enviandoUbicacion, setEnviandoUbicacion] = useState<boolean>(false);
  const [ubicacionEnviada, setUbicacionEnviada] = useState<boolean>(false);
  const [coordsEnviadas, setCoordsEnviadas] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function cargarMascota() {
      if (!petId) {
        setErrorCarga('No se especificó un identificador de mascota válido.');
        setCargando(false);
        return;
      }

      setCargando(true);
      setErrorCarga(null);
      try {
        const data = await getPetById(petId);
        if (isMounted) {
          if (data) {
            setPet(data);
          } else {
            setErrorCarga(`No se encontró ninguna mascota registrada con el código "${petId}".`);
          }
        }
      } catch (err) {
        console.error('[FichaRescate] Error al cargar mascota:', err);
        if (isMounted) {
          setErrorCarga('Error al conectar con la base de datos de HuellaApp. Revisa tu conexión.');
        }
      } finally {
        if (isMounted) setCargando(false);
      }
    }

    cargarMascota();

    return () => {
      isMounted = false;
    };
  }, [petId]);

  const handleEnviarUbicacion = () => {
    if (!petId) return;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setEnviandoUbicacion(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const precision = position.coords.accuracy;

          try {
            await registrarEscaneoRescate(petId, { lat, lng, precision });
            setUbicacionEnviada(true);
            setCoordsEnviadas({ lat, lng });
          } catch (err) {
            console.error('[FichaRescate] Error al guardar escaneo:', err);
            Alert.alert(
              'Aviso',
              'No se pudo registrar la ubicación en el servidor. Por favor, comunícate directamente con el tutor por llamada o WhatsApp.'
            );
          } finally {
            setEnviandoUbicacion(false);
          }
        },
        (error) => {
          setEnviandoUbicacion(false);
          console.warn('[FichaRescate] Error de geolocalización:', error);
          Alert.alert(
            'Ubicación no disponible',
            'No se pudo acceder a tu ubicación GPS. Puedes indicarle tu zona al tutor por llamada o WhatsApp.'
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert(
        'GPS no disponible',
        'Tu navegador no soporta geolocalización automática. Por favor llama al tutor directamente.'
      );
    }
  };

  const handleLlamar = () => {
    if (!pet?.telefonoContacto) {
      Alert.alert('Sin teléfono', 'El tutor no registró un número de teléfono de contacto.');
      return;
    }
    const cleanPhone = pet.telefonoContacto.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de llamadas telefónicas.');
    });
  };

  const handleWhatsApp = () => {
    if (!pet?.telefonoContacto) {
      Alert.alert('Sin teléfono', 'El tutor no registró un número de contacto.');
      return;
    }
    const cleanPhone = pet.telefonoContacto.replace(/[^\d]/g, '');
    const mensaje = encodeURIComponent(
      `¡Hola! Encontré a tu mascota ${pet.nombre || ''} gracias a su chapita inteligente de HuellaApp. ¿Podemos coordinar para reunirte con ella?`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${mensaje}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    });
  };

  if (cargando) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Palette.greenPrimary} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            Consultando identificación de la mascota...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorCarga || !pet) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centerBox}>
          <View style={styles.iconCircleError}>
            <Ionicons name="alert-circle-outline" size={44} color={Palette.redEmergency} />
          </View>
          <Text style={[styles.errorTitle, isDark && styles.textDark]}>Ficha No Encontrada</Text>
          <Text style={[styles.errorSubtitle, isDark && styles.subtituloDark]}>
            {errorCarga || 'No se pudo recuperar la información de la mascota.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const esExtraviada = pet.extraviada === true;
  const isGato = pet.especie?.toLowerCase().includes('gato');

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera HuellaApp */}
        <View style={styles.brandHeader}>
          <View style={styles.brandLogoRow}>
            <View style={styles.brandIconCircle}>
              <MaterialCommunityIcons name="paw" size={18} color={Palette.greenDeep} />
            </View>
            <Text style={styles.brandTitle}>
              <Text style={{ color: Palette.greenDeep }}>Huell</Text>
              <Text style={{ color: Palette.textPrimary }}>App</Text>
              <Text style={styles.brandSubtitle}> • Rescate</Text>
            </Text>
          </View>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdText}>{pet.id}</Text>
          </View>
        </View>

        {/* ALERTA DE EXTRAVÍO O FICHA DE CONTACTO */}
        {esExtraviada ? (
          <View style={styles.alertLostBanner}>
            <Ionicons name="warning-outline" size={26} color="#ffffff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertLostTitle}>¡MASCOTA EXTRAVIADA!</Text>
              <Text style={styles.alertLostText}>
                Su familia la está buscando. Por favor, comunícate con su tutor o comparte tu ubicación GPS abajo.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.noticeBanner, isDark && styles.noticeBannerDark]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Palette.greenDeep} />
            <Text style={[styles.noticeText, isDark && styles.subtituloDark]}>
              Identificación Oficial HuellaApp. Si has encontrado a este animalito, por favor avísale a su tutor.
            </Text>
          </View>
        )}

        {/* BOTONES PRINCIPALES DE CONTACTO */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [styles.btnCall, pressed && styles.btnPressed]}
            onPress={handleLlamar}
          >
            <Ionicons name="call-outline" size={22} color="#ffffff" />
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Llamar al Tutor</Text>
              <Text style={styles.btnSubtitle}>{pet.telefonoContacto || 'Iniciar llamada telefónica'}</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnWhatsapp, pressed && styles.btnPressed]}
            onPress={handleWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#ffffff" />
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Enviar WhatsApp</Text>
              <Text style={styles.btnSubtitle}>Mensaje directo al tutor</Text>
            </View>
          </Pressable>
        </View>

        {/* BOTÓN DE GEOLOCALIZACIÓN: ENVIAR UBICACIÓN ACTUAL */}
        <View style={[styles.gpsCard, isDark && styles.gpsCardDark]}>
          <View style={styles.gpsCardHeader}>
            <View style={styles.gpsIconCircle}>
              <Ionicons name="location-outline" size={20} color="#0284c7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.gpsCardTitle, isDark && styles.textDark]}>
                Avisarle al tutor dónde está
              </Text>
              <Text style={[styles.gpsCardSubtitle, isDark && styles.subtituloDark]}>
                Envía tus coordenadas GPS para que el tutor vea la ubicación exacta en el mapa de rescate.
              </Text>
            </View>
          </View>

          {ubicacionEnviada ? (
            <View style={styles.gpsSuccessBox}>
              <Ionicons name="checkmark-circle-outline" size={22} color={Palette.greenDeep} />
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsSuccessTitle}>¡Ubicación enviada con éxito!</Text>
                <Text style={styles.gpsSuccessText}>
                  El tutor ha recibido las coordenadas de rescate en su mapa de HuellaApp.
                </Text>
                {coordsEnviadas && (
                  <Pressable
                    style={styles.btnVerMapa}
                    onPress={() =>
                      Linking.openURL(
                        `https://maps.google.com/?q=${coordsEnviadas.lat},${coordsEnviadas.lng}`
                      )
                    }
                  >
                    <Ionicons name="map-outline" size={15} color={Palette.greenDeep} />
                    <Text style={styles.btnVerMapaText}>Ver en Google Maps</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.btnGps,
                enviandoUbicacion && styles.btnGpsDisabled,
                pressed && styles.btnPressed,
              ]}
              onPress={handleEnviarUbicacion}
              disabled={enviandoUbicacion}
            >
              {enviandoUbicacion ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.btnGpsText}>Obteniendo GPS...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="navigate-outline" size={18} color="#ffffff" />
                  <Text style={styles.btnGpsText}>Compartir mi ubicación con el tutor</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* TARJETA CON DATOS DE LA MASCOTA */}
        <View style={[styles.petCard, isDark && styles.petCardDark]}>
          {pet.fotoUrl ? (
            <Image source={{ uri: pet.fotoUrl }} style={styles.petImage} contentFit="cover" />
          ) : (
            <View style={[styles.imageFallback, isDark && styles.imageFallbackDark]}>
              <MaterialCommunityIcons name={isGato ? 'cat' : 'dog'} size={64} color={Palette.greenDeep} />
            </View>
          )}

          <View style={styles.petCardBody}>
            <View style={styles.petNameRow}>
              <Text style={[styles.petName, isDark && styles.textDark]}>{pet.nombre}</Text>
              <View style={styles.speciesBadge}>
                <MaterialCommunityIcons
                  name={isGato ? 'cat' : 'dog'}
                  size={14}
                  color={Palette.greenDeep}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.speciesBadgeText}>
                  {pet.especie || 'Mascota'}
                </Text>
              </View>
            </View>

            <Text style={[styles.petBreed, isDark && styles.subtituloDark]}>
              {pet.raza || 'Mestizo'} {pet.sexo ? `• ${pet.sexo}` : ''}
            </Text>

            {/* Ficha técnica rápida */}
            <View style={styles.chipsRow}>
              {pet.peso ? (
                <View style={[styles.chip, isDark && styles.chipDark]}>
                  <Text style={styles.chipLabel}>Peso</Text>
                  <Text style={[styles.chipValue, isDark && styles.textDark]}>{pet.peso} kg</Text>
                </View>
              ) : null}

              {pet.edad ? (
                <View style={[styles.chip, isDark && styles.chipDark]}>
                  <Text style={styles.chipLabel}>Edad aprox.</Text>
                  <Text style={[styles.chipValue, isDark && styles.textDark]}>{pet.edad} años</Text>
                </View>
              ) : null}

              {pet.propietario ? (
                <View style={[styles.chip, isDark && styles.chipDark]}>
                  <Text style={styles.chipLabel}>Tutor</Text>
                  <Text style={[styles.chipValue, isDark && styles.textDark]}>{pet.propietario}</Text>
                </View>
              ) : null}
            </View>

            {/* Notas Médicas / Comportamiento */}
            {pet.descripcion ? (
              <View style={[styles.notesBox, isDark && styles.notesBoxDark]}>
                <View style={styles.notesBoxHeader}>
                  <Ionicons name="medical-outline" size={16} color="#b45309" />
                  <Text style={styles.notesBoxTitle}>Notas de Salud y Cuidados:</Text>
                </View>
                <Text style={[styles.notesBoxContent, isDark && styles.subtituloDark]}>
                  {pet.descripcion}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Pie informativo */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.subtituloDark]}>
            HuellaApp es una plataforma de salud e identificación animal. Este perfil se muestra públicamente para coordinar el rescate seguro de la mascota.
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
    padding: 18,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  iconCircleError: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.redSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  textDark: {
    color: '#f4f4f5',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },

  // Brand header
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  badgeId: {
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  badgeIdText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },

  // Lost banner
  alertLostBanner: {
    backgroundColor: Palette.redEmergency,
    borderRadius: Radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
    ...Shadows.md,
  },
  alertLostTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  alertLostText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: '#fee2e2',
    marginTop: 3,
    lineHeight: 18,
  },

  // Normal notice banner
  noticeBanner: {
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  noticeBannerDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.15)',
    borderColor: 'rgba(8, 122, 67, 0.3)',
  },
  noticeText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
    flex: 1,
    lineHeight: 16,
  },

  // Action buttons
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  btnCall: {
    backgroundColor: Palette.greenDeep,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.sm,
  },
  btnWhatsapp: {
    backgroundColor: '#16a34a',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Shadows.sm,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  btnContent: {
    flex: 1,
  },
  btnTitle: {
    fontSize: Typography.size.body,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },

  // GPS Card
  gpsCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  gpsCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  gpsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.cyanLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsCardTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  gpsCardSubtitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  btnGps: {
    backgroundColor: '#0284c7',
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnGpsDisabled: {
    opacity: 0.7,
  },
  btnGpsText: {
    color: '#ffffff',
    fontFamily: Typography.family.bodyBold,
    fontSize: Typography.size.bodySmall,
  },
  gpsSuccessBox: {
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.md,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  gpsSuccessTitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.greenDeep,
  },
  gpsSuccessText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.greenDeep,
    marginTop: 2,
    lineHeight: 16,
  },
  btnVerMapa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  btnVerMapaText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
    textDecorationLine: 'underline',
  },

  // Pet card
  petCard: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 16,
    ...Shadows.sm,
  },
  petCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  petImage: {
    width: '100%',
    height: 220,
  },
  imageFallback: {
    width: '100%',
    height: 180,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackDark: {
    backgroundColor: '#27272a',
  },
  petCardBody: {
    padding: 16,
  },
  petNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  speciesBadge: {
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  speciesBadgeText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  petBreed: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  chipDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  chipLabel: {
    fontSize: Typography.size.tiny,
    color: Palette.textSecondary,
    textTransform: 'uppercase',
    fontFamily: Typography.family.bodyBold,
  },
  chipValue: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginTop: 1,
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  notesBoxDark: {
    backgroundColor: '#2e2413',
    borderColor: '#78350f',
  },
  notesBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  notesBoxTitle: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: '#b45309',
  },
  notesBoxContent: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: '#78350f',
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
