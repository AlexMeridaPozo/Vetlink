import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Typography, Radius, Shadows } from '@/constants/theme';

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
              <Ionicons name="medkit-outline" size={32} color={Palette.greenDeep} />
            </View>
            <View style={styles.badgeAsociada}>
              <Text style={styles.badgeAsociadaText}>Establecimiento Asociado</Text>
            </View>
            <Text style={[styles.clinicTitle, isDark && styles.textDark]}>{clinicaAsociada}</Text>
            <Text style={[styles.clinicSubtitle, isDark && styles.subtituloDark]}>
              Clínica veterinaria vinculada a tu perfil profesional en HuellaApp.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
            <Ionicons name="medkit-outline" size={44} color={Palette.greenDeep} />
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
    backgroundColor: Palette.backgroundLight,
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  iconCircleDark: {
    backgroundColor: 'rgba(8, 122, 67, 0.2)',
    borderColor: Palette.greenDeep,
  },
  placeholderTitle: {
    fontSize: Typography.size.h2,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
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
  clinicCardWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  cardClinica: {
    backgroundColor: Palette.cardLight,
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    alignItems: 'center',
    ...Shadows.md,
  },
  cardClinicaDark: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(8, 122, 67, 0.4)',
  },
  iconCircleSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeAsociada: {
    backgroundColor: Palette.greenDeep,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 12,
  },
  badgeAsociadaText: {
    color: '#ffffff',
    fontSize: Typography.size.tiny,
    fontFamily: Typography.family.bodyBold,
  },
  clinicTitle: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  clinicSubtitle: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
