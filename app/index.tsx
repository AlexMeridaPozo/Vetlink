import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir temporalmente directo a la pantalla de registro
  return <Redirect href="/(auth)/register" />;
}
