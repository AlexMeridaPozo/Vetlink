import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export interface OnboardingSlideData {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

interface OnboardingSlideProps {
  item: OnboardingSlideData;
}

export function OnboardingSlide({ item }: OnboardingSlideProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Cálculo responsivo de dimensiones
  const imageSize = Math.min(310, Math.max(220, windowWidth * 0.72));
  const cardHeight = Math.min(340, Math.max(240, windowHeight * 0.42));

  return (
    <View style={[styles.slideContainer, { width: windowWidth }]}>
      {/* Contenedor visual de la ilustración con marco estético */}
      <View style={[styles.illustrationCard, { width: windowWidth - 48, height: cardHeight }]}>
        <View style={styles.illustrationBackdrop}>
          <Image
            source={item.image}
            style={[styles.illustrationImage, { width: imageSize, height: imageSize }]}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bloque de texto informativo centrado */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustrationBackdrop: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 12,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  illustrationImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'normal',
    }),
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 320,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      default: 'normal',
    }),
  },
});
