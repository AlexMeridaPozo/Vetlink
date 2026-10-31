import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export type SosIconVariant = 'custom' | 'sos-badge' | 'phone-alert' | 'emergency';

interface SosIconProps {
  color?: string;
  focused?: boolean;
  size?: number;
  variant?: SosIconVariant;
}

/**
 * Componente de ícono de Emergencia SOS para el menú / barra inferior.
 * Inspirado en el diseño de teléfono + indicador de llamada urgente (estilo 911 / SOS).
 */
export function SosIcon({
  color,
  focused = false,
  size = 24,
  variant = 'custom',
}: SosIconProps) {
  // Color distintivo rojo de urgencias
  const alertColor = focused ? '#dc2626' : (color || '#ef4444');

  // Opción 2: Símbolo estándar de SOS
  if (variant === 'sos-badge') {
    return <MaterialIcons name="sos" size={size + 4} color={alertColor} />;
  }

  // Opción 3: Auricular con signo de alerta
  if (variant === 'phone-alert') {
    return <MaterialCommunityIcons name="phone-alert" size={size} color={alertColor} />;
  }

  // Opción 4: Estrella / Cruz médica de emergencia
  if (variant === 'emergency') {
    return <MaterialIcons name="emergency" size={size + 2} color={alertColor} />;
  }

  // Opción 1 (Por defecto): Auricular inclinado con globo/burbuja de auxilio "SOS"
  return (
    <View style={styles.container}>
      <Ionicons
        name={focused ? 'call' : 'call-outline'}
        size={20}
        color={alertColor}
        style={styles.phoneIcon}
      />
      <View
        style={[
          styles.badge,
          {
            backgroundColor: focused ? alertColor : 'rgba(239, 68, 68, 0.12)',
            borderColor: alertColor,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: focused ? '#ffffff' : alertColor },
          ]}
        >
          SOS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  phoneIcon: {
    position: 'absolute',
    left: 1,
    bottom: 1,
    transform: [{ rotate: '-12deg' }],
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: 0,
    borderWidth: 1.2,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    minWidth: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
