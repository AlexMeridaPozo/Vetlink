import { useAppTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  PanResponder,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BUTTON_SIZE = 58;
const MARGIN = 16;

export function ChatLogo_Infferior() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Límites seguros dentro de la pantalla
  const minX = MARGIN;
  const maxX = Math.max(MARGIN, screenWidth - BUTTON_SIZE - MARGIN);
  const minY = Math.max(10, insets.top + 10);
  const maxY = Math.max(
    minY,
    screenHeight - (Platform.OS === 'ios' ? 105 : 85) - BUTTON_SIZE - (insets.bottom > 0 ? insets.bottom : 0)
  );

  // Posición inicial: inferior izquierda por encima de la barra de pestañas
  const initialX = minX + 4;
  const initialY = Math.max(
    minY,
    screenHeight - (Platform.OS === 'ios' ? 165 : 145) - BUTTON_SIZE
  );

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const currentPos = useRef({ x: initialX, y: initialY });
  const scale = useRef(new Animated.Value(1)).current;

  // Actualizar referencia de coordenadas actuales
  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      currentPos.current = value;
    });
    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  // Listener para ocultar cuando el teclado está activo
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

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    router.push('/chat' as any);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
        pan.setValue({ x: 0, y: 0 });

        Animated.spring(scale, {
          toValue: 1.12,
          useNativeDriver: false,
          friction: 5,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 5,
        }).start();

        const dragDistance = Math.hypot(gestureState.dx, gestureState.dy);

        // Si el desplazamiento fue mínimo (< 7px), interpretar como toque y abrir el chat
        if (dragDistance < 7) {
          handlePress();
          return;
        }

        // Si fue arrastre táctil: feedback táctil y ajustar dentro de los límites de la pantalla
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch {}

        const rawX = currentPos.current.x;
        const rawY = currentPos.current.y;

        const clampedX = Math.min(Math.max(rawX, minX), maxX);
        const clampedY = Math.min(Math.max(rawY, minY), maxY);

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 6,
          tension: 40,
        }).start();
      },
    })
  ).current;

  if (keyboardVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.squareButton,
        isDark && styles.squareButtonDark,
        {
          transform: [...pan.getTranslateTransform(), { scale }],
        },
      ]}
      {...panResponder.panHandlers}
      accessibilityRole="button"
      accessibilityLabel="Abrir Asistente Chatbot"
      accessibilityHint="Toca para abrir o arrastra con el dedo para moverlo por la pantalla"
    >
      {/* Icono con diseño de robot */}
      <MaterialCommunityIcons name="robot" size={32} color="#ffffff" />

      {/* Luz indicadora activa del asistente IA */}
      <View style={[styles.indicatorLight, isDark && styles.indicatorLightDark]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  squareButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
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
