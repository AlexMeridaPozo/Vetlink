import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { FontFamily, Palette, Radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

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
  const { isDark } = useAppTheme();

  // Dimensiones responsivas equilibradas para teléfonos móviles
  const imageSize = Math.min(300, Math.max(200, windowWidth * 0.70));
  const cardHeight = Math.min(340, Math.max(240, windowHeight * 0.40));

  return (
    <View style={[styles.slideContainer, { width: windowWidth }]}>
      {/* Contenedor visual de la ilustración */}
      <View style={[styles.illustrationCard, { width: windowWidth - 48, height: cardHeight }]}>
        <View
          style={[
            styles.illustrationBackdrop,
            isDark ? styles.illustrationBackdropDark : styles.illustrationBackdropLight,
          ]}
        >
          <Image
            source={item.image}
            style={[styles.illustrationImage, { width: imageSize, height: imageSize }]}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bloque de texto informativo centrado con tipografía de HuellApp */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.titleLight]}>
          {item.title}
        </Text>
        <Text style={[styles.description, isDark ? styles.textMutedDark : styles.descriptionLight]}>
          {item.description}
        </Text>
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
    marginBottom: 20,
  },
  illustrationBackdrop: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 12,
  },
  illustrationBackdropLight: {
    backgroundColor: '#EAF8F0',
    borderColor: '#BCEAD0',
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  illustrationBackdropDark: {
    backgroundColor: '#072417',
    borderColor: '#174E33',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  illustrationImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  title: {
    width: '100%',
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  titleLight: {
    color: '#0A3B22',
  },
  description: {
    width: '100%',
    fontSize: 15,
    fontFamily: FontFamily.bodyRegular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  descriptionLight: {
    color: '#5A6E65',
  },
  textDark: {
    color: '#F4F4F5',
  },
  textMutedDark: {
    color: '#A1A1AA',
  },
});
