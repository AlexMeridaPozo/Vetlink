import { FriendlyPetBanner } from '@/components/FriendlyPetBanner';
import { auth, db } from '@/config/firebase';
import { FontFamily, Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, profile, isVeterinario, refreshProfile } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const [changingRole, setChangingRole] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir de tu cuenta en HuellaApp?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/(auth)/login');
            } catch (error: any) {
              console.error('Error cerrando sesión:', error);
              Alert.alert('Error', error?.message || 'No se pudo cerrar la sesión. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const handleToggleRol = async () => {
    if (!user) return;
    const nuevoRol = isVeterinario ? 'propietario' : 'veterinario';
    const nuevoRolTexto = nuevoRol === 'veterinario' ? 'Profesional Veterinario' : 'Tutor / Propietario';

    Alert.alert(
      'Cambiar Modo de Cuenta',
      `¿Deseas cambiar tu rol actual a "${nuevoRolTexto}"? Podrás alternarlo nuevamente cuando lo desees para probar las funciones clínicas y de tutor.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar Rol',
          onPress: async () => {
            setChangingRole(true);
            try {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                rol: nuevoRol,
                updatedAt: new Date().toISOString(),
              });
              await refreshProfile();
              Alert.alert(
                'Rol Actualizado',
                `Tu perfil ahora está configurado como ${nuevoRolTexto}. Las funciones y permisos se han adaptado.`
              );
            } catch (err: any) {
              console.error('Error actualizando rol de usuario:', err);
              Alert.alert('Error', err?.message || 'No se pudo actualizar el rol en Firestore.');
            } finally {
              setChangingRole(false);
            }
          },
        },
      ]
    );
  };

  const displayName = profile?.displayName || user?.displayName || (isVeterinario ? 'Profesional Veterinario' : 'Usuario HuellaApp');
  const email = profile?.email || user?.email || 'Sin correo asociado';
  const matricula = profile?.matricula;
  const especialidad = profile?.especialidad;
  const veterinaria = profile?.veterinaria;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con botón de tema */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.titulo, isDark && styles.textDark]}>
              {isVeterinario ? 'Perfil Profesional' : 'Mi Perfil'}
            </Text>
            <Text style={[styles.subtitulo, isDark && styles.subtituloDark]}>
              {isVeterinario ? 'Credenciales clínicas y preferencias' : 'Información de tu cuenta y preferencias'}
            </Text>
          </View>
          <ThemeToggleButton />
        </View>

        {/* Tarjeta de perfil */}
        <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
          <View style={[styles.avatar, isDark && styles.avatarDark]}>
            <Ionicons
              name={isVeterinario ? 'medkit-outline' : 'person-outline'}
              size={38}
              color={Palette.greenDeep}
            />
          </View>
          <Text style={[styles.userName, isDark && styles.textDark]}>{displayName}</Text>
          <Text style={[styles.userEmail, isDark && styles.subtituloDark]}>{email}</Text>

          {/* Badges de Rol y Verificación */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <View style={[styles.roleBadge, isVeterinario ? (isDark ? styles.roleBadgeVetDark : styles.roleBadgeVet) : (isDark ? styles.roleBadgeOwnerDark : styles.roleBadgeOwner)]}>
              <Ionicons
                name={isVeterinario ? 'shield-checkmark-outline' : 'paw-outline'}
                size={14}
                color={isVeterinario ? (isDark ? '#4ade80' : Palette.greenDeep) : (isDark ? '#38BDF8' : Palette.cyanDark)}
              />
              <Text style={[styles.roleBadgeText, isVeterinario ? (isDark ? styles.roleTextVetDark : styles.roleTextVet) : (isDark ? styles.roleTextOwnerDark : styles.roleTextOwner)]}>
                {isVeterinario ? 'Veterinario Habilitado' : 'Tutor / Propietario'}
              </Text>
            </View>

            {isVeterinario && (
              <View style={[styles.verifiedBadge, isDark && styles.verifiedBadgeDark]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={Palette.greenDeep} />
                <Text style={[styles.verifiedBadgeText, isDark && styles.verifiedBadgeTextDark]}>
                  Profesional Habilitado
                </Text>
              </View>
            )}
          </View>

          {/* Botón para alternar rol dinámicamente */}
          <TouchableOpacity
            style={[styles.switchRoleBtn, isDark && styles.switchRoleBtnDark]}
            onPress={handleToggleRol}
            disabled={changingRole}
            activeOpacity={0.8}
          >
            {changingRole ? (
              <ActivityIndicator size="small" color={Palette.greenDeep} />
            ) : (
              <>
                <Ionicons name="swap-horizontal-outline" size={16} color={Palette.greenDeep} />
                <Text style={styles.switchRoleBtnText}>
                  Cambiar a modo {isVeterinario ? 'Tutor' : 'Veterinario'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Datos Profesionales Exclusivos (Solo si existen datos reales) */}
          {isVeterinario && (
            <View style={[styles.profDetailsBox, isDark && styles.profDetailsBoxDark]}>
              <View style={styles.profDetailRow}>
                <Text style={[styles.profDetailLabel, isDark && styles.subtituloDark]}>Matrícula:</Text>
                <Text style={[styles.profDetailValue, isDark && styles.textDark]}>
                  {matricula ? matricula : 'No especificada en legajo'}
                </Text>
              </View>

              {especialidad ? (
                <View style={styles.profDetailRow}>
                  <Text style={[styles.profDetailLabel, isDark && styles.subtituloDark]}>Especialidad:</Text>
                  <Text style={[styles.profDetailValue, isDark && styles.textDark]}>{especialidad}</Text>
                </View>
              ) : null}

              {veterinaria ? (
                <TouchableOpacity
                  style={[styles.profDetailRow, { borderBottomWidth: 0 }]}
                  onPress={() => router.push('/veterinarias')}
                >
                  <Text style={[styles.profDetailLabel, isDark && styles.subtituloDark]}>Clínica asociada:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.profDetailValue, { color: Palette.greenDeep }]}>{veterinaria}</Text>
                    <Ionicons name="chevron-forward-outline" size={14} color={Palette.greenDeep} />
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>

        {/* Opciones y Preferencias */}
        <View style={styles.optionsContainer}>
          {/* Acceso a Recordatorios */}
          <TouchableOpacity
            style={[styles.settingRow, isDark && styles.settingRowDark]}
            onPress={() => router.push('/recordatorios')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ver recordatorios sanitarios"
          >
            <View style={[styles.settingIconCircle, isDark && styles.settingIconCircleDark]}>
              <Ionicons name="notifications-outline" size={20} color={Palette.greenDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, isDark && styles.textDark]}>Recordatorios y Avisos</Text>
              <Text style={[styles.settingSubtitle, isDark && styles.subtituloDark]}>
                {isVeterinario ? 'Gestión de alertas sanitarias para pacientes' : 'Vacunaciones y controles programados'}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={isDark ? '#71717a' : Palette.textSecondary} />
          </TouchableOpacity>

          {/* Fila Selector Modo Oscuro / Claro */}
          <View style={[styles.settingRow, isDark && styles.settingRowDark]}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDark }}
            accessibilityLabel="Activar o desactivar Modo Oscuro"
          >
            <View style={[styles.settingIconCircle, isDark && styles.settingIconCircleDark]}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={isDark ? '#facc15' : Palette.greenPrimary}
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
              trackColor={{ false: Palette.borderLight, true: Palette.greenDeep }}
              thumbColor={isDark ? '#4ade80' : '#ffffff'}
            />
          </View>

          {/* Botón Cerrar Sesión */}
          <TouchableOpacity
            style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
            onPress={handleLogout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={20} color={Palette.redEmergency} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Ilustración amigable y mensaje cálido de cuidado */}
        <FriendlyPetBanner
          title="¡Tu compañero merece lo mejor!"
          subtitle="Un pequeño cuidado diario hace una gran diferencia en su felicidad y bienestar."
          variant="both"
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.backgroundLight,
  },
  containerDark: {
    backgroundColor: Palette.backgroundDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
  },
  subtitulo: {
    color: Palette.textSecondary,
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    marginTop: 3,
  },
  subtituloDark: {
    color: Palette.textSecondaryDark,
  },
  textDark: {
    color: Palette.textPrimaryDark,
  },
  profileCard: {
    backgroundColor: Palette.surfaceLight,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderLight,
    marginBottom: 20,
    shadowColor: Palette.greenDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
    shadowOpacity: 0.3,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Palette.greenSoft,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  userName: {
    fontSize: 20,
    fontFamily: FontFamily.headingBold,
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeVet: {
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  roleBadgeVetDark: {
    backgroundColor: '#133324',
    borderWidth: 1,
    borderColor: '#1F543B',
  },
  roleBadgeOwner: {
    backgroundColor: Palette.cyanLight,
    borderWidth: 1,
    borderColor: Palette.cyanBorder,
  },
  roleBadgeOwnerDark: {
    backgroundColor: '#162F3B',
    borderWidth: 1,
    borderColor: '#1F4759',
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },
  roleTextVet: {
    color: Palette.greenDeep,
  },
  roleTextVetDark: {
    color: '#86efac',
  },
  roleTextOwner: {
    color: Palette.cyanDark,
  },
  roleTextOwnerDark: {
    color: '#7DD3FC',
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
  },
  switchRoleBtnDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  switchRoleBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
  },
  optionsContainer: {
    marginTop: 4,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    gap: 12,
  },
  settingRowDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconCircleDark: {
    backgroundColor: '#20302B',
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: FontFamily.headingSemiBold,
    color: Palette.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Palette.redSoft,
    borderWidth: 1,
    borderColor: Palette.redBorder,
    marginTop: 6,
  },
  logoutButtonDark: {
    backgroundColor: '#271919',
    borderColor: '#451a1a',
  },
  logoutText: {
    color: Palette.redEmergency,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1,
    borderColor: Palette.greenBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedBadgeDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.greenPrimary,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    color: Palette.greenDeep,
  },
  verifiedBadgeTextDark: {
    color: '#4ade80',
  },
  profDetailsBox: {
    width: '100%',
    backgroundColor: Palette.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  profDetailsBoxDark: {
    backgroundColor: '#20302B',
    borderColor: Palette.borderDark,
  },
  profDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  profDetailLabel: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontFamily: FontFamily.bodyRegular,
  },
  profDetailValue: {
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    color: Palette.textPrimary,
  },
});
