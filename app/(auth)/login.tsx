import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      Alert.alert('Error', 'Por favor, revise los campos del formulario.');
      return;
    }


    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Éxito', 'Has iniciado sesión correctamente.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/mascotas'),
        },
      ]);
      if (Platform.OS === 'web') {
        router.replace('/(tabs)/mascotas');
      }
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.title} type="title">VetLink</ThemedText>
          <ThemedText style={styles.subtitle}>Inicia sesión para continuar</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Correo electrónico</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email !== '' ? (
              <ThemedText style={styles.errorText}>
                {errors.email}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor="#888888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password !== '' ? (
              <ThemedText style={styles.errorText}>
                {errors.password}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={!loading ? handleLogin : undefined}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>¿No tienes una cuenta? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <ThemedText style={styles.footerLink}>Regístrate</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
    color: '#04b639ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#000000ff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#04b639ff',
  },
});
