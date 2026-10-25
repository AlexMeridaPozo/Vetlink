import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VeterinariasScreen() {
  const { isDark } = useAppTheme();
  const { profile, isVeterinario } = useAuth();

  const clinicaAsociada = profile?.veterinaria;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <ThemeToggleButton />
      </View>

      {isVeterinario && clinicaAsociada ? (
        <View style={styles.clinicCardWrapper}>
          <View style={[styles.cardClinica, isDark && styles.cardClinicaDark]}>
            <View style={[styles.iconCircleSmall, isDark && styles.iconCircleDark]}>
              <Ionicons name="medkit" size={32} color="#04b639" />
            </View>
            <View style={styles.badgeAsociada}>
              <Text style={styles.badgeAsociadaText}>Tu Establecimiento Asociado</Text>
            </View>
            <Text style={[styles.clinicTitle, isDark && styles.textDark]}>{clinicaAsociada}</Text>
            <Text style={[styles.clinicSubtitle, isDark && styles.subtituloDark]}>
              Clínica veterinaria vinculada a tu perfil profesional en VetLink.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
            <Ionicons name="medkit" size={48} color="#04b639" />
          </View>
          <Text style={[styles.placeholderTitle, isDark && styles.textDark]}>
            {isVeterinario ? 'Mi Veterinaria' : 'Clínicas Veterinarias'}
          </Text>
          <Text style={[styles.placeholderText, isDark && styles.subtituloDark]}>
            {isVeterinario
              ? 'No tienes una clínica veterinaria asociada a tu perfil actualmente. Los administradores pueden asignar tu establecimiento de atención.'
              : 'Directorio de veterinarias asociadas, horarios de guardia 24hs y teléfonos de emergencia.'}
          </Text>
        </View>
      )}
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
  clinicCardWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  cardClinica: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#86efac',
    alignItems: 'center',
  },
  cardClinicaDark: {
    backgroundColor: '#132e1f',
    borderColor: '#166534',
  },
  iconCircleSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeAsociada: {
    backgroundColor: '#04b639',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeAsociadaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  clinicTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#14532d',
    textAlign: 'center',
    marginBottom: 8,
  },
  clinicSubtitle: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
  },
});
