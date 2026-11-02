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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { getPetById, registrarEscaneoRescate, type Pet } from '@/services/petService';
import { useAppTheme } from '@/context/ThemeContext';

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
          setErrorCarga('Error al conectar con la base de datos de Huellapp. Revisa tu conexión.');
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

  // Manejador para solicitar y enviar la geolocalización del rescatista
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
              'No se pudo registrar la ubicación en el servidor. Por favor, comunícate directamente con el dueño por llamada o WhatsApp.'
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
            'No se pudo acceder a tu ubicación GPS. Puedes indicarle tu zona al dueño por llamada o WhatsApp.'
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert(
        'GPS no soportado',
        'Tu navegador no soporta geolocalización automática. Por favor llama al dueño directamente.'
      );
    }
  };

  const handleLlamar = () => {
    if (!pet?.telefonoContacto) {
      Alert.alert('Sin teléfono', 'El dueño no registró un número de teléfono de contacto.');
      return;
    }
    const cleanPhone = pet.telefonoContacto.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de llamadas telefónicas.');
    });
  };

  const handleWhatsApp = () => {
    if (!pet?.telefonoContacto) {
      Alert.alert('Sin teléfono', 'El dueño no registró un número de contacto.');
      return;
    }
    const cleanPhone = pet.telefonoContacto.replace(/[^\d]/g, '');
    const mensaje = encodeURIComponent(
      `¡Hola! Encontré a tu mascota ${pet.nombre || ''} gracias a su chapita inteligente de Huellapp. ¿Podemos coordinar para reunirte con ella?`
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${mensaje}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    });
  };

  if (cargando) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#04b639" />
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
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
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

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera Huellapp */}
        <View style={styles.brandHeader}>
          <View style={styles.brandLogoRow}>
            <Ionicons name="paw" size={24} color="#04b639" />
            <Text style={styles.brandTitle}>Huellapp • Rescate</Text>
          </View>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdText}>{pet.id}</Text>
          </View>
        </View>

        {/* ALERTA DE EXTRAVÍO O FICHA DE CONTACTO */}
        {esExtraviada ? (
          <View style={styles.alertLostBanner}>
            <View style={styles.alertPulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertLostTitle}>🚨 ¡MASCOTA EXTRAVIADA!</Text>
              <Text style={styles.alertLostText}>
                Su familia la está buscando desesperadamente. Por favor, comunícate con su tutor o comparte tu ubicación abajo.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.noticeBanner, isDark && styles.noticeBannerDark]}>
            <Ionicons name="shield-checkmark" size={22} color="#04b639" />
            <Text style={[styles.noticeText, isDark && styles.subtituloDark]}>
              Identificación Oficial Huellapp. Si has encontrado a este animalito, por favor avísale a su dueño.
            </Text>
          </View>
        )}

        {/* BOTONES PRINCIPALES DE CONTACTO (LO MÁS DESTACADO) */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [styles.btnCall, pressed && styles.btnPressed]}
            onPress={handleLlamar}
          >
            <Ionicons name="call" size={22} color="#ffffff" />
            <View style={styles.btnContent}>
              <Text style={styles.btnTitle}>Llamar al Dueño</Text>
              <Text style={styles.btnSubtitle}>{pet.telefonoContacto || 'Iniciar llamada'}</Text>
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
              <Ionicons name="location" size={22} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.gpsCardTitle, isDark && styles.textDark]}>
                Avisarle al dueño dónde está
              </Text>
              <Text style={[styles.gpsCardSubtitle, isDark && styles.subtituloDark]}>
                Toca para enviar tus coordenadas GPS y que el dueño vea la ubicación en el mapa.
              </Text>
            </View>
          </View>

          {ubicacionEnviada ? (
            <View style={styles.gpsSuccessBox}>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsSuccessTitle}>¡Ubicación enviada con éxito!</Text>
                <Text style={styles.gpsSuccessText}>
                  El dueño ha recibido las coordenadas de rescate en su mapa de Huellapp.
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
                    <Ionicons name="map-outline" size={16} color="#16a34a" />
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
                  <Ionicons name="navigate-circle" size={20} color="#ffffff" />
                  <Text style={styles.btnGpsText}>Compartir mi ubicación con el dueño</Text>
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
              <MaterialIcons name="pets" size={64} color="#04b639" />
            </View>
          )}

          <View style={styles.petCardBody}>
            <View style={styles.petNameRow}>
              <Text style={[styles.petName, isDark && styles.textDark]}>{pet.nombre}</Text>
              <View style={styles.speciesBadge}>
                <Text style={styles.speciesBadgeText}>
                  {pet.especie?.toLowerCase().includes('gato') ? '🐱 Gato' : '🐶 Perro'}
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
                  <Ionicons name="medical" size={16} color="#d97706" />
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
            Huellapp es una plataforma de salud e identificación animal. Este perfil se muestra públicamente para coordinar el rescate seguro de la mascota.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  iconCircleError: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  badgeId: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // Lost banner
  alertLostBanner: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  alertPulse: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fef08a',
  },
  alertLostTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  alertLostText: {
    fontSize: 13,
    color: '#fee2e2',
    marginTop: 4,
    lineHeight: 18,
  },

  // Normal notice banner
  noticeBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  noticeBannerDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  noticeText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Action buttons
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  btnCall: {
    backgroundColor: '#04b639',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnWhatsapp: {
    backgroundColor: '#25d366',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#25d366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  btnContent: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  btnSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },

  // GPS Card
  gpsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  gpsCardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  btnGps: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
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
    fontWeight: '700',
    fontSize: 14,
  },
  gpsSuccessBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  gpsSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  gpsSuccessText: {
    fontSize: 12,
    color: '#166534',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    textDecorationLine: 'underline',
  },

  // Pet card
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
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
    backgroundColor: '#f1f5f9',
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
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  speciesBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  speciesBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  petBreed: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  chipLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
  },
  notesBoxContent: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
