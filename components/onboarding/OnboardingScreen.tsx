import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { OnboardingSlide, OnboardingSlideData } from './OnboardingSlide';
import { FontFamily, Palette, Radius } from '@/constants/theme';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { saveOnboardingCompleted } from '@/services/onboardingService';

interface OnboardingScreenProps {
  onFinish?: () => void;
}

const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: '1',
    title: 'Todo sobre tus mascotas',
    description:
      'Encontrá y gestioná la información de tus mascotas de manera sencilla, desde un solo lugar.',
    image: require('../../assets/images/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: 'Su salud, siempre a tu alcance',
    description:
      'Consultá los antecedentes, diagnósticos y tratamientos de tus mascotas en un solo lugar.',
    image: require('../../assets/images/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'Conectá con tu veterinaria',
    description:
      'Mantené un seguimiento de las consultas y accedé a la información clínica de tus mascotas.',
    image: require('../../assets/images/onboarding/slide3.png'),
  },
];

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlideData>>(null);

  // Animación de desvanecimiento suave para el cierre
  const [fadeAnim] = useState(() => new Animated.Value(1));

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  // Actualiza el índice activo cuando termina el desplazamiento por inercia
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / windowWidth);
    if (newIndex >= 0 && newIndex < ONBOARDING_SLIDES.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Finaliza u omite el Onboarding, persiste en AsyncStorage y oculta la pantalla
  const handleDismiss = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}

    await saveOnboardingCompleted();

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
  };

  // Avanza al siguiente slide o completa si está en el último
  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      handleDismiss();
    }
  };

  // Salta directamente a una diapositiva al pulsar sobre su indicador
  const handleDotPress = (index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        { opacity: fadeAnim },
      ]}
    >
      {/* Barra Superior con Logo, Toggle de Tema y Botón Saltar */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingHorizontal: 20,
          },
        ]}
      >
        <View style={styles.brandContainer}>
          <Ionicons
            name="paw"
            size={20}
            color={Palette.greenPrimary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.brandTitleGreen}>Sobre </Text>
          <Text style={styles.brandTitleLime}>Huellapp</Text>
        </View>

        <View style={styles.headerRightActions}>
          <ThemeToggleButton style={styles.themeToggle} />

          <TouchableOpacity
            style={[styles.skipButton, isDark && styles.skipButtonDark]}
            onPress={handleDismiss}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Saltar presentación"
          >
            <Text style={[styles.skipText, isDark && styles.skipTextDark]}>Saltar</Text>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={isDark ? '#A1A1AA' : '#5A6E65'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista Deslizable Horizontal */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, index) => ({
          length: windowWidth,
          offset: windowWidth * index,
          index,
        })}
        style={styles.flatList}
      />

      {/* Controles Inferiores: Indicadores de puntos y Botón Siguiente / Comenzar */}
      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 16,
            paddingHorizontal: 24,
          },
        ]}
      >
        {/* Puntos de progreso (Dots) */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={`Ir a la pantalla ${index + 1}`}
              >
                <View
                  style={[
                    styles.dot,
                    isDark
                      ? isActive
                        ? styles.dotActiveDark
                        : styles.dotInactiveDark
                      : isActive
                      ? styles.dotActiveLight
                      : styles.dotInactiveLight,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón Principal de Acción (Siguiente / Comenzar) */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDark ? styles.actionButtonDark : styles.actionButtonLight,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Comenzar a usar HuellApp' : 'Siguiente pantalla'}
        >
          <Text style={styles.actionButtonText}>
            {isLastSlide ? 'Comenzar' : 'Siguiente'}
          </Text>
          <Ionicons
            name={isLastSlide ? 'checkmark-circle' : 'arrow-forward'}
            size={20}
            color="#FFFFFF"
            style={styles.actionButtonIcon}
          />
        </TouchableOpacity>
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
    zIndex: 99990,
    elevation: 99990,
    justifyContent: 'space-between',
  },
  containerLight: {
    backgroundColor: Palette.backgroundLight,
  },
  containerDark: {
    backgroundColor: Palette.backgroundDark,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleGreen: {
    fontSize: 22,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    color: Palette.greenDeep,
    letterSpacing: -0.4,
  },
  brandTitleLime: {
    fontSize: 22,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    color: Palette.greenPrimary,
    letterSpacing: -0.4,
    paddingRight: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    marginRight: 2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F0',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BCEAD0',
    gap: 3,
  },
  skipButtonDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  skipText: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: '600',
    color: '#087A43',
    paddingHorizontal: 2,
  },
  skipTextDark: {
    color: '#A1A1AA',
  },
  flatList: {
    flex: 1,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActiveLight: {
    width: 26,
    backgroundColor: Palette.greenDeep,
  },
  dotInactiveLight: {
    width: 8,
    backgroundColor: '#BCEAD0',
  },
  dotActiveDark: {
    width: 26,
    backgroundColor: '#4ade80',
  },
  dotInactiveDark: {
    width: 8,
    backgroundColor: '#27272A',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
    height: 52,
    borderRadius: Radius.lg,
  },
  actionButtonLight: {
    backgroundColor: Palette.greenDeep,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonDark: {
    backgroundColor: '#16a34a',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.bodyBold,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 4,
  },
  actionButtonIcon: {
    marginLeft: 8,
  },
});
