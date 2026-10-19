import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { AnimatedSplashScreen } from '@/components/SplashScreen';
import { AuthProvider } from '@/context/AuthContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';

// Evita que el splash nativo desaparezca antes de que React Native esté listo
SplashScreen.preventAutoHideAsync().catch(() => { });

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const { isDark } = useAppTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { });
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(auth)">
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mascotas/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="recordatorios"
          options={{
            title: 'Recordatorios',
            headerShown: true,
            headerTintColor: isDark ? '#4ade80' : '#166534',
            headerStyle: { backgroundColor: isDark ? '#18181b' : '#f0fdf4' },
          }}
        />
        <Stack.Screen
          name="turnos"
          options={{
            title: 'Turnos',
            headerShown: true,
            headerTintColor: isDark ? '#4ade80' : '#166534',
            headerStyle: { backgroundColor: isDark ? '#18181b' : '#f0fdf4' },
          }}
        />
        <Stack.Screen
          name="veterinarias"
          options={{
            title: 'Veterinarias',
            headerShown: true,
            headerTintColor: isDark ? '#4ade80' : '#166534',
            headerStyle: { backgroundColor: isDark ? '#18181b' : '#f0fdf4' },
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showSplash && (
        <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}
