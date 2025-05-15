# Arquitectura de WearAliass Platform

## Visión general

WearAliass Platform es una aplicación multi-tenant diseñada para que múltiples empresas de tiendas de ropa gestionen sus operaciones de forma completamente independiente. La arquitectura está diseñada para ser robusta, escalable y segura.

## Arquitectura Multi-Tenant

### Estrategia de aislamiento de datos

Hemos implementado un enfoque de **esquema separado por tenant** en una base de datos compartida:

1. Existe una base de datos principal que contiene:
   - Tabla de tenants
   - Tabla de usuarios (con referencia al tenant al que pertenecen)
   - Otras tablas globales

2. Para cada tenant, se crea un esquema separado en la base de datos:
   - Cada esquema tiene el prefijo `tenant_` seguido del ID del tenant
   - Todas las tablas específicas del tenant (productos, ventas, etc.) se crean en su esquema correspondiente

Este enfoque proporciona:
- Aislamiento de datos estricto entre tenants
- Facilidad para realizar backups por tenant
- Mejor organización y mantenimiento
- Posibilidad de migrar un tenant a su propia base de datos si es necesario

### Gestión de tenants

La gestión de tenants se realiza a través de un módulo centralizado accesible solo por el Super Admin:
- Creación de nuevos tenants (automáticamente crea su esquema en la BD)
- Configuración de datos básicos (nombre, logo, contacto)
- Activación/desactivación de tenants
- Monitoreo de uso y estado

## Control de Acceso Basado en Roles (RBAC)

### Roles definidos

1. **Super Admin (Nivel Plataforma)**
   - Gestión completa de tenants
   - Acceso a métricas globales
   - Puede emular el rol de Admin en cualquier tenant (con registro de auditoría)

2. **Admin (Nivel Tenant)**
   - Gestión de usuarios dentro de su tenant
   - Acceso completo a todos los módulos de su tenant
   - Configuración de la tienda

3. **Vendedor (Nivel Tenant)**
   - Acceso al POS y consulta de catálogo
   - Visualización limitada a sus propias ventas
   - Dashboard personalizado con sus KPIs

4. **Contable (Nivel Tenant)**
   - Acceso a módulos financieros
   - Generación de reportes
   - Consulta de ventas y transacciones

5. **Cajero (Nivel Tenant)**
   - Acceso exclusivo al módulo de caja (POS)
   - Gestión de sesiones de caja

6. **Cliente (Nivel Tenant)**
   - Acceso a la tienda online del tenant
   - Gestión de su perfil y pedidos

### Implementación del RBAC

El sistema implementa el RBAC mediante:
- Middleware de autenticación basado en JWT
- Verificación de permisos en cada solicitud
- Validación de pertenencia al tenant correcto
- Filtrado de datos según el rol y permisos

## Arquitectura de la aplicación

### Backend (API REST)

- **Node.js con Express**: Framework web rápido y minimalista
- **TypeScript**: Tipado estático para mayor robustez
- **Sequelize ORM**: Mapeo objeto-relacional para PostgreSQL
- **JWT**: Autenticación basada en tokens
- **Arquitectura modular**: Organización por módulos funcionales

### Frontend (SPA)

- **React con TypeScript**: Biblioteca UI con tipado estático
- **Material-UI**: Framework de componentes para una UI consistente
- **Redux Toolkit**: Gestión de estado global
- **React Router**: Navegación entre páginas

## Seguridad

La plataforma implementa múltiples capas de seguridad:

1. **Autenticación**:
   - JWT con expiración configurable
   - Almacenamiento seguro de contraseñas (bcrypt)
   - Protección contra ataques de fuerza bruta

2. **Autorización**:
   - RBAC estricto
   - Validación de pertenencia al tenant
   - Auditoría de accesos sensibles

3. **Protección de datos**:
   - Aislamiento de datos por tenant
   - Validación de entrada
   - Sanitización de salida

4. **Seguridad de la aplicación**:
   - Protección contra XSS
   - Protección contra CSRF
   - Headers de seguridad (Helmet)
   - Rate limiting

## Escalabilidad

La arquitectura está diseñada para escalar horizontalmente:

1. **Backend**:
   - Servicios stateless que permiten múltiples instancias
   - Posibilidad de implementar balanceo de carga
   - Optimización de consultas a base de datos

2. **Base de datos**:
   - Índices optimizados
   - Posibilidad de sharding por tenant
   - Estrategias de caché

3. **Frontend**:
   - Lazy loading de componentes
   - Code splitting
   - Optimización de assets