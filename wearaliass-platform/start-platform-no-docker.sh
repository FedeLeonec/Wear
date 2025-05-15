#!/bin/bash

# Crear archivo .env si no existe
if [ ! -f backend/.env ]; then
  echo "PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wearaliass
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=secretkey123
NODE_ENV=development
SKIP_DB_CONNECTION=true" > backend/.env
  echo "Archivo .env creado en backend/"
fi

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
cd backend
npm install --save-dev @types/morgan
npm install

# Iniciar el backend en segundo plano
echo "Iniciando backend en puerto 3001..."
npm run dev &
BACKEND_PID=$!

# Esperar un momento para que el backend inicie
sleep 2

# Volver al directorio principal
cd ..

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
cd frontend
npm install --legacy-peer-deps

# Iniciar el frontend
echo "Iniciando frontend en puerto 3000..."
npm start &
FRONTEND_PID=$!

# Función para manejar la terminación
function cleanup {
  echo "Deteniendo servicios..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Configurar manejo de señales de terminación
trap cleanup SIGINT SIGTERM

echo "Plataforma iniciada!"
echo "Backend corriendo en http://localhost:3001"
echo "Frontend corriendo en http://localhost:3000"
echo "NOTA: La base de datos PostgreSQL no está disponible. La aplicación funcionará con funcionalidad limitada."
echo "Presiona Ctrl+C para detener los servicios"

# Mantener el script en ejecución
wait