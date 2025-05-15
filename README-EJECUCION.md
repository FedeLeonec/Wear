# Instrucciones para ejecutar WearAliass

Este documento contiene las instrucciones para ejecutar tanto la versión web como la versión móvil de WearAliass.

## Requisitos previos

- Node.js (versión 14.17 o superior)
- npm (versión 8.19.4 o superior)
- Docker Desktop (para PostgreSQL)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app en tu dispositivo móvil (para probar la versión móvil)

## Ejecutar la versión web (frontend + backend)

1. Asegúrate de que Docker Desktop esté instalado y en ejecución.
2. Abre una terminal y navega hasta el directorio del proyecto:
   ```
   cd /Users/user/Documents/wearaliass/wearaliass-platform
   ```
3. Ejecuta el script de inicio:
   ```
   ./start-platform-fixed.sh
   ```
4. El script realizará las siguientes acciones:
   - Iniciará PostgreSQL en un contenedor Docker
   - Instalará las dependencias del backend
   - Iniciará el backend en el puerto 3001
   - Instalará las dependencias del frontend
   - Iniciará el frontend en el puerto 3000

5. Una vez completado, podrás acceder a:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Ejecutar la versión móvil

1. Abre una nueva terminal (sin cerrar la anterior) y navega hasta el directorio del proyecto:
   ```
   cd /Users/user/Documents/wearaliass
   ```
2. Ejecuta el script de inicio para la aplicación móvil:
   ```
   ./start-mobile.sh
   ```
3. El script realizará las siguientes acciones:
   - Instalará las dependencias de la aplicación móvil
   - Iniciará la aplicación con Expo
   - Generará un código QR

4. Escanea el código QR con la app Expo Go en tu dispositivo móvil para ver la aplicación.

## Solución de problemas

### Error de PostgreSQL
Si encuentras errores relacionados con la base de datos:
1. Verifica que Docker esté en ejecución
2. Reinicia el contenedor de PostgreSQL:
   ```
   docker-compose restart postgres
   ```

### Error en el backend
Si el backend no inicia correctamente:
1. Verifica los logs en la terminal
2. Asegúrate de que PostgreSQL esté funcionando
3. Verifica que el archivo .env tenga la configuración correcta

### Error en el frontend
Si el frontend no inicia correctamente:
1. Verifica los logs en la terminal
2. Asegúrate de que el backend esté funcionando
3. Intenta ejecutar `npm start` manualmente en el directorio frontend

### Error en la aplicación móvil
Si la aplicación móvil no inicia correctamente:
1. Verifica que Expo CLI esté instalado
2. Asegúrate de que el archivo .env tenga la URL correcta del backend
3. Intenta ejecutar `expo start` manualmente en el directorio WearAliassMobile