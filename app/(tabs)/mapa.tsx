import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { usePets } from '@/services/petService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapaScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { pets } = usePets();

  // Mascotas con escaneos de rescate o reportadas como extraviadas
  const petsConUbicacion = pets.filter((p) => p.ultimoEscaneo || p.extraviada);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titulo, isDark && styles.textDark]}>Mapa</Text>
            <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>
              Veterinarias y geolocalización de mascotas
            </Text>
          </View>
          <ThemeToggleButton />
        </View>

        {/* Sección de Escaneos de Rescate Recientes */}
        {petsConUbicacion.length > 0 && (
          <View style={styles.rescueSection}>
            <View style={styles.rescueHeader}>
              <View style={styles.rescueDot} />
              <Text style={styles.rescueSectionTitle}>Últimas Ubicaciones de Rescate</Text>
            </View>

            {petsConUbicacion.map((pet) => (
              <View key={pet.id} style={[styles.rescueCard, isDark && styles.rescueCardDark]}>
                <View style={styles.rescueCardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.rescuePetName, isDark && styles.textDark]}>{pet.nombre}</Text>
                      {pet.extraviada && (
                        <View style={styles.lostBadge}>
                          <Text style={styles.lostBadgeText}>Extraviada</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.rescuePetId, isDark && styles.subtituloDark]}>
                      ID: {pet.id} • {pet.especie}
                    </Text>
                  </View>
                </View>

                {pet.ultimoEscaneo ? (
                  <View style={[styles.scanInfoBox, isDark && styles.scanInfoBoxDark]}>
                    <Ionicons name="location" size={18} color="#2563eb" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.scanDateText, isDark && styles.textDark]}>
                        Escaneo: {new Date(pet.ultimoEscaneo.fecha).toLocaleString()}
                      </Text>
                      <Text style={[styles.scanCoordsText, isDark && styles.subtituloDark]}>
                        GPS: {pet.ultimoEscaneo.lat.toFixed(5)}, {pet.ultimoEscaneo.lng.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.waitingScanText, isDark && styles.subtituloDark]}>
                    Alerta de búsqueda activa. Esperando primer escaneo por QR o NFC.
                  </Text>
                )}

                <View style={styles.cardActions}>
                  {pet.ultimoEscaneo && (
                    <Pressable
                      style={styles.btnMaps}
                      onPress={() =>
                        Linking.openURL(
                          `https://maps.google.com/?q=${pet.ultimoEscaneo!.lat},${pet.ultimoEscaneo!.lng}`
                        )
                      }
                    >
                      <Ionicons name="navigate-circle" size={16} color="#ffffff" />
                      <Text style={styles.btnMapsText}>Abrir en Google Maps</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[styles.btnDetails, isDark && styles.btnDetailsDark]}
                    onPress={() => router.push(`/mascotas/${pet.id}` as any)}
                  >
                    <Text style={[styles.btnDetailsText, isDark && styles.textDark]}>Ver Ficha</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Placeholder de Clínicas y Veterinarias en Mapa */}
        <View style={styles.placeholderContainer}>
          <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
            <Ionicons name="map" size={42} color="#04b639" />
          </View>
          <Text style={[styles.placeholderTitle, isDark && styles.textDark]}>
            Mapa de Clínicas y Guardias
          </Text>
          <Text style={[styles.placeholderText, isDark && styles.subtituloDark]}>
            Aquí podrás visualizar clínicas veterinarias, farmacias y centros de guardia 24hs geolocalizados cerca de tu ubicación.
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
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
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

  // Rescue Section
  rescueSection: {
    marginBottom: 24,
  },
  rescueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rescueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  rescueSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  rescueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rescueCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderLeftColor: '#ef4444',
  },
  rescueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rescuePetName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  lostBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lostBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#dc2626',
  },
  rescuePetId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  scanInfoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  scanInfoBoxDark: {
    backgroundColor: '#27272a',
  },
  scanDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  scanCoordsText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  waitingScanText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnMaps: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnMapsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDetails: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDetailsDark: {
    backgroundColor: '#27272a',
  },
  btnDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Placeholder
  placeholderContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleDark: {
    backgroundColor: '#064e3b',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
