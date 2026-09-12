import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir por defecto a la pantalla de inicio de sesión
  return <Redirect href="/(auth)/login" />;
}

