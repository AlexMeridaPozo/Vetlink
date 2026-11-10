import { Platform } from 'react-native';

/**
 * 🐾 HuellaApp - Sistema de Tokens de Diseño Oficial
 * Identidad visual: Custom Modern Friendly Pet UI
 * Documento de referencia: DESIGN_SYSTEM.md
 */

export const Palette = {
  // Verdes de Marca
  greenPrimary: '#13A857',   // Verde Huella oficial del logo (identidad, marcas, bordes activos, iconos)
  greenDeep: '#087A43',      // Verde Bosque (WCAG AA ratio 5.38:1 con blanco - BOTONES Y TEXTO)
  greenDarker: '#05562E',
  greenSoft: '#EAF8F0',      // Fondo suave verde para chips, badges y contenedores
  greenBorder: '#BCEAD0',

  // Cianos Secundarios
  cyanSecondary: '#65CFE0',  // Cian informativo
  cyanLight: '#E8F9FC',      // Superficie cian suave para chips y burbujas de asistente
  cyanBorder: '#B6E8F1',
  cyanDark: '#0E7490',

  // Durazno / Cálidos
  peachWarm: '#FFB38A',      // Durazno acento cálido
  peachSoft: '#FFF3EB',      // Fondo durazno suave
  peachBorder: '#FDD8C4',
  peachDark: '#9A3412',

  // Rojo Urgencias / SOS
  redEmergency: '#D94A4A',   // Rojo alerta (ratio 4.62:1 con blanco - WCAG AA)
  redSoft: '#FEF2F2',        // Fondo alerta suave
  redBorder: '#FECACA',
  redDark: '#991B1B',

  // Neutros Claros
  backgroundLight: '#F8FCF8',// Fondo global menta cálido (evita la dureza del blanco puro)
  cardLight: '#FFFFFF',      // Superficie de tarjetas y modales
  surfaceLight: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#F1F7F3',
  borderLight: '#E3EFE7',
  borderSubtle: '#EDF5F0',

  // Tipografía y Contraste
  textPrimary: '#26332E',    // Carbón bosque de alto contraste (14.12:1 con fondo - WCAG AAA)
  textSecondary: '#5A6E65',  // Gris pizarra legible (5.14:1 con fondo - WCAG AA)
  textMuted: '#8B9E95',
  textPlaceholder: '#A3B3AB',
  white: '#FFFFFF',

  // Neutros Oscuros (Dark Mode)
  backgroundDark: '#09090B',
  surfaceDark: '#18181B',
  surfaceRaisedDark: '#20302B',
  surfaceSubtleDark: '#141F1B',
  borderDark: '#27272A',
  borderSubtleDark: '#1E2D27',
  textPrimaryDark: '#F4F4F5',
  textSecondaryDark: '#A1A1AA',
  textMutedDark: '#71717A',
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
    surface: Palette.cardLight,
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
    tabBarBackground: Palette.cardLight,
    tabBarBorder: Palette.borderLight,
  },
  dark: {
    // Identidad y Acentos
    primary: '#4ADE80',
    primaryBrand: Palette.greenPrimary,
    primaryDark: '#15803D',
    primarySoft: 'rgba(8, 122, 67, 0.20)',
    primaryBorder: Palette.greenDeep,

    secondary: '#38BDF8',
    secondarySoft: 'rgba(101, 207, 224, 0.15)',
    secondaryBorder: '#1F4759',
    secondaryDark: '#7DD3FC',

    accent: '#FB923C',
    accentSoft: 'rgba(255, 179, 138, 0.15)',
    accentBorder: '#5E311A',
    accentDark: '#FDBA74',

    emergency: '#EF4444',
    emergencySoft: 'rgba(217, 74, 74, 0.18)',
    emergencyBorder: 'rgba(217, 74, 74, 0.4)',
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
    textPlaceholder: '#71717A',
    textInverse: '#09090B',

    // Navegación
    tint: '#4ADE80',
    icon: Palette.textSecondaryDark,
    tabIconDefault: Palette.textSecondaryDark,
    tabIconSelected: '#4ADE80',
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
  // Accesos directos a familias y tamaños según DESIGN_SYSTEM.md
  family: {
    heading: FontFamily.headingBold,
    headingSemiBold: FontFamily.headingSemiBold,
    body: FontFamily.bodyRegular,
    bodySemiBold: FontFamily.bodySemiBold,
    bodyBold: FontFamily.bodyBold,
  },
  size: {
    display: 32,
    h1: 26,
    h2: 22,
    h3: 18,
    bodyLarge: 16,
    body: 15,
    bodySmall: 14,
    caption: 12,
    tiny: 10,
  },
  // Estilos preconfigurados
  display: {
    fontFamily: FontFamily.headingBold,
    fontSize: 32,
    lineHeight: 38,
  },
  h1: {
    fontFamily: FontFamily.headingBold,
    fontSize: 26,
    lineHeight: 32,
  },
  h2: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  tiny: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    lineHeight: 14,
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

/**
 * ☁️ Sombras Multiplataforma
 */
export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 10,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.10)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.18)',
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
