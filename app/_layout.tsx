import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
      </ThemeProvider>
    </AuthProvider>
  );
}
