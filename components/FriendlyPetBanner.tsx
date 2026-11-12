import { FontFamily, Palette, Radius, Shadows } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface FriendlyPetBannerProps {
  title: string;
  subtitle?: string;
  variant?: 'dog' | 'cat' | 'both' | 'care' | 'paw';
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FriendlyPetBanner({
  title,
  subtitle,
  variant = 'both',
  compact = false,
  style,
}: FriendlyPetBannerProps) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        compact && styles.containerCompact,
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${subtitle || ''}`}
    >
      {/* Composición de ilustraciones vectoriales amigables */}
      <View style={styles.artWrapper}>
        {variant === 'paw' && (
          <View style={[styles.avatarCircle, styles.avatarPaw, isDark && styles.avatarPawDark]}>
            <MaterialCommunityIcons
              name="paw"
              size={compact ? 24 : 30}
              color={isDark ? '#4ade80' : Palette.greenDeep}
            />
          </View>
        )}

        {variant === 'both' && (
          <View style={styles.pairContainer}>
            <View style={[styles.avatarCircle, styles.avatarDog, isDark && styles.avatarDark]}>
              <MaterialCommunityIcons
                name="dog"
                size={compact ? 22 : 28}
                color={Palette.greenDeep}
              />
            </View>
            <View style={[styles.avatarCircle, styles.avatarCat, isDark && styles.avatarDark]}>
              <MaterialCommunityIcons
                name="cat"
                size={compact ? 20 : 26}
                color={Palette.peachDark}
              />
            </View>
            <View style={[styles.miniHeartBadge, isDark && styles.miniHeartBadgeDark]}>
              <MaterialCommunityIcons name="heart" size={10} color={Palette.redEmergency} />
            </View>
          </View>
        )}

        {variant === 'dog' && (
          <View style={[styles.avatarCircle, styles.avatarDogSolo, isDark && styles.avatarDark]}>
            <MaterialCommunityIcons
              name="dog"
              size={compact ? 24 : 32}
              color={Palette.greenDeep}
            />
          </View>
        )}

        {variant === 'cat' && (
          <View style={[styles.avatarCircle, styles.avatarCatSolo, isDark && styles.avatarDark]}>
            <MaterialCommunityIcons
              name="cat"
              size={compact ? 24 : 32}
              color={Palette.peachDark}
            />
          </View>
        )}

        {variant === 'care' && (
          <View style={[styles.avatarCircle, styles.avatarCareSolo, isDark && styles.avatarDark]}>
            <MaterialCommunityIcons
              name="shield-check"
              size={compact ? 24 : 30}
              color={Palette.greenDeep}
            />
          </View>
        )}
      </View>

      {/* Contenido textual con mensaje cálido y tipografía aprobada */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark && styles.titleDark, compact && styles.titleCompact]}>
          "{title}"
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              isDark && styles.subtitleDark,
              compact && styles.subtitleCompact,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenSoft,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
    gap: 14,
    marginVertical: 10,
    ...Shadows.sm,
  },
  containerDark: {
    backgroundColor: '#072417',
    borderColor: '#174E33',
    shadowColor: '#000000',
  },
  containerCompact: {
    padding: 12,
    gap: 10,
    marginVertical: 6,
  },
  artWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 64,
    height: 44,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarDark: {
    borderColor: Palette.surfaceDark,
  },
  avatarDog: {
    backgroundColor: Palette.greenSoft,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  avatarCat: {
    backgroundColor: Palette.peachSoft,
    position: 'absolute',
    right: 2,
    zIndex: 2,
  },
  avatarDogSolo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.greenSoft,
  },
  avatarCatSolo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.peachSoft,
  },
  avatarPaw: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.greenBorder,
  },
  avatarPawDark: {
    backgroundColor: '#123D2B',
    borderColor: '#174E33',
  },
  avatarCareSolo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.greenSoft,
  },
  miniHeartBadge: {
    position: 'absolute',
    top: -2,
    right: 18,
    zIndex: 3,
    backgroundColor: Palette.redSoft,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  miniHeartBadgeDark: {
    backgroundColor: '#381616',
    borderColor: Palette.surfaceDark,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: FontFamily.headingBold,
    color: Palette.greenDeep,
    letterSpacing: -0.2,
  },
  titleDark: {
    color: '#86efac',
  },
  titleCompact: {
    fontSize: 13,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  subtitleDark: {
    color: Palette.textSecondaryDark,
  },
  subtitleCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
});

