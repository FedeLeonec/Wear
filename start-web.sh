#!/bin/bash

# Cambiar al directorio de la plataforma web
cd wearaliass-platform/frontend

# Instalar dependencias
echo "Instalando dependencias del frontend..."
npm install --legacy-peer-deps

# Iniciar la aplicación web
echo "Iniciando la aplicación web en localhost:3000..."
npm start