import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clave de persistencia para el estado de Onboarding en AsyncStorage.
 */
export const ONBOARDING_COMPLETED_KEY = '@huellapp_has_completed_onboarding_v2';
const LEGACY_KEYS = [
  '@huellapp_has_completed_onboarding',
  '@vetlink_has_completed_onboarding',
];

/**
 * Consulta si el usuario ya completó u omitió el Onboarding.
 * @returns true si ya lo completó o saltó previamente, false si es la primera apertura.
 */
export async function checkHasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (value === 'true') return true;

    for (const legacyKey of LEGACY_KEYS) {
      const legacyValue = await AsyncStorage.getItem(legacyKey);
      if (legacyValue === 'true') {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        return true;
      }
    }

    return false;
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
 * Restablece el estado de Onboarding (útil para pruebas o depuración de desarrollo).
 */
export async function resetOnboardingStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    for (const legacyKey of LEGACY_KEYS) {
      await AsyncStorage.removeItem(legacyKey);
    }
  } catch (error) {
    console.error('[onboardingService] Error al restablecer estado de onboarding:', error);
  }
}
