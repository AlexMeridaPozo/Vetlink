import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import {
  useFonts,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';

import { OnboardingScreen } from '@/components/OnboardingScreen';
import { AnimatedSplashScreen } from '@/components/SplashScreen';
import { AuthProvider } from '@/context/AuthContext';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { checkHasCompletedOnboarding } from '@/services/onboardingService';

// Evita que el splash nativo desaparezca antes de que React Native esté listo
SplashScreen.preventAutoHideAsync().catch(() => { });

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const { isDark, colors } = useAppTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const splashFinishedRef = useRef(false);

  const [fontsLoaded] = useFonts({
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  // 1. Verificar de inmediato si es la primera apertura para mostrar el Onboarding
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const completed = await checkHasCompletedOnboarding();
      if (isMounted) {
        setShowOnboarding(!completed);
        setOnboardingChecked(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  // 2. Solo ocultar el Splash cuando tanto la animación de carga como la verificación de Onboarding estén listas
  const handleSplashFinish = () => {
    splashFinishedRef.current = true;
    if (onboardingChecked) {
      setShowSplash(false);
    }
  };

  useEffect(() => {
    if (onboardingChecked && splashFinishedRef.current) {
      setShowSplash(false);
    }
  }, [onboardingChecked]);

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
  };

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(auth)">
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mascotas/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pet" options={{ headerShown: false }} />
        <Stack.Screen
          name="recordatorios"
          options={{
            title: 'Recordatorios',
            headerShown: true,
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontFamily: fontsLoaded ? 'Quicksand_700Bold' : undefined,
              fontSize: 18,
            },
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="turnos"
          options={{
            title: 'Turnos',
            headerShown: true,
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontFamily: fontsLoaded ? 'Quicksand_700Bold' : undefined,
              fontSize: 18,
            },
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="veterinarias"
          options={{
            title: 'Veterinarias',
            headerShown: true,
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontFamily: fontsLoaded ? 'Quicksand_700Bold' : undefined,
              fontSize: 18,
            },
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="beneficios"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showOnboarding && (
        <OnboardingScreen onFinish={handleOnboardingFinish} />
      )}
      {showSplash && (
        <AnimatedSplashScreen onFinish={handleSplashFinish} />
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
