import { Palette, Radius, Shadows, Typography } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export type EmptyStateVariant =
  | 'pets'
  | 'history'
  | 'reminders'
  | 'appointments'
  | 'medications'
  | 'dog'
  | 'cat';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Ilustraciones PNG estáticas oficiales con transparencia 32-bit ARGB
const ILLUSTRATION_ASSETS = {
  reminders: require('../assets/images/imagenmascotas/doghuellappng.png'),
  appointments: require('../assets/images/imagenmascotas/cathuellappng.png'),
  pets: require('../assets/images/imagenmascotas/perrocatpng.png'),
  history: require('../assets/images/imagenmascotas/perrohuellappng.png'),
};

interface IllustrationConfig {
  source: any;
  width: number;
  height: number;
  compactWidth: number;
  compactHeight: number;
  isWide?: boolean;
}

const CONFIG_BY_VARIANT: Record<EmptyStateVariant, IllustrationConfig> = {
  reminders: {
    source: ILLUSTRATION_ASSETS.reminders,
    width: 150,
    height: 164,
    compactWidth: 105,
    compactHeight: 115,
  },
  appointments: {
    source: ILLUSTRATION_ASSETS.appointments,
    width: 154,
    height: 154,
    compactWidth: 108,
    compactHeight: 108,
  },
  pets: {
    source: ILLUSTRATION_ASSETS.pets,
    width: 220,
    height: 124,
    compactWidth: 156,
    compactHeight: 88,
    isWide: true,
  },
  history: {
    source: ILLUSTRATION_ASSETS.history,
    width: 138,
    height: 175,
    compactWidth: 98,
    compactHeight: 124,
  },
  medications: {
    source: ILLUSTRATION_ASSETS.history,
    width: 138,
    height: 175,
    compactWidth: 98,
    compactHeight: 124,
  },
  dog: {
    source: ILLUSTRATION_ASSETS.reminders,
    width: 150,
    height: 164,
    compactWidth: 105,
    compactHeight: 115,
  },
  cat: {
    source: ILLUSTRATION_ASSETS.appointments,
    width: 154,
    height: 154,
    compactWidth: 108,
    compactHeight: 108,
  },
};

/**
 * Contenedor visual que compone el fondo decorativo orgánico mediante capas de Views
 * nativas (verde menta, celeste suave y blanco/translúcido) sin dependencias adicionales.
 */
