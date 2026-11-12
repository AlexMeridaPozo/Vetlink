import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, FontFamily, Radius } from '@/constants/theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const { width: windowWidth } = useWindowDimensions();

  const [spinAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(1));
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [displayPercent, setDisplayPercent] = useState(1);

  useEffect(() => {
    // 1. Animación continua de rotación para el indicador circular
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    // 2. Escuchar el progreso (1% -> 100%)
    const listenerId = progressAnim.addListener(({ value }) => {
      setDisplayPercent(Math.min(100, Math.max(1, Math.round(value))));
    });

    // 3. Animación fluida de la barra de progreso
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    progressAnimation.start(({ finished }) => {
      if (finished) {
        setDisplayPercent(100);

        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            onFinish?.();
          });
        }, 350);

        return () => clearTimeout(timer);
      }
    });

    return () => {
      spinLoop.stop();
      progressAnim.removeListener(listenerId);
    };
  }, [fadeAnim, onFinish, progressAnim, spinAnim]);

  const spinInterpolate = useMemo(
    () =>
      spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [spinAnim]
  );

  const widthInterpolate = useMemo(
    () =>
      progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      }),
    [progressAnim]
  );

  const barWidth = Math.min(220, Math.max(160, windowWidth * 0.52));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.centerContent}>
        {/* Ícono de Huella con anillo */}
        <View style={styles.logoBadge}>
          <Ionicons name="paw-outline" size={44} color={Palette.greenPrimary} />
        </View>

        {/* Nombre / Logo HuellaApp con estilo de marca (Huella en verde, App en carbón oscuro) */}
        <View style={styles.logoRow}>
          <Text style={styles.logoTextGreen}>Huella</Text>
          <Text style={styles.logoTextDark}>App</Text>
        </View>

        <Text style={styles.slogan}>Cuidado y bienestar animal</Text>

        {/* Fila de carga: Indicador circular + Barra de progreso + Porcentaje */}
        <View style={styles.loadingRow}>
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
          />

          <View style={[styles.progressBarTrack, { width: barWidth }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: widthInterpolate },
              ]}
            />
          </View>

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
    backgroundColor: Palette.backgroundLight,
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
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoTextGreen: {
    fontFamily: FontFamily.headingBold,
    fontSize: 40,
    fontWeight: '800',
    color: Palette.greenPrimary,
    letterSpacing: -0.5,
  },
  logoTextDark: {
    fontFamily: FontFamily.headingBold,
    fontSize: 40,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.5,
  },
  slogan: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 36,
    letterSpacing: 0.2,
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
    borderColor: Palette.borderLight,
    borderTopColor: Palette.greenPrimary,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: Palette.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Palette.greenPrimary,
    borderRadius: 4,
  },
  percentText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    minWidth: 42,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
