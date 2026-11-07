import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

export default function TurnosScreen() {
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, isDark && styles.textDark]}>Turnos Veterinarios</Text>
            <Text style={[styles.subtitle, isDark && styles.subtituloDark]}>
              Consulta y gestiona las citas médicas de tus mascotas
            </Text>
          </View>
          <ThemeToggleButton />
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={18} color={Palette.greenDeep} />
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Próximos Turnos</Text>
          </View>

          {/* Turno 1 */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <View style={styles.petHeaderInfo}>
                <View style={styles.petIconCircle}>
                  <MaterialCommunityIcons name="dog" size={20} color={Palette.greenDeep} />
                </View>
                <Text style={[styles.petName, isDark && styles.textDark]}>Santino</Text>
              </View>

              <View style={styles.statusConfirmed}>
                <Ionicons name="checkmark-circle-outline" size={13} color={Palette.greenDeep} />
                <Text style={styles.statusConfirmedText}>Confirmado</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={15} color={Palette.greenDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>20 de septiembre de 2026</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={15} color={Palette.greenDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>15:30 hs</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoIconBox}>
                <Ionicons name="business-outline" size={15} color={Palette.greenDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>Veterinaria San Martín</Text>
              </View>
            </View>
          </View>

          {/* Turno 2 */}
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <View style={styles.petHeaderInfo}>
                <View style={[styles.petIconCircle, { backgroundColor: Palette.cyanLight }]}>
                  <MaterialCommunityIcons name="cat" size={20} color="#0284c7" />
                </View>
                <Text style={[styles.petName, isDark && styles.textDark]}>Milo</Text>
              </View>

              <View style={styles.statusRequested}>
                <Ionicons name="time-outline" size={13} color="#0284c7" />
                <Text style={styles.statusRequestedText}>Solicitado</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                <Ionicons name="calendar-outline" size={15} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>25 de septiembre de 2026</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                <Ionicons name="time-outline" size={15} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>10:00 hs</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.infoIconBox, { backgroundColor: Palette.cyanLight }]}>
                <Ionicons name="business-outline" size={15} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
                <Text style={[styles.value, isDark && styles.textDark]}>Clínica Veterinaria Central</Text>
              </View>
            </View>
          </View>

          <View style={[styles.emptyMessage, isDark && styles.emptyMessageDark]}>
            <Ionicons name="information-circle-outline" size={16} color={Palette.textMuted} />
            <Text style={[styles.emptyText, isDark && styles.subtituloDark]}>
              Estos turnos son de ejemplo para fines ilustrativos.
            </Text>
          </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  content: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  card: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    ...Shadows.sm,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  petHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  petIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: Typography.size.bodyLarge,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  statusConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  statusConfirmedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: Palette.greenDeep,
  },
  statusRequested: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.cyanLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusRequestedText: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
    color: '#0284c7',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
    gap: 10,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  value: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
    color: Palette.textPrimary,
    marginTop: 1,
  },
  emptyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    backgroundColor: Palette.cardLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginTop: 4,
  },
  emptyMessageDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyText: {
    fontSize: Typography.size.caption,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
  },
  textDark: {
    color: '#fafafa',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
