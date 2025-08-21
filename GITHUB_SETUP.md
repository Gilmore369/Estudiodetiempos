# 🚀 GitHub y Vercel Setup - Standard Time Pro

## Paso 1: Crear Repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón "+" en la esquina superior derecha
3. Selecciona "New repository"
4. Configura el repositorio:
   - **Repository name**: `standard-time-pro`
   - **Description**: `Professional time study PWA with Google Sheets integration`
   - **Visibility**: Public (recomendado para despliegue gratuito)
   - **NO** inicialices con README, .gitignore o license (ya los tenemos)
5. Haz clic en "Create repository"

## Paso 2: Conectar Repositorio Local con GitHub

Ejecuta estos comandos en la terminal (dentro de la carpeta standard-time-pro):

```bash
# Agregar el repositorio remoto (reemplaza 'yourusername' con tu usuario de GitHub)
git remote add origin https://github.com/yourusername/standard-time-pro.git

# Subir el código a GitHub
git branch -M main
git push -u origin main
```

## Paso 3: Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs:
   - Google Sheets API
   - Google Drive API
4. Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configura la pantalla de consentimiento OAuth
6. Crea las credenciales OAuth 2.0:
   - **Application type**: Web application
   - **Name**: Standard Time Pro
   - **Authorized origins**: 
     - `http://localhost:5173` (para desarrollo)
     - `https://your-app-name.vercel.app` (para producción - lo obtendrás después)
7. **GUARDA EL CLIENT ID** - lo necesitarás para Vercel

## Paso 4: Desplegar en Vercel

1. Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Haz clic en "New Project"
3. Importa tu repositorio `standard-time-pro`
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **IMPORTANTE**: Agrega la variable de entorno:
   - **Name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Tu Client ID de Google OAuth
6. Haz clic en "Deploy"

## Paso 5: Actualizar OAuth con URL de Vercel

1. Una vez desplegado, Vercel te dará una URL como: `https://standard-time-pro-abc123.vercel.app`
2. Ve de vuelta a Google Cloud Console
3. Edita tus credenciales OAuth
4. Agrega la URL de Vercel a "Authorized origins"
5. Guarda los cambios

## Paso 6: ¡Probar la Aplicación!

1. Visita tu URL de Vercel
2. Haz clic en "Sign in with Google"
3. Autoriza la aplicación
4. ¡Comienza a usar Standard Time Pro!

## 🔧 Comandos Útiles

```bash
# Ver el estado del repositorio
git status

# Hacer cambios y subirlos
git add .
git commit -m "Descripción de los cambios"
git push

# Ver la URL del repositorio remoto
git remote -v
```

## 📞 Solución de Problemas

### Error de OAuth
- Verifica que la URL de Vercel esté en "Authorized origins"
- Asegúrate de que el Client ID esté correcto en Vercel

### Error de Build
- Verifica que todas las dependencias estén en package.json
- Revisa los logs de build en Vercel

### Error de Google Sheets
- Verifica que las APIs estén habilitadas
- Asegúrate de que el usuario tenga permisos en la hoja de cálculo

## 🎉 ¡Listo!

Tu aplicación Standard Time Pro estará disponible en línea y lista para usar por analistas de ingeniería industrial en todo el mundo!