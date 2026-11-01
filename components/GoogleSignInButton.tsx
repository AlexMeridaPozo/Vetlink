import { useAppTheme } from '@/context/ThemeContext';
import { signInWithGoogle } from '@/services/googleAuthService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { User } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface GoogleSignInButtonProps {
  label?: string;
  onSuccess?: (user: User, isNewUser?: boolean) => void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({
  label = 'Continuar con Google',
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { isDark } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || disabled) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } catch {}
        onSuccess?.(result.user, result.isNewUser);
      } else if (result.error) {
        // Si el usuario canceló la ventana, no mostramos alerta invasiva
        if (!result.error.toLowerCase().includes('canceló')) {
          Alert.alert('Google Sign-In', result.error);
        }
        onError?.(result.error);
      }
    } catch (err: any) {
      const msg = err.message || 'Error al autenticar con Google';
      Alert.alert('Error', msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        isDark && styles.googleButtonDark,
        (loading || disabled) && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? '#4ade80' : '#04b639'} size="small" />
      ) : (
        <>
          <View style={styles.iconCircle}>
            <Ionicons name="logo-google" size={19} color="#ea4335" />
          </View>
          <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  googleButtonDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    shadowOpacity: 0.3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  buttonTextDark: {
    color: '#f4f4f5',
  },
});
