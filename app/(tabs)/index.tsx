import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Toma el nombre del usuario registrado o 'Juan' por defecto
  const nombreUsuario = user?.displayName || 'Juan';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado con Saludo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>¡Hola, {nombreUsuario}! 👋</Text>
            <Text style={styles.subtitulo}>¿Qué necesitás hoy?</Text>
          </View>
        </View>

        {/* Tarjeta de mascotas / perfiles */}
        <Pressable
          style={({ pressed }) => [styles.cardMascotas, pressed && styles.botonPresionado]}
          onPress={() => router.push('/(tabs)/mascotas')}
          accessibilityRole="button"
          accessibilityLabel="Ver mis mascotas"
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <Ionicons name="paw" size={24} color="#15803d" />
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardNumero}>2</Text>
            </View>
          </View>

          <Text style={styles.cardTitulo}>Mis mascotas</Text>
          <Text style={styles.cardDetalle}>2 mascotas registradas</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardLink}>Ver perfiles y detalles</Text>
            <Ionicons name="chevron-forward" size={16} color="#16a34a" />
          </View>
        </Pressable>

        {/* Título de accesos rápidos */}
        <Text style={styles.seccionTitulo}>Servicios y Accesos</Text>

        {/* Grilla de 4 botones */}
        <View style={styles.grid}>
          <BotonMenu
            titulo="Recordatorios"
            subtitulo="Avisos importantes"
            icono="notifications-outline"
            onPress={() => router.push('/recordatorios')}
          />
          <BotonMenu
            titulo="Turnos"
            subtitulo="Próximos y anteriores"
            icono="calendar-outline"
            onPress={() => router.push('/turnos')}
          />
          <BotonMenu
            titulo="Veterinarias"
            subtitulo="Cercanas a vos"
            icono="medkit-outline"
            onPress={() => router.push('/veterinarias')}
          />
          <BotonMenu
            titulo="Tienda"
            subtitulo="Productos para mascotas"
            icono="bag-handle-outline"
            onPress={() => router.push('/(tabs)/tienda')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente reutilizable para los botones del menú
function BotonMenu({
  titulo,
  subtitulo,
  icono,
  onPress,
}: {
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={styles.botonIconoContainer}>
        <Ionicons name={icono} size={22} color="#15803d" />
      </View>
      <Text style={styles.botonTitulo}>{titulo}</Text>
      <Text style={styles.botonSubtitulo}>{subtitulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  saludo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitulo: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 4,
  },
  cardMascotas: {
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrapper: {
    backgroundColor: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: '#22c55e',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardTitulo: {
    fontWeight: '700',
    fontSize: 18,
    color: '#14532d',
  },
  cardDetalle: {
    color: '#166534',
    marginTop: 4,
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  cardLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
    marginRight: 4,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boton: {
    width: '48%',
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  botonPresionado: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  botonIconoContainer: {
    backgroundColor: '#dcfce7',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonTitulo: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1f2937',
  },
  botonSubtitulo: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
