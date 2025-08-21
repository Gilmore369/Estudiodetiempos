import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definimos una interfaz para el perfil del usuario
interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

// Definimos la estructura de nuestro store de autenticación
interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  sheetsConfig: { sheetId: string } | null; // Guardaremos la configuración de la hoja aquí
  setAuthSuccess: (userProfile: UserProfile) => void;
  setSheetsConfig: (config: { sheetId: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  // `persist` guarda automáticamente el estado en el LocalStorage del navegador.
  // Esto permite que el usuario siga logueado si refresca la página.
  persist(
    (set) => ({
      // Estado inicial
      isAuthenticated: false,
      userProfile: null,
      sheetsConfig: null,

      // Acción para cuando el login es exitoso
      setAuthSuccess: (userProfile) =>
        set({ isAuthenticated: true, userProfile }),

      // Acción para guardar la configuración de la hoja de cálculo
      setSheetsConfig: (config) => set({ sheetsConfig: config }),
      
      // Acción para cerrar sesión
      logout: () =>
        set({
          isAuthenticated: false,
          userProfile: null,
          sheetsConfig: null, // También limpiamos la config al salir
        }),
    }),
    {
      name: 'auth-storage', // Nombre de la clave en LocalStorage
      // Solo persistimos la información necesaria para mantener la sesión
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userProfile: state.userProfile,
        sheetsConfig: state.sheetsConfig,
      }),
    }
  )
);
