import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';

export default function TiendaScreen() {
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, isDark && styles.textDark]}>Tienda</Text>
          <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>Alimentos, accesorios y farmacia</Text>
        </View>
        <ThemeToggleButton />
      </View>

      <View style={styles.placeholderContainer}>
        <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
          <Ionicons name="bag-handle" size={48} color="#04b639" />
        </View>
        <Text style={[styles.placeholderTitle, isDark && styles.textDark]}>Próximamente: Catálogo de Productos</Text>
        <Text style={[styles.placeholderText, isDark && styles.subtituloDark]}>
          Podrás explorar productos recomendados, comparar precios y realizar compras para tus mascotas.
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
  containerDark: {
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitulo: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  subtituloDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
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
  iconCircleDark: {
    backgroundColor: '#064e3b',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
