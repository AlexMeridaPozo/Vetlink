import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/config/firebase';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';



export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const handleRegister = async () => {

    setErrors({ name: '', email: '', password: '' });   //Obligar a un usuario a que llene los espacios

    let hasErrors = false;
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'El nombre es obligatorio' }));
      hasErrors = true;
    }
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'El correo electrónico es obligatorio' }));
      hasErrors = true;
    }
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: 'La contraseña es obligatoria' }));
      hasErrors = true;
    } else if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'La contraseña debe tener al menos 6 caracteres' }));
      hasErrors = true;
    }

    if (hasErrors) {
      Alert.alert('Error', 'Por favor, revise los campos del formulario.');
      return;
    }


    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); //permite crear la cuenta con email y contraseña
      await updateProfile(userCredential.user, { displayName: name }); //permite guardar el nombre completo del usuario
      console.log('Usuario registrado exitosamente:', userCredential.user);
      Alert.alert('Éxito', 'Cuenta creada correctamente.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/mascotas'),
        },
      ]);
      if (Platform.OS === 'web') {
        router.replace('/(tabs)/mascotas');
      }
    } catch (error: any) { // Si el registro sale error, esto le muestra
      let errorMessage = 'Hubo un error al crear la cuenta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico es inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es débil.';
      }
      else if (password.length < 6) {  //contraseña menos de 6 caracteres
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      Alert.alert('Error', errorMessage);

      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
      }
      Alert.alert('Error', errorMessage);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.title} type="title">VetLink</ThemedText>
          <ThemedText style={styles.subtitle}>Crea tu cuenta para comenzar</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nombre completo</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez"
              placeholderTextColor="#000000ff"
              value={name}
              onChangeText={(text) => {
                const onlyLetters = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                setName(onlyLetters);
              }}
              autoCapitalize="words"
            />
            {errors.name !== '' ? (
              <ThemedText style={{
                color: 'red',
                fontSize: 12,
                marginTop: 4
              }}>
                {errors.name}
              </ThemedText>
            ) : null}

          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Correo electrónico</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#000000ff"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email !== '' ? (
              <ThemedText style={{
                color: 'red',
                fontSize: 12,
                marginTop: 4
              }}>
                {errors.email}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#000000ff"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password !== '' ? (
              <ThemedText style={{
                color: 'red',
                fontSize: 12,
                marginTop: 4
              }}>
                {errors.password}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={!loading ? handleRegister : undefined}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>¿Ya tienes una cuenta? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <ThemedText style={styles.footerLink}>Inicia sesión</ThemedText>
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

