import { useAppTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  // Altura dinámica de la barra de pestañas para sincronizar los límites del botón flotante
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
  const currentTabHeight = 60 + safeBottom + (Platform.OS === 'android' && insets.bottom > 0 ? 4 : 0);

  // Límites seguros dentro de la pantalla
  const minX = MARGIN;
  const maxX = Math.max(MARGIN, screenWidth - BUTTON_SIZE - MARGIN);
  const minY = Math.max(10, insets.top + 10);
  const maxY = Math.max(
    minY,
    screenHeight - currentTabHeight - BUTTON_SIZE - 12
  );

  // Posición inicial: inferior izquierda por encima de la barra de pestañas
  const initialX = minX + 4;
  const initialY = Math.max(
    minY,
    screenHeight - currentTabHeight - BUTTON_SIZE - 20
  );

  const [pan] = useState(() => new Animated.ValueXY({ x: initialX, y: initialY }));
  const [scale] = useState(() => new Animated.Value(1));
  const currentPos = useRef({ x: initialX, y: initialY });
  const dragStartPos = useRef({ x: initialX, y: initialY });
  const boundsRef = useRef({ minX, maxX, minY, maxY });

  // Mantener actualizados los límites en el ref
  useEffect(() => {
    boundsRef.current = { minX, maxX, minY, maxY };
  }, [minX, maxX, minY, maxY]);

  // Actualizar referencia de coordenadas actuales
  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      currentPos.current = value;
    });
    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  // Si cambian las dimensiones de pantalla o insets, asegurar que el botón permanezca visible
  useEffect(() => {
    const { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY } = boundsRef.current;
    const clampedX = Math.min(Math.max(currentPos.current.x, bMinX), bMaxX);
    const clampedY = Math.min(Math.max(currentPos.current.y, bMinY), bMaxY);

    if (clampedX !== currentPos.current.x || clampedY !== currentPos.current.y) {
      currentPos.current = { x: clampedX, y: clampedY };
      pan.setValue({ x: clampedX, y: clampedY });
    }
  }, [screenWidth, screenHeight, insets.top, insets.bottom, pan]);

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

  const handlePress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    router.push('/chat' as any);
  }, [router]);

  const handleGestureEnd = useCallback((gestureState?: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
      friction: 5,
    }).start();

    const dx = gestureState?.dx ?? 0;
    const dy = gestureState?.dy ?? 0;
    const dragDistance = Math.hypot(dx, dy);

    // Si el desplazamiento fue mínimo (< 7px), interpretar como toque y abrir el chat
    if (dragDistance < 7) {
      handlePress();
      return;
    }

    // Feedback háptico al soltar tras arrastre
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    const { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY } = boundsRef.current;
    const clampedX = Math.min(Math.max(currentPos.current.x, bMinX), bMaxX);
    const clampedY = Math.min(Math.max(currentPos.current.y, bMinY), bMaxY);

    Animated.spring(pan, {
      toValue: { x: clampedX, y: clampedY },
      useNativeDriver: false,
      friction: 6,
      tension: 40,
    }).start();
  }, [handlePress, pan, scale]);

  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragStartPos.current = {
          x: currentPos.current.x,
          y: currentPos.current.y,
        };

        Animated.spring(scale, {
          toValue: 1.12,
          useNativeDriver: false,
          friction: 5,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const { minX: bMinX, maxX: bMaxX, minY: bMinY, maxY: bMaxY } = boundsRef.current;
        const targetX = dragStartPos.current.x + gestureState.dx;
        const targetY = dragStartPos.current.y + gestureState.dy;

        // Limitar en tiempo real para que NUNCA salga de la pantalla durante el arrastre
        // Un leve margen elástico (6px) para dar sensación orgánica sin perderse jamás
        const elastic = 6;
        const boundedX = Math.min(Math.max(targetX, bMinX - elastic), bMaxX + elastic);
        const boundedY = Math.min(Math.max(targetY, bMinY - elastic), bMaxY + elastic);

        pan.setValue({ x: boundedX, y: boundedY });
      },
      onPanResponderRelease: (_, gestureState) => {
        handleGestureEnd(gestureState);
      },
      onPanResponderTerminate: (_, gestureState) => {
        handleGestureEnd(gestureState);
      },
    })
  );

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
