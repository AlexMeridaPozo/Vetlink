import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// ==============================================================================
// NOTA DE DESARROLLO / TESTING DEL MVP:
// Esta sección permite acceder a la Ficha Clínica con datos mock locales y
// alternar entre rol Dueño y Veterinaria exclusivamente para probar y validar
// la interfaz durante el desarrollo del MVP.
// NO interfiere con el sistema real de autenticación de Firebase.
// ==============================================================================

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">VetLink</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Sección de pruebas para el MVP de Ficha Clínica */}
      <ThemedView style={styles.clinicalSection}>
        <View style={styles.clinicalHeaderRow}>
          <View style={styles.clinicalTitleGroup}>
            <MaterialIcons name="medical-services" size={24} color="#04b639" />
            <ThemedText type="subtitle">Ficha Clínica (MVP)</ThemedText>
          </View>
          <View style={styles.testTag}>
            <ThemedText style={styles.testTagText}>Testing</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.clinicalDescription}>
          Acceso rápido para probar los dos roles en la Ficha Clínica con datos locales:
        </ThemedText>

        {/* Mascota 1: Milo */}
        <View style={styles.petTestCard}>
          <View style={styles.petTestHeader}>
            <ThemedText style={{ fontSize: 20 }}>🐶</ThemedText>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ThemedText style={styles.petButtonTitle}>Milo (Canino)</ThemedText>
              <ThemedText style={styles.petButtonSubtitle}>Golden Retriever • 3 consultas</ThemedText>
            </View>
          </View>

          <View style={styles.roleActionRow}>
            <TouchableOpacity
              style={[styles.roleActionButton, styles.roleActionVet]}
              onPress={() => router.push({ pathname: '/clinical-record' as any, params: { petId: 'PET-001', role: 'veterinaria' } })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-hospital" size={14} color="#04b639" />
              <ThemedText style={styles.roleActionVetText}>Probar como Veterinaria</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleActionButton, styles.roleActionOwner]}
              onPress={() => router.push({ pathname: '/clinical-record' as any, params: { petId: 'PET-001', role: 'dueno' } })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={14} color="#2563EB" />
              <ThemedText style={styles.roleActionOwnerText}>Probar como Dueño</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mascota 2: Luna */}
        <View style={styles.petTestCard}>
          <View style={styles.petTestHeader}>
            <ThemedText style={{ fontSize: 20 }}>🐱</ThemedText>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ThemedText style={styles.petButtonTitle}>Luna (Felino)</ThemedText>
              <ThemedText style={styles.petButtonSubtitle}>Siamés • 1 consulta</ThemedText>
            </View>
          </View>

          <View style={styles.roleActionRow}>
            <TouchableOpacity
              style={[styles.roleActionButton, styles.roleActionVet]}
              onPress={() => router.push({ pathname: '/clinical-record' as any, params: { petId: 'PET-002', role: 'veterinaria' } })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-hospital" size={14} color="#04b639" />
              <ThemedText style={styles.roleActionVetText}>Probar como Veterinaria</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleActionButton, styles.roleActionOwner]}
              onPress={() => router.push({ pathname: '/clinical-record' as any, params: { petId: 'PET-002', role: 'dueno' } })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={14} color="#2563EB" />
              <ThemedText style={styles.roleActionOwnerText}>Probar como Dueño</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ThemedText style={styles.testDisclaimer}>
          * Los botones de selección de rol son exclusivamente para pruebas de desarrollo del MVP y no representan el sistema definitivo de permisos.
        </ThemedText>
      </ThemedView>


      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  clinicalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clinicalDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  roleSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  roleSwitchVet: {
    backgroundColor: '#F0FDF4',
    borderColor: '#04b639',
  },
  roleSwitchOwner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleSwitchTextVet: {
    color: '#04b639',
  },
  roleSwitchTextOwner: {
    color: '#2563EB',
  },
  petButtonsRow: {
    gap: 8,
    marginTop: 4,
  },
  petAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  petButtonIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  petButtonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  petButtonSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
});

