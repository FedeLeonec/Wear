#!/bin/bash

# Cambiar al directorio de la plataforma web
cd wearaliass-platform/frontend

# Instalar dependencias
echo "Instalando dependencias del frontend..."
npm install --legacy-peer-deps

# Iniciar la aplicación web en el puerto 3002
echo "Iniciando la aplicación web en localhost:3002..."
PORT=3002 npm start