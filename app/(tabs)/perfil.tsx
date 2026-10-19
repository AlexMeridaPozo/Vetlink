import { auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, isVeterinario } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/register');
    } catch (error) {
      console.log('Error cerrando sesión:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      {/* Header con botón de tema */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.titulo, isDark && styles.textDark]}>Mi Perfil</Text>
          <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>Información de tu cuenta y preferencias</Text>
        </View>
        <ThemeToggleButton />
      </View>

      {/* Tarjeta de perfil */}
      <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
        <View style={[styles.avatar, isDark && styles.avatarDark]}>
          <Ionicons name="person" size={40} color="#04b639" />
        </View>
        <Text style={[styles.userName, isDark && styles.textDark]}>{user?.displayName || 'Usuario VetLink'}</Text>
        <Text style={[styles.userEmail, isDark && styles.subtituloDark]}>{user?.email || 'correo@ejemplo.com'}</Text>

        <View style={[styles.roleBadge, isVeterinario ? (isDark ? styles.roleBadgeVetDark : styles.roleBadgeVet) : (isDark ? styles.roleBadgeOwnerDark : styles.roleBadgeOwner)]}>
          <Ionicons
            name={isVeterinario ? 'shield-checkmark' : 'paw'}
            size={14}
            color={isVeterinario ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#60a5fa' : '#2563eb')}
          />
          <Text style={[styles.roleBadgeText, isVeterinario ? (isDark ? styles.roleTextVetDark : styles.roleTextVet) : (isDark ? styles.roleTextOwnerDark : styles.roleTextOwner)]}>
            {isVeterinario ? 'Veterinario Autorizado' : 'Propietario / Tutor'}
          </Text>
        </View>
      </View>

      {/* Opciones y Preferencias */}
      <View style={styles.optionsContainer}>
        {/* Fila Selector Modo Oscuro / Claro */}
        <View style={[styles.settingRow, isDark && styles.settingRowDark]}>
          <View style={[styles.settingIconCircle, isDark && styles.settingIconCircleDark]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={isDark ? '#facc15' : '#04b639'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, isDark && styles.textDark]}>Modo Oscuro</Text>
            <Text style={[styles.settingSubtitle, isDark && styles.subtituloDark]}>
              {isDark ? 'Aspecto oscuro activado' : 'Aspecto claro activado'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#e2e8f0', true: '#15803d' }}
            thumbColor={isDark ? '#4ade80' : '#ffffff'}
          />
        </View>

        {/* Fila Asistente IA */}
        <TouchableOpacity
          style={[styles.settingRow, isDark && styles.settingRowDark]}
          onPress={() => router.push('/chat' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.settingIconCircle, isDark && styles.settingIconCircleDark]}>
            <Ionicons
              name="sparkles"
              size={20}
              color="#04b639"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, isDark && styles.textDark]}>Asistente Virtual VetLink</Text>
            <Text style={[styles.settingSubtitle, isDark && styles.subtituloDark]}>
              Consultas con IA sobre nutrición y cuidados
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
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
  profileCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 24,
    shadowColor: '#04b639',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    shadowOpacity: 0.3,
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
  avatarDark: {
    backgroundColor: '#064e3b',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleBadgeVet: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  roleBadgeVetDark: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#047857',
  },
  roleBadgeOwner: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  roleBadgeOwnerDark: {
    backgroundColor: '#1e3a5f',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleTextVet: {
    color: '#15803d',
  },
  roleTextVetDark: {
    color: '#86efac',
  },
  roleTextOwner: {
    color: '#1d4ed8',
  },
  roleTextOwnerDark: {
    color: '#93c5fd',
  },
  optionsContainer: {
    marginTop: 8,
    gap: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  settingRowDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconCircleDark: {
    backgroundColor: '#27272a',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonDark: {
    backgroundColor: '#271919',
    borderColor: '#451a1a',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
