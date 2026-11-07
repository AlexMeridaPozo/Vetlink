import { Platform } from 'react-native';

/**
 * 🐾 HuellaApp - Sistema de Tokens de Diseño
 * Identidad visual: Custom Modern Friendly Pet UI
 * Colores basados en el logo oficial (Verde Huella, Verde Bosque, Cian, Durazno, Rojo Urgencia)
 */

export const Palette = {
  // Verdes de Marca
  greenPrimary: '#13A857',   // Verde Huella oficial del logo
  greenDeep: '#087A43',      // Verde Bosque (WCAG AA ratio 5.2:1 con blanco)
  greenDarker: '#05562E',
  greenSoft: '#EAF8EF',      // Fondo suave verde para chips y contenedores
  greenBorder: '#BCE8CE',

  // Cianos Secundarios
  cyanSecondary: '#65CFE0',  // Cian amigable
  cyanLight: '#E8F9FC',      // Fondo cian hielo para chips informativos
  cyanBorder: '#B6E8F1',
  cyanDark: '#0E7490',

  // Durazno / Cálidos
  peachWarm: '#FFB38A',      // Durazno acento cálido
  peachSoft: '#FFF3EB',      // Fondo durazno suave
  peachBorder: '#FDD8C4',
  peachDark: '#9A3412',

  // Rojo Urgencias / SOS
  redEmergency: '#D94A4A',   // Rojo alerta (ratio 4.8:1 con blanco)
  redSoft: '#FDF2F2',        // Fondo alerta suave
  redBorder: '#FCA5A5',
  redDark: '#991B1B',

  // Neutros Claros
  backgroundLight: '#F8FCF8',// Fondo global menta cálido (evita la dureza del blanco puro)
  surfaceLight: '#FFFFFF',   // Superficie de tarjetas y modales
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#F1F7F3',
  borderLight: '#E2EFE7',
  borderSubtle: '#EDF5F0',

  // Tipografía y Contraste
  textPrimary: '#26332E',    // Carbón bosque de alto contraste (13.8:1 con fondo)
  textSecondary: '#5C6B64',  // Gris pizarra legible (5.1:1 con fondo)
  textMuted: '#8E9E96',
  textPlaceholder: '#A3B3AB',
  white: '#FFFFFF',

  // Neutros Oscuros (Dark Mode)
  backgroundDark: '#0F1714',
  surfaceDark: '#182420',
  surfaceRaisedDark: '#20302B',
  surfaceSubtleDark: '#141F1B',
  borderDark: '#273831',
  borderSubtleDark: '#1E2D27',
  textPrimaryDark: '#F0FDF4',
  textSecondaryDark: '#A3B8B0',
  textMutedDark: '#6E857C',
};

export const Colors = {
  light: {
    // Identidad y Acentos
    primary: Palette.greenDeep,
    primaryBrand: Palette.greenPrimary,
    primaryDark: Palette.greenDarker,
    primarySoft: Palette.greenSoft,
    primaryBorder: Palette.greenBorder,

    secondary: Palette.cyanSecondary,
    secondarySoft: Palette.cyanLight,
    secondaryBorder: Palette.cyanBorder,
    secondaryDark: Palette.cyanDark,

    accent: Palette.peachWarm,
    accentSoft: Palette.peachSoft,
    accentBorder: Palette.peachBorder,
    accentDark: Palette.peachDark,

    emergency: Palette.redEmergency,
    emergencySoft: Palette.redSoft,
    emergencyBorder: Palette.redBorder,
    emergencyDark: Palette.redDark,

    // Fondos y Superficies
    background: Palette.backgroundLight,
    surface: Palette.surfaceLight,
    surfaceRaised: Palette.surfaceRaised,
    surfaceSubtle: Palette.surfaceSubtle,

    // Bordes
    border: Palette.borderLight,
    borderSubtle: Palette.borderSubtle,

    // Textos
    text: Palette.textPrimary,
    textSecondary: Palette.textSecondary,
    textMuted: Palette.textMuted,
    textPlaceholder: Palette.textPlaceholder,
    textInverse: Palette.white,

    // Navegación
    tint: Palette.greenDeep,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.greenDeep,
    tabBarBackground: Palette.surfaceLight,
    tabBarBorder: Palette.borderLight,
  },
  dark: {
    // Identidad y Acentos
    primary: '#22C55E',
    primaryBrand: Palette.greenPrimary,
    primaryDark: '#15803D',
    primarySoft: '#133324',
    primaryBorder: '#1F543B',

    secondary: '#38BDF8',
    secondarySoft: '#162F3B',
    secondaryBorder: '#1F4759',
    secondaryDark: '#7DD3FC',

    accent: '#FB923C',
    accentSoft: '#381E10',
    accentBorder: '#5E311A',
    accentDark: '#FDBA74',

    emergency: '#EF4444',
    emergencySoft: '#381616',
    emergencyBorder: '#7F1D1D',
    emergencyDark: '#FCA5A5',

    // Fondos y Superficies
    background: Palette.backgroundDark,
    surface: Palette.surfaceDark,
    surfaceRaised: Palette.surfaceRaisedDark,
    surfaceSubtle: Palette.surfaceSubtleDark,

    // Bordes
    border: Palette.borderDark,
    borderSubtle: Palette.borderSubtleDark,

    // Textos
    text: Palette.textPrimaryDark,
    textSecondary: Palette.textSecondaryDark,
    textMuted: Palette.textMutedDark,
    textPlaceholder: '#6E857C',
    textInverse: '#0F1714',

    // Navegación
    tint: '#22C55E',
    icon: Palette.textSecondaryDark,
    tabIconDefault: Palette.textSecondaryDark,
    tabIconSelected: '#22C55E',
    tabBarBackground: Palette.surfaceDark,
    tabBarBorder: Palette.borderDark,
  },
};

/**
 * 🔤 Sistema Tipográfico
 * Headings: Quicksand (redondeada, cálida y geométrica)
 * Body: Nunito Sans (ultra legible para interfaces y formularios)
 */
export const FontFamily = {
  headingSemiBold: 'Quicksand_600SemiBold',
  headingBold: 'Quicksand_700Bold',
  bodyRegular: 'NunitoSans_400Regular',
  bodySemiBold: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
};

export const Typography = {
  display: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h1: {
    fontFamily: FontFamily.headingBold,
    fontSize: 24,
    lineHeight: 30,
  },
  h2: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 19,
    lineHeight: 25,
  },
  h3: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLarge: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 15,
  },
};

/**
 * 📏 Espaciados y Radios del Sistema
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
};

/**
 * ☁️ Sombras Multiplataforma
 */
export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#087A43',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 2px 4px rgba(8, 122, 67, 0.04)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#087A43',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 10,
    },
    android: {
      elevation: 3,
    },
    default: {
      boxShadow: '0 4px 10px rgba(8, 122, 67, 0.07)',
    },
  }),
  emergency: Platform.select({
    ios: {
      shadowColor: '#D94A4A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 4px 8px rgba(217, 74, 74, 0.25)',
    },
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
