# Guía de Configuración de Google OAuth

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Seleccionar proyecto" → "Nuevo proyecto"
3. Nombre del proyecto: `Standard Time Pro`
4. Haz clic en "Crear"

## Paso 2: Habilitar APIs

1. En el menú lateral, ve a "APIs y servicios" → "Biblioteca"
2. Busca y habilita estas APIs:
   - **Google Sheets API**
   - **Google Drive API**

## Paso 3: Crear Credenciales OAuth 2.0

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "+ CREAR CREDENCIALES" → "ID de cliente de OAuth 2.0"
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `Standard Time Pro Web Client`

## Paso 4: Configurar Orígenes Autorizados

En "Orígenes de JavaScript autorizados", agrega:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

En "URI de redirección autorizados", agrega:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Paso 5: Copiar Client ID

1. Después de crear, copia el "ID de cliente"
2. Pégalo en el archivo `.env` reemplazando `demo_client_id_replace_with_real_one`

## Ejemplo de .env:
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## Verificación

Una vez configurado, la aplicación debería funcionar correctamente con Google Auth.