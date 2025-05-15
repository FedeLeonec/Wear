# Guía para generar el APK de WearAliass Mobile

Hay varias formas de generar un APK para una aplicación React Native/Expo. A continuación, se presentan las opciones disponibles:

## Opción 1: Usando EAS Build (recomendado)

EAS Build es el servicio oficial de Expo para compilar aplicaciones. Requiere una cuenta de Expo.

1. Instala EAS CLI:
```
npm install -g eas-cli
```

2. Inicia sesión en Expo:
```
eas login
```

3. Configura la build:
```
eas build:configure
```

4. Construye el APK para desarrollo:
```
eas build -p android --profile preview
```

Ventajas:
- No necesitas configurar entorno de desarrollo local
- Funciona en cualquier sistema operativo
- Optimizado por Expo

## Opción 2: Compilación local con Gradle

Esta opción requiere configurar completamente el entorno de desarrollo Android en tu máquina.

Requisitos:
- Java Development Kit (JDK) 11 o superior
- Android SDK con las herramientas de compilación
- Variables de entorno ANDROID_HOME y JAVA_HOME correctamente configuradas
- Gradle 7.x o superior

Pasos:
1. Ejecuta `npx expo prebuild --platform android` para generar el proyecto nativo
2. Navega a la carpeta android: `cd android`
3. Ejecuta `./gradlew assembleRelease`
4. El APK se generará en `android/app/build/outputs/apk/release/app-release.apk`

## Opción 3: Usar Docker

Si tienes Docker instalado, puedes usar una imagen preconfigurada para compilar el APK sin necesidad de instalar todas las dependencias.

1. Instala Docker en tu sistema
2. Ejecuta:
```
docker run --rm -v $(pwd):/app -w /app reactnativecommunity/react-native-android:latest bash -c "cd android && ./gradlew assembleRelease"
```
3. El APK se generará en `android/app/build/outputs/apk/release/app-release.apk`

## Opción 4: Exportar como aplicación independiente en Expo Go

Esta opción permite crear una versión de la aplicación que los usuarios pueden instalar sin necesidad de Expo Go, pero no es un APK completo.

1. Ejecuta:
```
npx expo export:embed
```

2. Sigue las instrucciones para generar el paquete

## Consideraciones adicionales

- Para generar un APK firmado para producción, necesitarás crear un keystore y configurarlo en `android/app/build.gradle`
- Para hacer que la aplicación sea más pequeña, considera optimizar las imágenes y recursos
- Asegúrate de actualizar la versión en `app.json` antes de cada compilación

## Alternativa para desarrollo y pruebas

Si solo necesitas probar la aplicación en un dispositivo Android:

1. Instala Expo Go desde Google Play Store
2. Ejecuta `npx expo start`
3. Escanea el código QR con Expo Go

Esto no genera un APK, pero permite probar la aplicación rápidamente. 