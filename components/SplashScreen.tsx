
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const { width: windowWidth } = useWindowDimensions();

  // Instancias de Animated.Value
  const [spinAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(1));
  const [fadeAnim] = useState(() => new Animated.Value(1));

  // Referencia para controlar el temporizador
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Porcentaje visible de carga
  const [displayPercent, setDisplayPercent] = useState(1);

  useEffect(() => {
    // 1. Animación continua del indicador circular
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinLoop.start();

    // 2. Actualizar el porcentaje de carga
    const listenerId = progressAnim.addListener(({ value }) => {
      setDisplayPercent(Math.min(100, Math.max(1, Math.round(value))));
    });

    // 3. Animación de la barra de progreso
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    progressAnimation.start(({ finished }) => {
      if (finished) {
        setDisplayPercent(100);

        // 4. Pausa antes de ocultar la pantalla
        timerRef.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(({ finished: fadeFinished }) => {
            if (fadeFinished) {
              onFinish?.();
            }
          });
        }, 350);
      }
    });

    // 5. Limpiar animaciones y temporizadores
    return () => {
      spinLoop.stop();
      progressAnimation.stop();
      fadeAnim.stopAnimation();
      progressAnim.removeListener(listenerId);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fadeAnim, onFinish, progressAnim, spinAnim]);

  // Rotación del indicador circular
  const spinInterpolate = useMemo(
    () =>
      spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [spinAnim]
  );

  // Ancho animado de la barra
  const widthInterpolate = useMemo(
    () =>
      progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      }),
    [progressAnim]
  );

  // Ancho responsivo de la barra
  const barWidth = Math.min(220, Math.max(160, windowWidth * 0.52));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.centerContent}>
        {/* Nombre / Logo Huellap */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Huellap</Text>
        </View>

        {/* Fila de carga */}
        <View style={styles.loadingRow}>
          {/* Indicador circular giratorio */}
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
          />

          {/* Barra de progreso */}
          <View style={[styles.progressBarTrack, { width: barWidth }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: widthInterpolate },
              ]}
            />
          </View>

          {/* Porcentaje de carga */}
          <Text style={styles.percentText}>{displayPercent}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#04b639',
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'normal',
    }),
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.2,
    borderColor: '#E2E8F0',
    borderTopColor: '#04b639',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#04b639',
    borderRadius: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    minWidth: 42,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
