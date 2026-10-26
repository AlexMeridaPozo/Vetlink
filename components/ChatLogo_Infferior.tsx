import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  Platform,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/context/ThemeContext';

export function ChatLogo_Infferior() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) {
    return null;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/chat' as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.squareButton,
        isDark && styles.squareButtonDark,
        pressed && styles.buttonPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Abrir Asistente Chatbot"
      accessibilityHint="Despliega el chat con el asistente virtual VetLink"
    >
      {/* Icono con diseño de robot */}
      <MaterialCommunityIcons name="robot" size={32} color="#ffffff" />

      {/* Luz indicadora activa del asistente IA */}
      <View style={[styles.indicatorLight, isDark && styles.indicatorLightDark]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  squareButton: {
    position: 'absolute',
    left: 20,
    bottom: Platform.OS === 'ios' ? 100 : 76,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#04b639',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  squareButtonDark: {
    backgroundColor: '#04b639',
    borderColor: 'rgba(74, 222, 128, 0.55)',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
  indicatorLight: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#bbf7d0',
    borderWidth: 1.5,
    borderColor: '#04b639',
  },
  indicatorLightDark: {
    backgroundColor: '#86efac',
    borderColor: '#04b639',
  },
});
