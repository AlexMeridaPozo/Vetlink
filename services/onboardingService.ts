import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clave de persistencia para el estado de Onboarding en AsyncStorage.
 */
export const ONBOARDING_COMPLETED_KEY = '@vetlink_has_completed_onboarding';

/**
 * Consulta si el usuario ya completó u omitió el Onboarding.
 * @returns true si ya lo completó o saltó previamente, false si es la primera apertura.
 */
export async function checkHasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error al leer el estado de onboarding en AsyncStorage:', error);
    // En caso de fallo en almacenamiento, retornar false para no bloquear el flujo
    return false;
  }
}

/**
 * Guarda en AsyncStorage que el usuario completó o decidió saltar el Onboarding.
 */
export async function saveOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error al guardar el estado de onboarding en AsyncStorage:', error);
  }
}

/**
 * Restablece el estado de Onboarding (útil para pruebas o depuración de desarrollo).
 */
export async function resetOnboardingStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Error al restablecer el estado de onboarding en AsyncStorage:', error);
  }
}
