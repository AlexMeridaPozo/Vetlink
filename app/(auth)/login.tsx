import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { auth } from '@/config/firebase';
import { FontFamily, Palette } from '@/constants/theme';
import { ThemeToggleButton, useAppTheme } from '@/context/ThemeContext';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
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
  const { isDark, colors } = useAppTheme();
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

  const placeholderColor = isDark ? colors.textMuted : Palette.textPlaceholder;
  const textColor = isDark ? colors.text : Palette.textPrimary;

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]} edges={['top', 'bottom']}>
      {/* Barra superior con marca y alternador de tema */}
      <View style={styles.topBar}>
        <View style={styles.brandSmallRow}>
          <Ionicons name="paw-outline" size={22} color={Palette.greenPrimary} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandSmallGreen]}>Huell</Text>
            <Text style={[styles.brandSmallDark, isDark && styles.textDark]}>App</Text>
          </View>
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
                <Ionicons name="paw-outline" size={38} color={Palette.greenPrimary} />
              </View>
              <Text style={[styles.title, isDark && styles.textDark]}>¡Bienvenido!</Text>
              <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Ingresa tus credenciales para acceder a HuellaApp
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
                  color={isDark ? colors.textSecondary : Palette.textSecondary}
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
                  color={isDark ? colors.textSecondary : Palette.textSecondary}
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
                    color={isDark ? colors.textSecondary : Palette.textSecondary}
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
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                  <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Divisor "o continúa con" */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
              <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>
                o continúa con
              </Text>
              <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
            </View>

            {/* Botón oficial de Google Sign-In */}
            <GoogleSignInButton
              label="Continuar con Google"
              onSuccess={() => router.replace('/(tabs)/mascotas')}
            />

            {/* Footer con enlace a Registro */}
            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                ¿No tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>

            {/* Acceso a Presentación / Onboarding */}
            <View style={styles.introContainer}>
              <TouchableOpacity
                onPress={() => router.push('/onboarding')}
                style={styles.introButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={isDark ? Palette.greenPrimary : Palette.greenDeep}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.introLink, isDark && styles.introLinkDark]}>
                  Sobre Huellapp
                </Text>
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
    backgroundColor: Palette.backgroundLight,
  },
  safeAreaDark: {
    backgroundColor: Palette.backgroundDark,
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
  brandSmallGreen: {
    fontSize: 20,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    color: Palette.greenPrimary,
    letterSpacing: -0.3,
  },
  brandSmallDark: {
    fontSize: 20,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
    paddingRight: 4,
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
    backgroundColor: Palette.surfaceLight,
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    shadowColor: Palette.greenDeep,
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
    shadowOpacity: 0.25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Palette.greenBorder,
  },
  logoBadgeDark: {
    backgroundColor: '#133324',
    borderColor: '#1F543B',
  },
  title: {
    width: '100%',
    fontSize: 24,
    fontFamily: FontFamily.headingBold,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    width: '100%',
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleDark: {
    color: Palette.textSecondaryDark,
  },
  textDark: {
    color: Palette.textPrimaryDark,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  labelDark: {
    color: Palette.textPrimaryDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceLight,
    borderWidth: 1.5,
    borderColor: Palette.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputWrapperDark: {
    backgroundColor: Palette.surfaceDark,
    borderColor: Palette.borderDark,
  },
  inputWrapperError: {
    borderColor: Palette.redEmergency,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.bodyRegular,
    paddingVertical: 13,
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    color: Palette.redEmergency,
    fontSize: 12,
    fontFamily: FontFamily.bodyRegular,
    marginTop: 5,
    marginLeft: 2,
  },
  primaryButton: {
    backgroundColor: Palette.greenDeep,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Palette.greenDeep,
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
    fontFamily: FontFamily.bodyBold,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.borderLight,
  },
  dividerLineDark: {
    backgroundColor: Palette.borderDark,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },
  dividerTextDark: {
    color: Palette.textSecondaryDark,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyRegular,
    color: Palette.textSecondary,
  },
  footerTextDark: {
    color: Palette.textSecondaryDark,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    fontWeight: '700',
    color: Palette.greenDeep,
    paddingRight: 4,
  },
  introContainer: {
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  introButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  introLink: {
    fontSize: 13,
    fontFamily: FontFamily.bodySemiBold,
    fontWeight: '600',
    color: Palette.greenDeep,
    paddingRight: 4,
  },
  introLinkDark: {
    color: Palette.greenPrimary,
  },
});
