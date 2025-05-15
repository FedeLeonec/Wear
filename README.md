# WearAliass Mobile App

Aplicación móvil para Android que se conecta con la plataforma WearAliass.

## Características

- Autenticación de usuarios (login/logout)
- Perfil de usuario
- Configuración de preferencias
- Conexión con la API de WearAliass

## Tecnologías utilizadas

- React Native
- Expo
- TypeScript
- React Navigation
- Axios para peticiones HTTP
- AsyncStorage para almacenamiento local

## Requisitos previos

- Node.js >= 14
- npm o yarn
- Expo Go app instalada en tu dispositivo Android

## Instalación

1. Clonar el repositorio:
```
git clone <url-del-repositorio>
cd WearAliassMobile
```

2. Instalar dependencias:
```
npm install
```

## Ejecución

1. Inicia la aplicación:
```
npx expo start
```

2. Escanea el código QR con la aplicación Expo Go en tu dispositivo Android.

## Generación de APK

Para generar un archivo APK para Android, sigue estos pasos:

1. Instala EAS CLI:
```
npm install -g eas-cli
```

2. Inicia sesión en Expo:
```
eas login
```

3. Configura la build con:
```
eas build:configure
```

4. Construye el APK para desarrollo:
```
eas build -p android --profile preview
```

Este proceso puede tardar varios minutos. Una vez completado, recibirás un enlace para descargar el APK.

### Requisitos para compilar localmente

Si deseas compilar localmente, necesitarás:

1. Java Development Kit (JDK) 11 o superior
2. Android SDK con las herramientas de compilación
3. Gradle (incluido en Android Studio)

Para compilar localmente una vez configurado:

```
cd android
./gradlew assembleRelease
```

El APK se generará en: `android/app/build/outputs/apk/release/app-release.apk`

## Estructura del proyecto

```
src/
  ├── assets/        # Imágenes, fuentes y otros recursos estáticos
  ├── components/    # Componentes reutilizables
  ├── context/       # Contextos de React (AuthContext, etc.)
  ├── navigation/    # Configuración de navegación
  ├── screens/       # Pantallas de la aplicación
  ├── services/      # Servicios (API, almacenamiento, etc.)
  └── types/         # Definiciones de tipos TypeScript
```

## Conexión con la API

La aplicación se conecta a la API de WearAliass. Para configurar la URL de la API, modifica la constante `API_URL` en el archivo `src/services/api.ts`. 