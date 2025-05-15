# Esquema de Base de Datos

## Visión general

WearAliass Platform utiliza PostgreSQL como sistema de gestión de base de datos relacional. La arquitectura de la base de datos está diseñada para soportar un modelo multi-tenant con aislamiento de datos por esquema.

## Estrategia Multi-Tenant

Utilizamos un enfoque de **esquema separado por tenant** en una base de datos compartida:

1. **Esquema público**: Contiene tablas globales como `tenants` y `users`.
2. **Esquemas por tenant**: Cada tenant tiene su propio esquema nombrado como `tenant_[id]` que contiene todas sus tablas específicas.

## Tablas Globales (Esquema público)

### tenants

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| name         | VARCHAR(255) | Nombre de la tienda                        |
| domain       | VARCHAR(255) | Subdominio único para la tienda online     |
| logo         | VARCHAR(255) | URL del logo                               |
| contactEmail | VARCHAR(255) | Email de contacto                          |
| contactPhone | VARCHAR(255) | Teléfono de contacto                       |
| address      | TEXT         | Dirección física                           |
| isActive     | BOOLEAN      | Estado del tenant                          |
| settings     | JSONB        | Configuraciones personalizadas             |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

### users

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| tenantId     | UUID         | Referencia al tenant (FK, null para Super Admin) |
| firstName    | VARCHAR(255) | Nombre                                     |
| lastName     | VARCHAR(255) | Apellido                                   |
| email        | VARCHAR(255) | Email (único)                              |
| password     | VARCHAR(255) | Contraseña (hash)                          |
| role         | ENUM         | Rol (SUPER_ADMIN, ADMIN, VENDOR, ACCOUNTANT, CASHIER, CUSTOMER) |
| isActive     | BOOLEAN      | Estado del usuario                         |
| lastLogin    | TIMESTAMP    | Fecha del último inicio de sesión          |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

## Tablas por Tenant (Esquema tenant_[id])

### products

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| tenantId     | UUID         | Referencia al tenant (FK)                  |
| name         | VARCHAR(255) | Nombre del producto                        |
| description  | TEXT         | Descripción                                |
| sku          | VARCHAR(255) | Código SKU                                 |
| barcode      | VARCHAR(255) | Código de barras                           |
| price        | DECIMAL(10,2)| Precio de venta                            |
| costPrice    | DECIMAL(10,2)| Precio de costo                            |
| categoryId   | UUID         | Referencia a la categoría (FK)             |
| images       | TEXT[]       | Array de URLs de imágenes                  |
| isActive     | BOOLEAN      | Estado del producto                        |
| stockAlert   | INTEGER      | Nivel de alerta de stock bajo              |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

### product_variants

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| productId    | UUID         | Referencia al producto (FK)                |
| tenantId     | UUID         | Referencia al tenant (FK)                  |
| sku          | VARCHAR(255) | Código SKU de la variante                  |
| barcode      | VARCHAR(255) | Código de barras de la variante            |
| size         | VARCHAR(255) | Talla                                      |
| color        | VARCHAR(255) | Color                                      |
| stock        | INTEGER      | Cantidad en stock                          |
| price        | DECIMAL(10,2)| Precio (si es diferente al producto base)  |
| images       | TEXT[]       | Array de URLs de imágenes específicas      |
| isActive     | BOOLEAN      | Estado de la variante                      |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

### categories

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| tenantId     | UUID         | Referencia al tenant (FK)                  |
| name         | VARCHAR(255) | Nombre de la categoría                     |
| description  | TEXT         | Descripción                                |
| parentId     | UUID         | Referencia a categoría padre (FK, self-ref)|
| image        | VARCHAR(255) | URL de imagen                              |
| isActive     | BOOLEAN      | Estado de la categoría                     |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

### sales

