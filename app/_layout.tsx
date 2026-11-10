
import { Stack } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';

import { OnboardingScreen } from '@/components/OnboardingScreen';
import { AnimatedSplashScreen } from '@/components/SplashScreen';
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => { });

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const splashHandled = useRef(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { });
  }, []);

  const handleSplashFinish = () => {
    if (splashHandled.current) return;

    splashHandled.current = true;

    setShowSplash(false);
    setShowOnboarding(true);
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
  };

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <Stack initialRouteName="(auth)">
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="clinical-record"
            options={{
              headerShown: false,
              title: 'Ficha Clínica',
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />
        </Stack>

        <StatusBar style="auto" />

        {showSplash && (
          <AnimatedSplashScreen onFinish={handleSplashFinish} />
        )}

        {!showSplash && showOnboarding && (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        )}
      </ThemeProvider>
    </AuthProvider>
  );
}


