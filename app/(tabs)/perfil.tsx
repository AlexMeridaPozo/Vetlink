import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/register');
    } catch (error) {
      console.log('Error cerrando sesión:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Perfil</Text>
        <Text style={styles.subtitulo}>Información de tu cuenta</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#15803d" />
        </View>
        <Text style={styles.userName}>{user?.displayName || 'Usuario VetLink'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'correo@ejemplo.com'}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  optionsContainer: {
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
