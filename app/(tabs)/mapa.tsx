import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { LeafletMapView, LeafletMapViewRef } from '@/components/map/LeafletMapView';
import {
  DEFAULT_COORDINATES,
  LugarMascotas,
  PUNTOS_VETERINARIOS_PILAR,
  TipoLugarMascota,
  calculateDistanceKm,
  formatDistance,
} from '@/constants/veterinarias';
import { buscarVeterinariasCercanas } from '@/services/veterinariasService';

type FilterType =
  | 'todas'
  | 'guardia'
  | 'clinica'
  | 'hospital'
  | 'petshop'
  | 'publico'
  | 'farmacia';

function getTipoConfig(tipo?: TipoLugarMascota | string) {
  switch (tipo) {
    case 'hospital':
      return {
        label: 'Hospital 24hs',
        shortLabel: 'Hospital',
        icon: 'medkit',
        color: '#e11d48',
        bg: '#ffe4e6',
        bgDark: 'rgba(225, 29, 72, 0.25)',
      };
    case 'publico':
      return {
        label: 'Zoonosis / Público',
        shortLabel: 'Zoonosis',
        icon: 'business',
        color: '#0284c7',
        bg: '#e0f2fe',
        bgDark: 'rgba(2, 132, 199, 0.25)',
      };
    case 'petshop':
      return {
        label: 'Pet Shop',
        shortLabel: 'Pet Shop',
        icon: 'bag-handle',
        color: '#d97706',
        bg: '#fef3c7',
        bgDark: 'rgba(217, 119, 6, 0.25)',
      };
    case 'farmacia':
      return {
        label: 'Farmacia',
        shortLabel: 'Farmacia',
        icon: 'bandage',
        color: '#0f766e',
        bg: '#ccfbf1',
        bgDark: 'rgba(15, 118, 110, 0.25)',
      };
    default:
      return {
        label: 'Clínica',
        shortLabel: 'Clínica',
        icon: 'paw',
        color: '#15803d',
        bg: '#dcfce7',
        bgDark: 'rgba(4, 182, 57, 0.25)',
      };
  }
}

