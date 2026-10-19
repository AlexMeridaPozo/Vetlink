import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TurnosScreen() {
  const { isDark } = useAppTheme();

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Turnos</Text>
            <Text style={styles.subtitle}>
              Consulta los turnos de tus mascotas
            </Text>
          </View>
          <ThemeToggleButton />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Próximos turnos</Text>

        {/* Turno 1 */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.petName, isDark && styles.textDark]}>🐶 Santino</Text>

            <View style={styles.status}>
              <Text style={styles.statusText}>Confirmado</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>20 de septiembre de 2026</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>15:30 hs</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>Veterinaria San Martin</Text>
          </View>
        </View>

        {/* Turno 2 */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.petName, isDark && styles.textDark]}>🐱 Santino</Text>

            <View style={styles.statusRequested}>
              <Text style={styles.statusText}>Solicitado</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Fecha</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>25 de septiembre de 2026</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Hora</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>10:00 hs</Text>
          </View>

          <View style={styles.info}>
            <Text style={[styles.label, isDark && styles.subtituloDark]}>Veterinaria</Text>
            <Text style={[styles.value, isDark && styles.textDark]}>Clínica Veterinaria Central</Text>
          </View>
        </View>

        <View style={[styles.emptyMessage, isDark && styles.emptyMessageDark]}>
          <Text style={[styles.emptyText, isDark && styles.subtituloDark]}>
            Estos turnos son de ejemplo para fines ilustrativos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  header: {
    backgroundColor: '#047857',
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerDark: {
    backgroundColor: '#064e3b',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#E9F9ED',
    fontSize: 15,
  },
  content: {
    padding: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  status: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusRequested: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  emptyMessage: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  emptyMessageDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  textDark: {
    color: '#f4f4f5',
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
});
