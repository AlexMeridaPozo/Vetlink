import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { OnboardingSlide, OnboardingSlideData } from './OnboardingSlide';
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
    image: require('@/assets/images/onboarding/slide1.png'),
  },
  {
    id: '2',
    title: 'Su salud, siempre a tu alcance',
    description:
      'Consultá los antecedentes, diagnósticos y tratamientos de tus mascotas en un solo lugar.',
    image: require('@/assets/images/onboarding/slide2.png'),
  },
  {
    id: '3',
    title: 'Conectá con tu veterinaria',
    description:
      'Mantené un seguimiento de las consultas y accedé a la información clínica de tus mascotas.',
    image: require('@/assets/images/onboarding/slide3.png'),
  },
];

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Barra Superior con Logo y Botón Saltar / Cerrar */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>Huellap</Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Saltar presentación"
        >
          <Text style={styles.skipText}>Saltar</Text>
          <MaterialIcons name="close" size={18} color="#64748B" style={styles.skipIcon} />
        </TouchableOpacity>
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
                    isActive ? styles.dotActive : styles.dotInactive,
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
            isLastSlide ? styles.actionButtonComenzar : styles.actionButtonSiguiente,
          ]}
          onPress={handleNext}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Comenzar' : 'Siguiente'}
        >
          <Text style={styles.actionButtonText}>
            {isLastSlide ? 'Comenzar' : 'Siguiente'}
          </Text>
          <MaterialIcons
            name={isLastSlide ? 'check' : 'arrow-forward'}
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
    backgroundColor: '#FFFFFF',
    zIndex: 99990,
    elevation: 99990,
    justifyContent: 'space-between',
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
  brandTitle: {
    fontSize: 22,
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
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    gap: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'normal',
    }),
  },
  skipIcon: {
    marginLeft: 1,
  },
  flatList: {
    flex: 1,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 22,
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
  dotActive: {
    width: 26,
    backgroundColor: '#04b639',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
    height: 54,
    borderRadius: 14,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonSiguiente: {
    backgroundColor: '#04b639',
  },
  actionButtonComenzar: {
    backgroundColor: '#04b639',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'normal',
    }),
  },
  actionButtonIcon: {
    marginLeft: 8,
  },
});
