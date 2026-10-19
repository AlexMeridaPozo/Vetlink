import { Platform } from 'react-native';

const tintColorLight = '#04b639';
const tintColorDark = '#4ade80';

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#ffffff',
    surface: '#f0fdf4',
    surfaceSubtle: '#f8fafc',
    border: '#dcfce7',
    borderSubtle: '#e2e8f0',
    primary: '#04b639',
    primaryDark: '#15803d',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    background: '#09090b',
    surface: '#18181b',
    surfaceSubtle: '#27272a',
    border: '#27272a',
    borderSubtle: '#3f3f46',
    primary: '#04b639',
    primaryDark: '#4ade80',
    tint: tintColorDark,
    icon: '#a1a1aa',
    tabIconDefault: '#71717a',
    tabIconSelected: tintColorDark,
  },
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
