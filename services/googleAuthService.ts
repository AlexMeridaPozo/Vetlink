import { auth, db } from '@/config/firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert, Platform } from 'react-native';

// Completa cualquier sesión de autenticación pendiente en el navegador del dispositivo
WebBrowser.maybeCompleteAuthSession();

// Endpoints estándar de Google OAuth2
const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};
  
/**
 * Guarda o sincroniza el perfil del usuario de Google en Firestore si es nuevo
 */
async function syncGoogleUserProfile(user: User): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Usuario HuellaApp',
        rol: 'propietario',
        fotoUrl: user.photoURL || null,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return true; // Es nuevo usuario
    }
    return false; // Usuario existente
  } catch (error) {
    console.warn('[googleAuthService] Error sincronizando perfil en Firestore:', error);
    return false;
  }
}

/**
 * Inicia sesión o registra al usuario mediante Google
 * Compatible con Web (Firebase Popup) y Móvil (AuthSession OAuth)
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: User;
  isNewUser?: boolean;
  error?: string;
}> {
  try {
    // ── 1. Flujo Web (Firebase Auth directo con Popup) ──────────────────────────
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const userCredential = await signInWithPopup(auth, provider);
      const isNewUser = await syncGoogleUserProfile(userCredential.user);

      return {
        success: true,
        user: userCredential.user,
        isNewUser,
      };
    }

    // ── 2. Flujo Móvil (iOS / Android con Expo AuthSession) ───────────────────
    const isAndroid = Platform.OS === 'android';
    const isIos = Platform.OS === 'ios';

    const clientId =
      (isIos
        ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '811948016554-357ccdjf214fnvofgsuvs1no7nv64jl6.apps.googleusercontent.com';

    // Esquema de redirección para Google OAuth en Android/iOS:
    // Requiere el client ID invertido (ej: com.googleusercontent.apps.811948016554-357ccdjf214fnvofgsuvs1no7nv64jl6)
    const clientPrefix = clientId.replace('.apps.googleusercontent.com', '');
    const scheme = isAndroid || isIos
      ? `com.googleusercontent.apps.${clientPrefix}`
      : 'huellapp';

    const redirectUri = AuthSession.makeRedirectUri({
      scheme,
      path: 'oauth2redirect',
    });

    // En dispositivos móviles con clientes nativos Android/iOS, Google requiere Authorization Code Flow (PKCE)
    const responseType = isAndroid || isIos
      ? AuthSession.ResponseType.Code
      : AuthSession.ResponseType.IdToken;

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType,
      redirectUri,
    });

    const result = await request.promptAsync(googleDiscovery);

    if (result.type === 'success') {
      let idToken: string | undefined = result.params?.id_token;
      const authCode: string | undefined = result.params?.code;

      // Si recibimos un código de autorización (flujo nativo PKCE), lo intercambiamos por el id_token
      if (!idToken && authCode) {
        try {
          const tokenResponse = await AuthSession.exchangeCodeAsync(
            {
              clientId,
              code: authCode,
              redirectUri,
              extraParams: {
                code_verifier: request.codeVerifier || '',
              },
            },
            googleDiscovery
          );
          idToken = tokenResponse.idToken;
        } catch (exchangeError: any) {
          console.error('[googleAuthService] Error intercambiando código OAuth:', exchangeError);
          return {
            success: false,
            error: 'No se pudo validar la autorización de Google en el servidor.',
          };
        }
      }

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const isNewUser = await syncGoogleUserProfile(userCredential.user);

        return {
          success: true,
          user: userCredential.user,
          isNewUser,
        };
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return {
        success: false,
        error: 'El usuario canceló el inicio de sesión.',
      };
    }

    return {
      success: false,
      error: 'No se pudo completar la autenticación con Google.',
    };
  } catch (error: any) {
    console.error('[googleAuthService] Error en autenticación con Google:', error);

    let errorMsg = 'Ocurrió un error al conectar con Google.';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMsg = 'Ventana de inicio de sesión cerrada antes de completar.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMsg = 'Solicitud anterior cancelada.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMsg = 'Error de conexión. Revisa tu acceso a internet.';
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
