import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme as useRNColorScheme, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export type ColorTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ColorTheme;
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
}

const THEME_STORAGE_KEY = '@vetlink_color_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [theme, setThemeState] = useState<ColorTheme>(systemScheme === 'dark' ? 'dark' : 'light');

  // Cargar preferencia guardada al iniciar
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
    // Fallback seguro si se usa fuera del provider
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
 * Botón flotante o de encabezado para alternar rápidamente entre modo claro y oscuro.
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
        name={isDark ? 'sunny' : 'moon'}
        size={18}
        color={isDark ? '#facc15' : '#04b639'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toggleBtnLight: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
});
