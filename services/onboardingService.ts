import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clave oficial de persistencia para el estado de Onboarding de HuellApp en AsyncStorage.
 */
export const ONBOARDING_COMPLETED_KEY = '@huellapp_onboarding_completed_v1';

const ALL_KNOWN_KEYS = [
  '@huellapp_onboarding_completed_v1',
  '@huellapp_has_completed_onboarding_v2',
  '@huellapp_has_completed_onboarding',
  '@vetlink_has_completed_onboarding',
];

/**
 * Consulta si el usuario ya completó u omitió el Onboarding oficial de HuellApp.
 * @returns true si ya lo completó o saltó previamente, false si es la primera apertura.
 */
export async function checkHasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('[onboardingService] Error al leer estado de onboarding:', error);
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
    console.error('[onboardingService] Error al guardar estado de onboarding:', error);
  }
}

/**
 * Restablece el estado de Onboarding en todos los identificadores conocidos.
 * Útil para pruebas, depuración y reabrir el flujo de presentación.
 */
export async function resetOnboardingStatus(): Promise<void> {
  try {
    for (const key of ALL_KNOWN_KEYS) {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('[onboardingService] Error al restablecer estado de onboarding:', error);
  }
}
