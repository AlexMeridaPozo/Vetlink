import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme as useRNColorScheme, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Palette, Radius } from '@/constants/theme';

export type ColorTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ColorTheme;
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
}

const THEME_STORAGE_KEY = '@huellapp_color_theme_v2';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>('light');

  // Cargar preferencia guardada al iniciar (inicia en light mode por defecto)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (saved === 'light' || saved === 'dark')) {
          setThemeState(saved);
        }
      } catch (err) {
        console.warn('[ThemeContext] Error al cargar tema:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = useCallback(async (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('[ThemeContext] Error al guardar tema:', err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Ignorar en plataformas sin hápticos
    }
    const nextTheme: ColorTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const value = useMemo(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark, colors, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      isDark: false,
      colors: Colors.light,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}

/**
 * Botón para alternar entre tema claro y oscuro en encabezados
 * con icono Line Art outline de contorno unificado.
 */
export function ThemeToggleButton({ style }: { style?: any }) {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.toggleBtn, isDark ? styles.toggleBtnDark : styles.toggleBtnLight, style]}
      onPress={toggleTheme}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      accessibilityHint="Alterna entre el tema visual claro y oscuro de la aplicación"
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={18}
        color={isDark ? '#FACC15' : Palette.greenDeep}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toggleBtnLight: {
    backgroundColor: Palette.greenSoft,
    borderColor: Palette.greenBorder,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
