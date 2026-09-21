import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MapaScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mapa</Text>
        <Text style={styles.subtitulo}>Veterinarias y servicios cercanos</Text>
      </View>

      <View style={styles.placeholderContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="map" size={48} color="#22c55e" />
        </View>
        <Text style={styles.placeholderTitle}>Próximamente: Mapa Interactivo</Text>
        <Text style={styles.placeholderText}>
          Encontrarás clínicas veterinarias, farmacias y guarderías geolocalizadas cerca de tu ubicación.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitulo: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
