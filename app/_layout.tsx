import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { AnimatedSplashScreen } from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';

// Evita que el splash nativo desaparezca antes de que React Native esté listo
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Oculta el splash screen nativo de Expo una vez que el componente se monta
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(auth)">
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mascotas/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="recordatorios"
            options={{
              title: 'Recordatorios',
              headerShown: true,
              headerTintColor: '#166534',
              headerStyle: { backgroundColor: '#f0fdf4' },
            }}
          />
          <Stack.Screen
            name="turnos"
            options={{
              title: 'Turnos',
              headerShown: true,
              headerTintColor: '#166534',
              headerStyle: { backgroundColor: '#f0fdf4' },
            }}
          />
          <Stack.Screen
            name="veterinarias"
            options={{
              title: 'Veterinarias',
              headerShown: true,
              headerTintColor: '#166534',
              headerStyle: { backgroundColor: '#f0fdf4' },
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        {showSplash && (
          <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </ThemeProvider>
    </AuthProvider>
  );
}