function EmptyStateIllustration({
  variant,
  isDark,
  compact,
}: {
  variant: EmptyStateVariant;
  isDark: boolean;
  compact: boolean;
}) {
  const config = CONFIG_BY_VARIANT[variant] || CONFIG_BY_VARIANT.pets;
  const isWide = config.isWide;

  const imageWidth = compact ? config.compactWidth : config.width;
  const imageHeight = compact ? config.compactHeight : config.height;

  return (
    <View style={[styles.illustrationWrapper, compact && styles.illustrationWrapperCompact]}>
      {/* Capa 1 (Exterior): Halo celeste suave orgánico */}
      <View
        style={[
          styles.haloOuter,
          isWide ? styles.haloOuterWide : null,
          compact && styles.haloOuterCompact,
          isWide && compact && styles.haloOuterWideCompact,
          isDark && styles.haloOuterDark,
        ]}
      />

      {/* Capa 2 (Intermedia): Halo verde menta HuellaApp */}
      <View
        style={[
          styles.haloMiddle,
          isWide ? styles.haloMiddleWide : null,
          compact && styles.haloMiddleCompact,
          isWide && compact && styles.haloMiddleWideCompact,
          isDark && styles.haloMiddleDark,
        ]}
      />

      {/* Capa 3 (Interior): Centro de luz blanca translúcida */}
      <View
        style={[
          styles.haloInner,
          isWide ? styles.haloInnerWide : null,
          compact && styles.haloInnerCompact,
          isWide && compact && styles.haloInnerWideCompact,
          isDark && styles.haloInnerDark,
        ]}
      />

      {/* Sombra de contacto suave al pie */}
      <View
        style={[
          styles.contactShadow,
          isWide ? styles.contactShadowWide : null,
          compact && styles.contactShadowCompact,
          isDark && styles.contactShadowDark,
        ]}
      />

      {/* Ilustración estática con expo-image preservando proporciones originales */}
      <Image
        source={config.source}
        style={{ width: imageWidth, height: imageHeight }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

/**
 * 🐾 EmptyState - Componente visual reutilizable para estados vacíos en HuellaApp.
 * Ilustraciones estáticas oficiales con fondos orgánicos en degradado menta/celeste.
 */
export function EmptyState({
  variant = 'pets',
  title,
  message,
  actionLabel,
  onAction,
  actionIcon,
  compact = false,
  style,
}: EmptyStateProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <EmptyStateIllustration variant={variant} isDark={isDark} compact={compact} />

      <Text style={[styles.title, isDark && styles.titleDark, compact && styles.titleCompact]}>
        {title}
      </Text>

      <Text style={[styles.message, isDark && styles.messageDark, compact && styles.messageCompact]}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, compact && styles.actionButtonCompact]}
          onPress={onAction}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          {actionIcon && (
            <Ionicons
              name={actionIcon}
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  containerCompact: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  // --- Contenedor de Ilustración y Halos Decorativos ---
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
    minHeight: 180,
    width: '100%',
  },
  illustrationWrapperCompact: {
    marginBottom: 10,
    minHeight: 130,
  },

  // Capa 1: Celeste Suave
  haloOuter: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#E8F9FC',
    opacity: 0.85,
    transform: [{ rotate: '-6deg' }],
  },
  haloOuterWide: {
    width: 246,
    height: 148,
    borderRadius: Radius.full,
    transform: [{ rotate: '0deg' }],
  },
  haloOuterCompact: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  haloOuterWideCompact: {
    width: 174,
    height: 104,
    borderRadius: Radius.full,
  },
  haloOuterDark: {
    backgroundColor: 'rgba(101, 207, 224, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(101, 207, 224, 0.16)',
  },

  // Capa 2: Verde Menta HuellaApp
  haloMiddle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#D7F5E4',
    opacity: 0.9,
    transform: [{ rotate: '4deg' }],
  },
  haloMiddleWide: {
    width: 232,
    height: 136,
    borderRadius: Radius.full,
    transform: [{ rotate: '0deg' }],
  },
  haloMiddleCompact: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  haloMiddleWideCompact: {
    width: 160,
    height: 94,
    borderRadius: Radius.full,
  },
  haloMiddleDark: {
    backgroundColor: 'rgba(19, 168, 87, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(19, 168, 87, 0.20)',
  },

  // Capa 3: Centro de Luz Blanca / Resplandor
  haloInner: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#FFFFFF',
    opacity: 0.88,
  },
  haloInnerWide: {
    width: 200,
    height: 118,
    borderRadius: Radius.full,
  },
  haloInnerCompact: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  haloInnerWideCompact: {
    width: 140,
    height: 80,
    borderRadius: Radius.full,
  },
  haloInnerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  // Sombra de contacto
  contactShadow: {
    position: 'absolute',
    bottom: 2,
    width: 120,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(8, 122, 67, 0.08)',
  },
  contactShadowWide: {
    width: 180,
    height: 16,
    borderRadius: 8,
  },
  contactShadowCompact: {
    width: 84,
    height: 10,
    borderRadius: 5,
    bottom: 0,
  },
  contactShadowDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  // --- Tipografías y Textos ---
  title: {
    fontSize: Typography.size.h3,
    fontFamily: Typography.family.heading,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  titleDark: {
    color: Palette.textPrimaryDark,
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  messageDark: {
    color: Palette.textSecondaryDark,
  },
  messageCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 18,
    backgroundColor: Palette.greenDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  actionButtonCompact: {
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: Typography.size.bodySmall,
    fontFamily: Typography.family.bodyBold,
  },
});
