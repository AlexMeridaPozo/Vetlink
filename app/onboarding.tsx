import React from 'react';
import { router } from 'expo-router';
import { OnboardingScreen } from '@/components/OnboardingScreen';

export default function OnboardingRoute() {
  const handleFinish = () => {
    router.replace('/(auth)/login');
  };

  return <OnboardingScreen onFinish={handleFinish} />;
}

