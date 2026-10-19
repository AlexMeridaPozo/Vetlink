import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VeterinariasScreen() {
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <ThemeToggleButton />
      </View>
      <View style={styles.placeholderContainer}>
        <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
          <Ionicons name="medkit" size={48} color="#04b639" />
        </View>
        <Text style={[styles.placeholderTitle, isDark && styles.textDark]}>Clínicas Veterinarias</Text>
        <Text style={[styles.placeholderText, isDark && styles.subtituloDark]}>
          Directorio de veterinarias asociadas, horarios de guardia 24hs y teléfonos de emergencia.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#09090b',
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircleDark: {
    backgroundColor: '#064e3b',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
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
});
