import { auth } from '@/config/firebase';
import { useAppTheme, ThemeToggleButton } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { isDark } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    setErrors({ email: '', password: '' });

    let hasErrors = false;
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'El correo electrónico es obligatorio' }));
      hasErrors = true;
    }
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: 'La contraseña es obligatoria' }));
      hasErrors = true;
    } else if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'La contraseña debe tener al menos 6 caracteres' }));
      hasErrors = true;
    }

    if (hasErrors) {
      Alert.alert('Datos requeridos', 'Por favor, complete los campos solicitados.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/mascotas');
    } catch (error: any) {
      let errorMessage = 'Hubo un error al iniciar sesión.';
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico es inválido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión a internet. Revisa tu red.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const placeholderColor = isDark ? '#71717a' : '#94a3b8';
  const textColor = isDark ? '#f4f4f5' : '#0f172a';

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]} edges={['top', 'bottom']}>
      {/* Botón flotante para alternar tema */}
      <View style={styles.topBar}>
        <View style={styles.brandSmallRow}>
          <Ionicons name="paw" size={20} color="#04b639" />
          <Text style={[styles.brandSmallText, isDark && styles.textDark]}>VetLink</Text>
        </View>
        <ThemeToggleButton />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Logo / Badge */}
            <View style={styles.header}>
              <View style={[styles.logoBadge, isDark && styles.logoBadgeDark]}>
                <Ionicons name="paw" size={36} color="#04b639" />
              </View>
              <Text style={[styles.title, isDark && styles.textDark]}>Bienvenido de nuevo</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Ingresa tus credenciales para acceder a VetLink
              </Text>
            </View>

            {/* Input Correo */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Correo electrónico</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isDark && styles.inputWrapperDark,
                  errors.email ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={isDark ? '#a1a1aa' : '#64748b'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors((e) => ({ ...e, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email !== '' && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Contraseña</Text>
              <View
                style={[
                  styles.inputWrapper,
                  isDark && styles.inputWrapperDark,
                  errors.password ? styles.inputWrapperError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isDark ? '#a1a1aa' : '#64748b'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((e) => ({ ...e, password: '' }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isDark ? '#a1a1aa' : '#64748b'}
                  />
                </TouchableOpacity>
              </View>
              {errors.password !== '' && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Botón Principal */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={!loading ? handleLogin : undefined}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer con enlace a Registro */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                ¿No tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeAreaDark: {
    backgroundColor: '#09090b',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandSmallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandSmallText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 36,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    shadowOpacity: 0.25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  logoBadgeDark: {
    backgroundColor: '#064e3b',
    borderColor: '#047857',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleDark: {
    color: '#a1a1aa',
  },
  textDark: {
    color: '#f4f4f5',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  labelDark: {
    color: '#e4e4e7',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputWrapperDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },
  primaryButton: {
    backgroundColor: '#04b639',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#04b639',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  footerTextDark: {
    color: '#a1a1aa',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#04b639',
  },
});
