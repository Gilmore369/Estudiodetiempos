import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { jwtDecode } from 'jwt-decode';

// Definimos el tipo para el objeto 'google' que se adjuntará a 'window'
// para que TypeScript no se queje.
declare global {
  interface Window {
    google: any;
  }
}

export default function LoginScreen() {
  const { isAuthenticated, setAuthSuccess } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  // Esta referencia nos permitirá decirle a Google dónde dibujar su botón.
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Esta función se ejecutará automáticamente cuando el login sea exitoso.
  const handleCredentialResponse = (response: any) => {
    setError(null);
    try {
      console.log("Token JWT codificado: " + response.credential);
      const userProfile: any = jwtDecode(response.credential);
      
      // Actualizamos nuestro store con la información del usuario.
      setAuthSuccess({
        name: userProfile.name,
        email: userProfile.email,
        picture: userProfile.picture,
      });
    } catch (err) {
      console.error("Fallo al decodificar el token o al establecer el estado de autenticación", err);
      setError("Ocurrió un error durante el inicio de sesión.");
    }
  };

  // Este efecto se encarga de cargar y configurar la librería de Google.
  useEffect(() => {
    // Si el script ya está en la página, no hacemos nada.
    if (window.google) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    // Cuando el script termine de cargar, ejecutamos la inicialización.
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        
        // Le decimos a Google que renderice su botón en nuestro div.
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'rectangular' }
          );
        }
      } else {
        setError("No se pudo cargar la librería de autenticación de Google.");
      }
    };
    
    script.onerror = () => {
        setError("Fallo al cargar el script de autenticación de Google. Revisa tu conexión a internet.");
    }

    document.body.appendChild(script);

    // Limpiamos el script si el componente se desmonta.
    return () => {
      const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptTag) {
        document.body.removeChild(scriptTag);
      }
    };
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez.

  if (isAuthenticated) {
    return null; // No renderizar nada si ya está autenticado.
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Standard Time Pro
          </h1>
          <p className="text-lg text-gray-600">
            Professional time study application
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome
            </h2>
            <p className="text-gray-600">
              Sign in with your Google account to access your time studies and sync with Google Sheets.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contenedor para el botón de Google. Lo centramos. */}
          <div className="flex justify-center mt-4">
            <div ref={googleButtonRef}></div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to sync your time study data with Google Sheets.
              Your data will be stored in your own Google Drive.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">Features:</h3>
          <ul className="space-y-1">
            <li>• Real-time Google Sheets synchronization</li>
            <li>• Westinghouse performance evaluation</li>
            <li>• OIT tolerance calculations</li>
            <li>• Process analysis diagrams (DAP)</li>
            <li>• Works offline with sync when online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
