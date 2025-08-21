import { useState, useEffect } from 'react';

function App() {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google script is loaded
    const checkGoogle = () => {
      if (typeof (window as any).google !== 'undefined') {
        setGoogleLoaded(true);
        console.log('✅ Google script loaded successfully');
      } else {
        setError('❌ Google script not loaded');
        console.error('Google script not loaded');
      }
    };

    // Wait a bit for the script to load
    setTimeout(checkGoogle, 2000);
  }, []);

  const testGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log('Client ID:', clientId);
    
    if (clientId === 'demo_client_id_replace_with_real_one') {
      setError('⚠️ Necesitas configurar un Google Client ID real en el archivo .env');
      return;
    }

    if (typeof (window as any).google === 'undefined') {
      setError('❌ Google script no está cargado');
      return;
    }

    setError('✅ Todo está configurado correctamente. Ahora puedes usar la aplicación completa.');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Diagnóstico de Standard Time Pro</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Estado de Google Auth:</h2>
        <p>Google Script: {googleLoaded ? '✅ Cargado' : '❌ No cargado'}</p>
        <p>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID}</p>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: error.includes('✅') ? '#d4edda' : '#f8d7da',
          border: '1px solid ' + (error.includes('✅') ? '#c3e6cb' : '#f5c6cb'),
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <button 
        onClick={testGoogleAuth}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🧪 Probar Configuración
      </button>

      <div style={{ marginTop: '30px' }}>
        <h2>📋 Pasos para solucionar:</h2>
        <ol>
          <li>Abre <code>GOOGLE_SETUP_GUIDE.md</code> y sigue las instrucciones</li>
          <li>Configura tu Google Client ID en el archivo <code>.env</code></li>
          <li>Reinicia el servidor de desarrollo</li>
          <li>Haz clic en "Probar Configuración"</li>
        </ol>
      </div>
    </div>
  );
}

export default App;