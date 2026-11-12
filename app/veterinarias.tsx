import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import {
  LugarMascotas,
  PUNTOS_VETERINARIOS_PILAR,
  calculateDistanceKm,
  formatDistance,
} from '@/constants/veterinarias';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { buscarVeterinariasCercanas } from '@/services/veterinariasService';

export default function VeterinariasScreen() {
  const { isDark } = useAppTheme();

  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lugares, setLugares] = useState<LugarMascotas[]>(PUNTOS_VETERINARIOS_PILAR);

  const solicitarUbicacionYBuscar = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const data = await buscarVeterinariasCercanas().catch(() => PUNTOS_VETERINARIOS_PILAR);
      setLugares(data);

      const perm = await Location.requestForegroundPermissionsAsync();
      setCanAskAgain(perm.canAskAgain ?? true);

      if (perm.status !== 'granted') {
        setPermissionStatus('denied');
        setLoadingLocation(false);
        return;
      }

      setPermissionStatus('granted');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      console.warn('[VeterinariasScreen] Error obteniendo ubicación:', err);
      setPermissionStatus('denied');
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    solicitarUbicacionYBuscar();
  }, [solicitarUbicacionYBuscar]);

  // Calcular la veterinaria más cercana (clínica, hospital o centro veterinario, sin importar si es de HuellApp o externa)
  const veterinariaMasCercana = useMemo(() => {
    if (!userCoords) return null;

    const soloVeterinarias = lugares.filter(
      (item) => item.tipo === 'clinica' || item.tipo === 'hospital' || item.tipo === 'publico'
    );
    const listaBase = soloVeterinarias.length > 0 ? soloVeterinarias : lugares;

    let masCercana: (LugarMascotas & { distanceKm: number; distanceText: string }) | null = null;

    for (const vet of listaBase) {
      const lat = vet.lat ?? vet.coordenadas?.latitude;
      const lng = vet.lng ?? vet.coordenadas?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;

      const distKm = calculateDistanceKm(userCoords.latitude, userCoords.longitude, lat, lng);
      if (!masCercana || distKm < masCercana.distanceKm) {
        masCercana = {
          ...vet,
          distanceKm: distKm,
          distanceText: formatDistance(distKm),
        };
      }
    }

    return masCercana;
  }, [lugares, userCoords]);

  const handleIrAlMapa = () => {
    if (!veterinariaMasCercana) return;
    router.push({
      pathname: '/(tabs)/mapa',
      params: {
        focusId: veterinariaMasCercana.id,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <ThemeToggleButton />
      </View>

      <View style={styles.centerContent}>
        {loadingLocation || permissionStatus === 'checking' ? (
          <View style={[styles.panel, isDark && styles.panelDark]}>
            <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
              <ActivityIndicator size="large" color={Palette.greenDeep} />
            </View>
            <Text style={[styles.panelTitle, isDark && styles.textDark]}>
              Buscando la veterinaria más cercana...
            </Text>
            <Text style={[styles.panelSubtitle, isDark && styles.subtituloDark]}>
              Obteniendo tu ubicación actual para calcular la distancia exacta.
            </Text>
          </View>
        ) : permissionStatus !== 'granted' || !userCoords ? (
          <View style={[styles.panel, isDark && styles.panelDark]}>
            <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
              <Ionicons name="location-outline" size={40} color={Palette.greenDeep} />
            </View>
            <Text style={[styles.panelTitle, isDark && styles.textDark]}>
              Ubicación requerida
            </Text>
            <Text style={[styles.panelSubtitle, isDark && styles.subtituloDark]}>
              Para mostrarte la veterinaria más cercana a vos necesitamos permiso para acceder a tu ubicación.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                if (!canAskAgain) {
                  Linking.openSettings().catch(() => {});
                } else {
                  solicitarUbicacionYBuscar();
                }
              }}
            >
              <Ionicons name="navigate-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Permitir acceso a mi ubicación</Text>
            </TouchableOpacity>
          </View>
        ) : veterinariaMasCercana ? (
          <TouchableOpacity
            style={[styles.panel, styles.closestCard, isDark && styles.panelDark]}
            activeOpacity={0.88}
            onPress={handleIrAlMapa}
            accessibilityRole="button"
            accessibilityLabel={`Veterinaria más cercana: ${veterinariaMasCercana.nombre}. Toca para ver en el mapa.`}
          >
            <View style={styles.badgesTopRow}>
              <View style={styles.badgeClosest}>
                <Ionicons name="location" size={13} color="#ffffff" />
                <Text style={styles.badgeClosestText}>
                  Veterinaria más cercana • a {veterinariaMasCercana.distanceText}
                </Text>
              </View>

              <View
                style={[
                  styles.badgeNetwork,
                  (veterinariaMasCercana.enHuellapp ?? veterinariaMasCercana.enVetlink)
                    ? styles.badgeHuellapp
                    : styles.badgeExterna,
                ]}
              >
                <Text
                  style={[
                    styles.badgeNetworkText,
                    (veterinariaMasCercana.enHuellapp ?? veterinariaMasCercana.enVetlink)
                      ? styles.badgeHuellappText
                      : styles.badgeExternaText,
                  ]}
                >
                  {(veterinariaMasCercana.enHuellapp ?? veterinariaMasCercana.enVetlink)
                    ? 'Red HuellApp'
                    : 'Externa'}
                </Text>
              </View>
            </View>

            <View style={[styles.iconCircleSmall, isDark && styles.iconCircleDark]}>
              <Ionicons
                name={veterinariaMasCercana.guardia24hs ? 'medkit' : 'medkit-outline'}
                size={32}
                color={veterinariaMasCercana.guardia24hs ? Palette.redEmergency : Palette.greenDeep}
              />
            </View>

            <Text style={[styles.clinicName, isDark && styles.textDark]}>
              {veterinariaMasCercana.nombre}
            </Text>

            {veterinariaMasCercana.guardia24hs && (
              <View style={styles.guardiaTag}>
                <Ionicons name="time-outline" size={13} color={Palette.redEmergency} />
                <Text style={styles.guardiaTagText}>Guardia 24 Horas</Text>
              </View>
            )}

            <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
              <View style={styles.infoRow}>
                <Ionicons name="pin-outline" size={16} color={Palette.greenDeep} />
                <Text style={[styles.infoText, isDark && styles.textDark]}>
                  {veterinariaMasCercana.direccion}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={Palette.greenDeep} />
                <Text style={[styles.infoText, isDark && styles.subtituloDark]}>
                  {veterinariaMasCercana.horario}
                </Text>
              </View>

              {veterinariaMasCercana.telefono ? (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color={Palette.greenDeep} />
                  <Text style={[styles.infoText, isDark && styles.subtituloDark]}>
                    {veterinariaMasCercana.telefono}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.ctaMapButton}>
              <Ionicons name="compass-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.ctaMapButtonText}>Ver en Mapa Pilar</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    alignItems: 'center',
    ...Shadows.md,
  },
  panelDark: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(8, 122, 67, 0.45)',
  },
  closestCard: {
    paddingVertical: 26,
  },
  badgesTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badgeClosest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  badgeClosestText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  badgeNetwork: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeHuellapp: {
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.greenBorder,
  },
  badgeExterna: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  badgeNetworkText: {
    fontSize: 11,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  badgeHuellappText: {
    color: Palette.greenDeep,
  },
  badgeExternaText: {
    color: '#475569',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  iconCircleSmall: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  iconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  panelTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  panelSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clinicName: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  guardiaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  guardiaTagText: {
    color: Palette.redEmergency,
    fontSize: 12,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  infoBox: {
    width: '100%',
    backgroundColor: Palette.backgroundLight,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 8,
    marginTop: 4,
    marginBottom: 18,
  },
  infoBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radius.md,
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  ctaMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radius.md,
    width: '100%',
  },
  ctaMapButtonText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    fontWeight: '700',
  },
  textDark: {
    color: '#f4f4f5',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