| Columna        | Tipo         | Descripción                                |
|----------------|--------------|-------------------------------------------|
| id             | UUID         | Identificador único (PK)                   |
| tenantId       | UUID         | Referencia al tenant (FK)                  |
| userId         | UUID         | Vendedor o cajero (FK)                     |
| customerId     | UUID         | Cliente (FK, opcional)                     |
| saleNumber     | VARCHAR(255) | Número de venta (único)                    |
| date           | TIMESTAMP    | Fecha y hora de la venta                   |
| subtotal       | DECIMAL(10,2)| Subtotal                                   |
| tax            | DECIMAL(10,2)| Impuestos                                  |
| discount       | DECIMAL(10,2)| Descuento                                  |
| total          | DECIMAL(10,2)| Total                                      |
| paymentMethod  | ENUM         | Método de pago (CASH, CREDIT_CARD, etc.)   |
| paymentStatus  | ENUM         | Estado del pago (PENDING, PAID, etc.)      |
| notes          | TEXT         | Notas adicionales                          |
| source         | ENUM         | Origen (POS, ECOMMERCE)                    |
| createdAt      | TIMESTAMP    | Fecha de creación                          |
| updatedAt      | TIMESTAMP    | Fecha de última actualización              |

### sale_items

| Columna      | Tipo         | Descripción                                |
|--------------|--------------|-------------------------------------------|
| id           | UUID         | Identificador único (PK)                   |
| saleId       | UUID         | Referencia a la venta (FK)                 |
| tenantId     | UUID         | Referencia al tenant (FK)                  |
| productId    | UUID         | Referencia al producto (FK)                |
| variantId    | UUID         | Referencia a la variante (FK, opcional)    |
| quantity     | INTEGER      | Cantidad                                   |
| unitPrice    | DECIMAL(10,2)| Precio unitario                            |
| discount     | DECIMAL(10,2)| Descuento                                  |
| total        | DECIMAL(10,2)| Total                                      |
| createdAt    | TIMESTAMP    | Fecha de creación                          |
| updatedAt    | TIMESTAMP    | Fecha de última actualización              |

### transactions

| Columna       | Tipo         | Descripción                                |
|---------------|--------------|-------------------------------------------|
| id            | UUID         | Identificador único (PK)                   |
| tenantId      | UUID         | Referencia al tenant (FK)                  |
| userId        | UUID         | Usuario que registra la transacción (FK)   |
| type          | ENUM         | Tipo (INCOME, EXPENSE)                     |
| amount        | DECIMAL(10,2)| Monto                                      |
| description   | TEXT         | Descripción                                |
| referenceId   | UUID         | ID de referencia (venta, compra, etc.)     |
| referenceType | VARCHAR(255) | Tipo de referencia (SALE, PURCHASE, etc.)  |
| date          | TIMESTAMP    | Fecha de la transacción                    |
| createdAt     | TIMESTAMP    | Fecha de creación                          |
| updatedAt     | TIMESTAMP    | Fecha de última actualización              |

### cash_register_sessions

| Columna        | Tipo         | Descripción                                |
|----------------|--------------|-------------------------------------------|
| id             | UUID         | Identificador único (PK)                   |
| tenantId       | UUID         | Referencia al tenant (FK)                  |
| userId         | UUID         | Usuario responsable de la caja (FK)        |
| openingAmount  | DECIMAL(10,2)| Monto inicial                              |
| closingAmount  | DECIMAL(10,2)| Monto final                                |
| expectedAmount | DECIMAL(10,2)| Monto esperado según ventas                |
| difference     | DECIMAL(10,2)| Diferencia (faltante/sobrante)             |
| notes          | TEXT         | Notas                                      |
| openedAt       | TIMESTAMP    | Fecha y hora de apertura                   |
| closedAt       | TIMESTAMP    | Fecha y hora de cierre                     |
| status         | ENUM         | Estado (OPEN, CLOSED)                      |
| createdAt      | TIMESTAMP    | Fecha de creación                          |
| updatedAt      | TIMESTAMP    | Fecha de última actualización              |

## Relaciones

- **users** pertenece a **tenants** (tenantId)
- **products** pertenece a **tenants** (tenantId) y a **categories** (categoryId)
- **product_variants** pertenece a **products** (productId) y a **tenants** (tenantId)
- **categories** pertenece a **tenants** (tenantId) y puede pertenecer a otra **categories** (parentId)
- **sales** pertenece a **tenants** (tenantId), a **users** como vendedor (userId) y opcionalmente a **users** como cliente (customerId)
- **sale_items** pertenece a **sales** (saleId), **products** (productId), opcionalmente a **product_variants** (variantId) y a **tenants** (tenantId)
- **transactions** pertenece a **tenants** (tenantId) y a **users** (userId)
- **cash_register_sessions** pertenece a **tenants** (tenantId) y a **users** (userId)