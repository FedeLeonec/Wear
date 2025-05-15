# Alias - Plataforma Multi-Tenant para Tiendas de Ropa

Alias es una plataforma robusta, escalable y segura, diseñada bajo una arquitectura Multi-Tenant, que permite a múltiples empresas de tiendas de ropa gestionar sus operaciones de forma completamente independiente. La plataforma incluye gestión jerárquica de roles y usuarios, módulos específicos para ventas (POS y eCommerce), inventario, contabilidad, reportes y dashboards personalizados por rol.

## Características principales

### Multi-tenant
- Aislamiento de datos entre tenants
- Gestión centralizada de tenants
- Configuración personalizada por tenant

### Control de acceso basado en roles (RBAC)
- Super Admin (nivel plataforma)
- Admin (nivel tenant)
- Vendedor
- Contable
- Cajero
- Cliente

### Módulos funcionales
- Gestión de usuarios
- Inventario y productos
- Punto de venta (POS)
- Tienda online (eCommerce)
- Contabilidad
- Reportes y dashboards

## Tecnologías utilizadas

### Backend
- Node.js con Express
- TypeScript
- PostgreSQL con Sequelize ORM
- JWT para autenticación
- Arquitectura modular

### Frontend
- React con TypeScript
- Material-UI para la interfaz de usuario
- Redux Toolkit para gestión de estado
- React Router para navegación

## Estructura del proyecto

```
alias-platform/
├── backend/                # API REST con Node.js y Express
│   ├── src/
│   │   ├── config/         # Configuración de la aplicación
│   │   ├── controllers/    # Controladores
│   │   ├── middlewares/    # Middlewares
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios
│   │   ├── utils/          # Utilidades
│   │   └── modules/        # Módulos funcionales
│   └── package.json
│
├── frontend/               # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── services/       # Servicios para API
│   │   ├── store/          # Estado global (Redux)
│   │   ├── theme/          # Configuración de tema
│   │   ├── types/          # Tipos e interfaces
│   │   └── utils/          # Utilidades
│   └── package.json
│
└── docs/                   # Documentación
```

## Instalación y configuración

### Requisitos previos
- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Backend
1. Navegar al directorio del backend:
   ```
   cd backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   ```
   cp .env.example .env
   ```
   Editar el archivo `.env` con la configuración adecuada.

4. Iniciar el servidor en modo desarrollo:
   ```
   npm run dev
   ```

### Frontend
1. Navegar al directorio del frontend:
   ```
   cd frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Iniciar la aplicación en modo desarrollo:
   ```
   npm start
   ```

## Capturas de pantalla

### Login
![Login](docs/screenshots/login.png)

### Dashboard Super Admin
![Dashboard Super Admin](docs/screenshots/dashboard-super-admin.png)

### Dashboard Admin
![Dashboard Admin](docs/screenshots/dashboard-admin.png)

### Punto de Venta (POS)
![POS](docs/screenshots/pos.png)

## Licencia

Este proyecto es privado y confidencial.