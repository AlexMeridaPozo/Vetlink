import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'veterinario' | 'propietario';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  rol: UserRole;
  matricula?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  userRole: UserRole;
  isVeterinario: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  userRole: 'propietario',
  isVeterinario: false,
  isLoading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carga el perfil de Firestore del usuario (SOLO LECTURA)
  // La creación del perfil se maneja exclusivamente en register.tsx
  const loadProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    try {
      // Forzar la propagación del token de autenticación antes de consultar Firestore.
      // Sin esto, onAuthStateChanged puede disparar antes de que el token esté disponible
      // para el SDK de Firestore, causando "Missing or insufficient permissions".
      await firebaseUser.getIdToken(true);

      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
      } else {
        // El perfil aún no existe en Firestore (puede ocurrir durante el registro).
        // Se establece un fallback en memoria SIN escribir en Firestore para evitar
        // race conditions con register.tsx y errores de permisos.
        console.info('[AuthContext] Perfil no encontrado en Firestore para UID:', firebaseUser.uid);
        setProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Usuario VetLink',
          rol: 'propietario', // Fallback seguro: sin permisos elevados hasta que Firestore confirme
        });
      }
    } catch (err) {
      console.warn('[AuthContext] Error consultando perfil de usuario:', err);
      // Fallback seguro en memoria (sin escritura a Firestore)
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Usuario',
        rol: 'propietario', // Fallback seguro: sin permisos elevados
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  const userRole: UserRole = profile?.rol || 'propietario';
  const isVeterinario = userRole === 'veterinario';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRole,
        isVeterinario,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