export default function MapaScreen() {
  const { isDark } = useAppTheme();
  const mapRef = useRef<LeafletMapViewRef>(null);

  // Estados de ubicación
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Estados de veterinarias y comercios: inicializa con los 15 lugares de Pilar Centro
  const [veterinarias, setVeterinarias] = useState<LugarMascotas[]>(PUNTOS_VETERINARIOS_PILAR);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todas');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Cargar veterinarias y lugares de Pilar directamente desde el servicio
  const loadVeterinarias = useCallback(async () => {
    try {
      const data = await buscarVeterinariasCercanas();
      setVeterinarias(data);
    } catch (error) {
      console.warn('[MapaScreen] Error al obtener veterinarias:', error);
      setVeterinarias(PUNTOS_VETERINARIOS_PILAR);
    }
  }, []);

  // Solicitar ubicación del usuario (para cálculo de distancias y botón GPS)
  const requestLocation = useCallback(
    async (shouldCenter = false) => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          setHasLocationPermission(true);
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);

          if (shouldCenter) {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            } catch {}
            mapRef.current?.centerOnUser(coords.latitude, coords.longitude);
          }
        } else {
          setHasLocationPermission(false);
        }
      } catch (error) {
        console.warn('[MapaScreen] Error solicitando ubicación:', error);
        setHasLocationPermission(false);
      } finally {
        setIsLoadingLocation(false);
      }
    },
    []
  );

  // Solicitar geolocalización al montar la pantalla
  useEffect(() => {
    let isMounted = true;
    (async () => {
      loadVeterinarias();
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status === 'granted') {
          setHasLocationPermission(true);
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!isMounted) return;

          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
        } else {
          setHasLocationPermission(false);
        }
      } catch (err) {
        console.warn('[MapaScreen] Error al obtener ubicación inicial:', err);
        if (isMounted) {
          setHasLocationPermission(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadVeterinarias]);

  // Filtrado de veterinarias y comercios en tiempo real por nombre, tipo, servicios y guardia
  const filteredVeterinarias = useMemo(() => {
    return veterinarias
      .filter((vet) => {
        // Filtro de texto (nombre, calle, tipo o servicio)
        const query = searchQuery.trim().toLowerCase();
        const matchesText =
          !query ||
          vet.nombre.toLowerCase().includes(query) ||
          vet.direccion.toLowerCase().includes(query) ||
          (vet.tipo && vet.tipo.toLowerCase().includes(query)) ||
          (vet.servicios && vet.servicios.some((s) => s.toLowerCase().includes(query)));

        // Filtro por categoría rápida
        if (!matchesText) return false;
        if (selectedFilter === 'guardia') return vet.guardia24hs;
        if (selectedFilter === 'clinica') return vet.tipo === 'clinica';
        if (selectedFilter === 'hospital') return vet.tipo === 'hospital';
        if (selectedFilter === 'petshop') return vet.tipo === 'petshop';
        if (selectedFilter === 'publico') return vet.tipo === 'publico';
        if (selectedFilter === 'farmacia') return vet.tipo === 'farmacia';
        return true;
      })
      .map((vet) => {
        let distanceText: string | undefined;
        const refLocation = userLocation || DEFAULT_COORDINATES;
        const vetLat = vet.lat ?? vet.coordenadas?.latitude ?? DEFAULT_COORDINATES.latitude;
        const vetLng = vet.lng ?? vet.coordenadas?.longitude ?? DEFAULT_COORDINATES.longitude;
        const distKm = calculateDistanceKm(
          refLocation.latitude,
          refLocation.longitude,
          vetLat,
          vetLng
        );
        distanceText = formatDistance(distKm);

        return { ...vet, distanceText };
      });
  }, [veterinarias, searchQuery, selectedFilter, userLocation]);

  // Veterinaria o lugar seleccionado actualmente
  const selectedClinic = useMemo(() => {
    if (!selectedClinicId) return null;
    const found = veterinarias.find((v) => v.id === selectedClinicId);
    if (!found) return null;

    const refLocation = userLocation || DEFAULT_COORDINATES;
    const vetLat = found.lat ?? found.coordenadas?.latitude ?? DEFAULT_COORDINATES.latitude;
    const vetLng = found.lng ?? found.coordenadas?.longitude ?? DEFAULT_COORDINATES.longitude;
    const dist = calculateDistanceKm(
      refLocation.latitude,
      refLocation.longitude,
      vetLat,
      vetLng
    );
    const distanceText = formatDistance(dist);

    return { ...found, distanceText };
  }, [selectedClinicId, veterinarias, userLocation]);

  // Seleccionar veterinaria y enfocarla en el mapa
  const handleSelectClinic = useCallback((id: string) => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    setSelectedClinicId(id);
    setIsSearchFocused(false);
    mapRef.current?.focusClinic(id);
  }, []);

  // Acciones de contacto
  const handleCall = useCallback((phone: string) => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {});
  }, []);

  const handleDirections = useCallback((lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    Linking.openURL(url).catch(() => {});
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={['top', 'left', 'right']}>
      {/* Header Superior con contador total */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>
            Mapa de Veterinarias
          </Text>
          <View style={styles.subtitleRow}>
            <View style={[styles.liveIndicator, styles.liveIndicatorActive]} />
            <Text style={[styles.headerSubtitle, isDark && styles.textMutedDark]}>
              Pilar Centro &bull; {veterinarias.length} lugares cargados
            </Text>
          </View>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Barra de Búsqueda y Filtros */}
      <View style={[styles.searchSection, isDark && styles.searchSectionDark]}>
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Ionicons
            name="search"
            size={18}
            color={isDark ? '#a1a1aa' : '#64748b'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Buscar por nombre, calle o tipo (ej: petshop)..."
            placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={18}
                color={isDark ? '#a1a1aa' : '#94a3b8'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Chips de filtro rápido por tipo y guardia */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContainer}
          style={styles.chipsRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'todas' && styles.chipActive,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'todas' && styles.chipActiveDark,
            ]}
            onPress={() => setSelectedFilter('todas')}>
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'todas' && styles.chipTextActive,
                isDark && styles.chipTextDark,
              ]}>
              Todos ({veterinarias.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'guardia' && styles.chipActiveRed,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'guardia' && styles.chipActiveRedDark,
            ]}
            onPress={() => setSelectedFilter('guardia')}>
            <View style={styles.emergencyDot} />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'guardia' && styles.chipTextActiveRed,
                isDark && styles.chipTextDark,
              ]}>
              Guardia 24hs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'clinica' && styles.chipActive,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'clinica' && styles.chipActiveDark,
            ]}
            onPress={() => setSelectedFilter('clinica')}>
            <Ionicons
              name="paw"
              size={13}
              color={selectedFilter === 'clinica' ? '#15803d' : '#04b639'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'clinica' && styles.chipTextActive,
                isDark && styles.chipTextDark,
              ]}>
              Clínicas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'hospital' && styles.chipActiveRed,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'hospital' && styles.chipActiveRedDark,
            ]}
            onPress={() => setSelectedFilter('hospital')}>
            <Ionicons
              name="medkit"
              size={13}
              color={selectedFilter === 'hospital' ? '#be123c' : '#e11d48'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'hospital' && styles.chipTextActiveRed,
                isDark && styles.chipTextDark,
              ]}>
              Hospitales
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'petshop' && styles.chipActiveAmber,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'petshop' && styles.chipActiveAmberDark,
            ]}
            onPress={() => setSelectedFilter('petshop')}>
            <Ionicons
              name="bag-handle"
              size={13}
              color={selectedFilter === 'petshop' ? '#b45309' : '#d97706'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'petshop' && styles.chipTextActiveAmber,
                isDark && styles.chipTextDark,
              ]}>
              Pet Shops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'publico' && styles.chipActiveBlue,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'publico' && styles.chipActiveBlueDark,
            ]}
            onPress={() => setSelectedFilter('publico')}>
            <Ionicons
              name="business"
              size={13}
              color={selectedFilter === 'publico' ? '#0369a1' : '#0284c7'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'publico' && styles.chipTextActiveBlue,
                isDark && styles.chipTextDark,
              ]}>
              Zoonosis / Público
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              selectedFilter === 'farmacia' && styles.chipActiveTeal,
              isDark && styles.chipDark,
              isDark && selectedFilter === 'farmacia' && styles.chipActiveTealDark,
            ]}
            onPress={() => setSelectedFilter('farmacia')}>
            <Ionicons
              name="bandage"
              size={13}
              color={selectedFilter === 'farmacia' ? '#0f766e' : '#0d9488'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                selectedFilter === 'farmacia' && styles.chipTextActiveTeal,
                isDark && styles.chipTextDark,
              ]}>
              Farmacias
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contenedor del Mapa con Leaflet y OpenStreetMap centrado en Pilar */}
      <View style={styles.mapContainer}>
        <LeafletMapView
          ref={mapRef}
          initialLat={DEFAULT_COORDINATES.latitude}
          initialLng={DEFAULT_COORDINATES.longitude}
          zoom={14}
          veterinarias={filteredVeterinarias}
          userLocation={userLocation}
          isDark={isDark}
          onSelectClinic={handleSelectClinic}
          onMapTap={() => {
            setIsSearchFocused(false);
          }}
        />

        {/* Aviso amigable si la ubicación GPS está desactivada */}
        {hasLocationPermission === false && (
          <TouchableOpacity
            style={[styles.locationBanner, isDark && styles.locationBannerDark]}
            onPress={() => requestLocation(true)}>
            <Ionicons name="location-outline" size={16} color="#04b639" />
            <Text style={[styles.locationBannerText, isDark && styles.locationBannerTextDark]}>
              Mostrando {veterinarias.length} lugares en Pilar Centro. Toca para activar tu ubicación GPS.
            </Text>
          </TouchableOpacity>
        )}

        {/* Botones Flotantes (FABs) de control del mapa */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, isDark && styles.fabDark]}
            onPress={() => requestLocation(true)}
            activeOpacity={0.8}
            accessibilityLabel="Centrar en mi ubicación">
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#04b639" />
            ) : (
              <Ionicons
                name={userLocation ? 'locate' : 'navigate-outline'}
                size={22}
                color={userLocation ? '#04b639' : isDark ? '#f4f4f5' : '#0f172a'}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, isDark && styles.fabDark]}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } catch {}
              mapRef.current?.fitAll();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Ver todos los lugares">
            <Ionicons
              name="expand-outline"
              size={20}
              color={isDark ? '#f4f4f5' : '#0f172a'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, isDark && styles.fabDark]}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              } catch {}
              mapRef.current?.centerOnUser(
                DEFAULT_COORDINATES.latitude,
                DEFAULT_COORDINATES.longitude
              );
            }}
            activeOpacity={0.8}
            accessibilityLabel="Centrar en Pilar">
            <Ionicons
              name="business-outline"
              size={20}
              color={isDark ? '#f4f4f5' : '#0f172a'}
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown de sugerencias de búsqueda */}
        {isSearchFocused && searchQuery.length > 0 && (
          <View style={[styles.suggestionsDropdown, isDark && styles.suggestionsDropdownDark]}>
            {filteredVeterinarias.length === 0 ? (
              <View style={styles.noResultsBox}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={isDark ? '#71717a' : '#94a3b8'}
                />
                <Text style={[styles.noResultsText, isDark && styles.textMutedDark]}>
                  No se encontraron lugares que coincidan con &quot;{searchQuery}&quot;
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredVeterinarias}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const itemConfig = getTipoConfig(item.tipo);
                  return (
                    <TouchableOpacity
                      style={[styles.suggestionItem, isDark && styles.suggestionItemDark]}
                      onPress={() => handleSelectClinic(item.id)}>
                      <View
                        style={[
                          styles.suggestionIconBox,
                          {
                            backgroundColor: isDark
                              ? itemConfig.bgDark
                              : itemConfig.bg,
                          },
                        ]}>
                        <Ionicons
                          name={item.guardia24hs ? 'medkit' : (itemConfig.icon as any)}
                          size={16}
                          color={item.guardia24hs ? '#e11d48' : itemConfig.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.suggestionTitle, isDark && styles.textDark]}
                          numberOfLines={1}>
                          {item.nombre}
                        </Text>
                        <Text
                          style={[styles.suggestionSubtitle, isDark && styles.textMutedDark]}
                          numberOfLines={1}>
                          {item.direccion} &bull; {itemConfig.shortLabel}
                        </Text>
                      </View>
                      {item.distanceText && (
                        <Text style={styles.distanceBadge}>{item.distanceText}</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        )}

        {/* Tarjeta de Detalle Inferior (cuando hay un comercio o veterinaria seleccionado) */}
        {selectedClinic && (() => {
          const tipoConfig = getTipoConfig(selectedClinic.tipo);
          return (
            <View style={[styles.detailCard, isDark && styles.detailCardDark]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <View style={styles.badgeRow}>
                    {/* Badge de tipo de comercio */}
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor: isDark
                            ? tipoConfig.bgDark
                            : tipoConfig.bg,
                        },
                      ]}>
                      <Ionicons
                        name={tipoConfig.icon as any}
                        size={12}
                        color={tipoConfig.color}
                      />
                      <Text style={[styles.typeBadgeText, { color: tipoConfig.color }]}>
                        {tipoConfig.label}
                      </Text>
                    </View>

                    {/* Badge de Guardia 24hs si corresponde */}
                    {selectedClinic.guardia24hs && (
                      <View
                        style={[
                          styles.statusBadge,
                          styles.statusBadgeGuardia,
                          isDark && styles.statusBadgeGuardiaDark,
                        ]}>
                        <View style={styles.emergencyDot} />
                        <Text
                          style={[
                            styles.statusBadgeText,
                            styles.statusBadgeTextGuardia,
                            isDark && styles.statusBadgeTextGuardiaDark,
                          ]}>
                          Guardia 24hs
                        </Text>
                      </View>
                    )}

                    {/* Badge de distancia si hay GPS */}
                    {selectedClinic.distanceText && (
                      <View style={[styles.distancePill, isDark && styles.distancePillDark]}>
                        <Ionicons name="navigate-sharp" size={11} color="#04b639" />
                        <Text style={styles.distancePillText}>
                          {selectedClinic.distanceText}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.clinicTitle, isDark && styles.textDark]} numberOfLines={1}>
                    {selectedClinic.nombre}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedClinicId(null)}
                  style={[styles.closeCardBtn, isDark && styles.closeCardBtnDark]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={18} color={isDark ? '#a1a1aa' : '#64748b'} />
                </TouchableOpacity>
              </View>

              {/* Dirección */}
              <View style={styles.cardInfoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={isDark ? '#a1a1aa' : '#64748b'}
                />
                <Text
                  style={[styles.cardAddressText, isDark && styles.textMutedDark]}
                  numberOfLines={1}>
                  {selectedClinic.direccion}
                </Text>
              </View>

              {/* Teléfono */}
              <View style={styles.cardInfoRow}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={isDark ? '#a1a1aa' : '#64748b'}
                />
                <Text
                  style={[styles.cardAddressText, isDark && styles.textMutedDark]}
                  numberOfLines={1}>
                  {selectedClinic.telefono}
                </Text>
              </View>

              {/* Horario */}
              <View style={styles.cardInfoRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isDark ? '#a1a1aa' : '#64748b'}
                />
                <Text
                  style={[styles.cardHoursText, isDark && styles.textMutedDark]}
                  numberOfLines={1}>
                  {selectedClinic.horario}
                </Text>
              </View>

              {/* Servicios disponibles */}
              {selectedClinic.servicios && selectedClinic.servicios.length > 0 && (
                <View style={styles.servicesSection}>
                  <Text style={[styles.servicesTitle, isDark && styles.textMutedDark]}>
                    Servicios disponibles:
                  </Text>
                  <View style={styles.servicesRow}>
                    {selectedClinic.servicios.map((s, idx) => (
                      <View key={idx} style={[styles.serviceTag, isDark && styles.serviceTagDark]}>
                        <Ionicons
                          name="checkmark-circle"
                          size={11}
                          color="#04b639"
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.serviceTagText, isDark && styles.serviceTagTextDark]}>
                          {s}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Botones de acción */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  activeOpacity={0.85}
                  onPress={() => handleCall(selectedClinic.telefono)}>
                  <Ionicons name="call" size={16} color="#ffffff" />
                  <Text style={styles.callButtonText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.directionsButton, isDark && styles.directionsButtonDark]}
                  activeOpacity={0.85}
                  onPress={() => {
                    const lat =
                      selectedClinic.lat ??
                      selectedClinic.coordenadas?.latitude ??
                      DEFAULT_COORDINATES.latitude;
                    const lng =
                      selectedClinic.lng ??
                      selectedClinic.coordenadas?.longitude ??
                      DEFAULT_COORDINATES.longitude;
                    handleDirections(lat, lng);
                  }}>
                  <Ionicons name="navigate" size={16} color={isDark ? '#f4f4f5' : '#0f172a'} />
                  <Text
                    style={[styles.directionsButtonText, isDark && styles.textDark]}>
                    Cómo llegar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerDark: {
    borderBottomColor: '#27272a',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveIndicatorActive: {
    backgroundColor: '#04b639',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  textDark: {
    color: '#f4f4f5',
  },
  textMutedDark: {
    color: '#a1a1aa',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  searchSectionDark: {
    backgroundColor: '#09090b',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
  },
  searchInputDark: {
    color: '#f4f4f5',
  },
  clearButton: {
    padding: 4,
  },
  chipsRow: {
    marginTop: 10,
  },
  chipsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  chipDark: {
    backgroundColor: '#18181b',
  },
  chipActive: {
    backgroundColor: '#dcfce7',
  },
  chipActiveDark: {
    backgroundColor: '#064e3b',
  },
  chipActiveRed: {
    backgroundColor: '#ffe4e6',
  },
  chipActiveRedDark: {
    backgroundColor: '#881337',
  },
  chipActiveAmber: {
    backgroundColor: '#fef3c7',
  },
  chipActiveAmberDark: {
    backgroundColor: '#78350f',
  },
  chipActiveBlue: {
    backgroundColor: '#e0f2fe',
  },
  chipActiveBlueDark: {
    backgroundColor: '#075985',
  },
  chipActiveTeal: {
    backgroundColor: '#ccfbf1',
  },
  chipActiveTealDark: {
    backgroundColor: '#134e4a',
  },
  emergencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e11d48',
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  chipTextDark: {
    color: '#a1a1aa',
  },
  chipTextActive: {
    color: '#15803d',
  },
  chipTextActiveRed: {
    color: '#be123c',
  },
  chipTextActiveAmber: {
    color: '#b45309',
  },
  chipTextActiveBlue: {
    color: '#0369a1',
  },
  chipTextActiveTeal: {
    color: '#0f766e',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  locationBanner: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    zIndex: 10,
  },
  locationBannerDark: {
    backgroundColor: '#052e16',
    borderColor: '#065f46',
  },
  locationBannerText: {
    fontSize: 12,
    color: '#15803d',
    flex: 1,
  },
  locationBannerTextDark: {
    color: '#86efac',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 10,
    zIndex: 20,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fabDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    maxHeight: 260,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionsDropdownDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  suggestionItemDark: {
    borderBottomColor: '#27272a',
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  distanceBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#04b639',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  noResultsBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noResultsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  detailCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeGuardia: {
    backgroundColor: '#ffe4e6',
  },
  statusBadgeGuardiaDark: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadgeTextGuardia: {
    color: '#e11d48',
  },
  statusBadgeTextGuardiaDark: {
    color: '#fb7185',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  distancePillDark: {
    backgroundColor: '#27272a',
  },
  distancePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#04b639',
  },
  clinicTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeCardBtn: {
    padding: 4,
    borderRadius: 12,
  },
  closeCardBtnDark: {
    backgroundColor: '#27272a',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardAddressText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  cardHoursText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  servicesSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  servicesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceTagDark: {
    backgroundColor: '#27272a',
  },
  serviceTagText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  serviceTagTextDark: {
    color: '#cbd5e1',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04b639',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  directionsButtonDark: {
    backgroundColor: '#27272a',
  },
  directionsButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
});
