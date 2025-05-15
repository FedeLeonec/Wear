#!/bin/bash

# Cambiar al directorio de la aplicación móvil
cd WearAliassMobile

# Instalar dependencias
echo "Instalando dependencias de la aplicación móvil..."
npm install

# Iniciar la aplicación con Expo
echo "Iniciando la aplicación móvil con Expo..."
echo "Se generará un código QR para escanear con la app Expo Go en tu dispositivo móvil"
npm start