# API Endpoints

## Autenticación

### POST /api/auth/register
Registra un nuevo usuario.

**Roles permitidos:** Público (solo para clientes), SUPER_ADMIN, ADMIN

**Cuerpo de la solicitud:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "string (opcional, por defecto CUSTOMER)",
  "tenantId": "string (requerido excepto para SUPER_ADMIN)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "tenantId": "string"
}
```

### POST /api/auth/login
Inicia sesión y devuelve un token JWT.

**Roles permitidos:** Público

**Cuerpo de la solicitud:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "tenantId": "string"
  }
}
```

### GET /api/auth/verify
Verifica el token JWT y devuelve información del usuario.

**Roles permitidos:** Autenticado

**Respuesta:**
```json
{
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "tenantId": "string"
  }
}
```

### POST /api/auth/change-password
Cambia la contraseña del usuario autenticado.

**Roles permitidos:** Autenticado

**Cuerpo de la solicitud:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Respuesta:**
```json
{
  "message": "Password changed successfully"
}
```

## Tenants (Solo Super Admin)

### GET /api/tenants
Obtiene todos los tenants.

**Roles permitidos:** SUPER_ADMIN

**Respuesta:**
```json
[
  {
    "id": "string",
    "name": "string",
    "domain": "string",
    "logo": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "address": "string",
    "isActive": "boolean",
    "settings": "object",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### GET /api/tenants/:id
Obtiene un tenant por ID.

**Roles permitidos:** SUPER_ADMIN

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "domain": "string",
  "logo": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "address": "string",
  "isActive": "boolean",
  "settings": "object",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### POST /api/tenants
Crea un nuevo tenant.

**Roles permitidos:** SUPER_ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "string",
  "domain": "string",
  "contactEmail": "string",
  "logo": "string (opcional)",
  "contactPhone": "string (opcional)",
  "address": "string (opcional)",
  "settings": "object (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "domain": "string",
  "logo": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "address": "string",
  "isActive": true,
  "settings": "object",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### PUT /api/tenants/:id
Actualiza un tenant existente.

**Roles permitidos:** SUPER_ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "string (opcional)",
  "logo": "string (opcional)",
  "contactEmail": "string (opcional)",
  "contactPhone": "string (opcional)",
  "address": "string (opcional)",
  "settings": "object (opcional)",
  "isActive": "boolean (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "domain": "string",
  "logo": "string",
  "contactEmail": "string",
  "contactPhone": "string",
  "address": "string",
  "isActive": "boolean",
  "settings": "object",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### PATCH /api/tenants/:id/toggle-active
Activa o desactiva un tenant.

**Roles permitidos:** SUPER_ADMIN

**Respuesta:**
```json
{
  "message": "Tenant activated/deactivated successfully",
  "tenant": {
    "id": "string",
    "name": "string",
    "isActive": "boolean"
  }
}
```

### DELETE /api/tenants/:id
Desactiva un tenant (soft delete).

**Roles permitidos:** SUPER_ADMIN

**Respuesta:**
```json
{
  "message": "Tenant deactivated successfully"
}
```

## Usuarios

### GET /api/users
Obtiene todos los usuarios (filtrado por tenant si no es Super Admin).

**Roles permitidos:** SUPER_ADMIN, ADMIN

**Parámetros de consulta:**
- `role` (opcional): Filtrar por rol
- `tenantId` (opcional, solo para SUPER_ADMIN): Filtrar por tenant

**Respuesta:**
```json
[
  {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "tenantId": "string",
    "isActive": "boolean",
    "lastLogin": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### GET /api/users/:id
Obtiene un usuario por ID.

**Roles permitidos:** SUPER_ADMIN, ADMIN, o el propio usuario

**Respuesta:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "tenantId": "string",
  "isActive": "boolean",
  "lastLogin": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### POST /api/users
Crea un nuevo usuario.

**Roles permitidos:** SUPER_ADMIN, ADMIN

**Cuerpo de la solicitud:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "string",
  "tenantId": "string (requerido excepto para SUPER_ADMIN)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "tenantId": "string",
  "isActive": "boolean"
}
```

### PUT /api/users/:id
Actualiza un usuario existente.

**Roles permitidos:** SUPER_ADMIN, ADMIN (solo usuarios de su tenant), o el propio usuario

**Cuerpo de la solicitud:**
```json
{
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "email": "string (opcional)",
  "role": "string (opcional)",
  "isActive": "boolean (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "tenantId": "string",
  "isActive": "boolean"
}
```

### PATCH /api/users/:id/toggle-active
Activa o desactiva un usuario.

**Roles permitidos:** SUPER_ADMIN, ADMIN (solo usuarios de su tenant)

**Respuesta:**
```json
{
  "message": "User activated/deactivated successfully",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "tenantId": "string",
    "isActive": "boolean"
  }
}
```

### DELETE /api/users/:id
Desactiva un usuario (soft delete).

**Roles permitidos:** SUPER_ADMIN, ADMIN (solo usuarios de su tenant)

**Respuesta:**
```json
{
  "message": "User deactivated successfully"
}
```

## Productos

### GET /api/products
Obtiene todos los productos del tenant.

**Roles permitidos:** ADMIN, VENDOR, ACCOUNTANT, CASHIER

**Parámetros de consulta:**
- `categoryId` (opcional): Filtrar por categoría
- `search` (opcional): Buscar por nombre, SKU o descripción
- `active` (opcional): Filtrar por estado (true/false)

**Respuesta:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "sku": "string",
    "barcode": "string",
    "price": "number",
    "costPrice": "number",
    "categoryId": "string",
    "images": ["string"],
    "isActive": "boolean",
    "stockAlert": "number",
    "createdAt": "string",
    "updatedAt": "string",
    "category": {
      "id": "string",
      "name": "string"
    },
    "variants": [
      {
        "id": "string",
        "sku": "string",
        "size": "string",
        "color": "string",
        "stock": "number",
        "price": "number"
      }
    ]
  }
]
```

### GET /api/products/:id
Obtiene un producto por ID.

**Roles permitidos:** ADMIN, VENDOR, ACCOUNTANT, CASHIER

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string",
  "barcode": "string",
  "price": "number",
  "costPrice": "number",
  "categoryId": "string",
  "images": ["string"],
  "isActive": "boolean",
  "stockAlert": "number",
  "createdAt": "string",
  "updatedAt": "string",
  "category": {
    "id": "string",
    "name": "string"
  },
  "variants": [
    {
      "id": "string",
      "sku": "string",
      "size": "string",
      "color": "string",
      "stock": "number",
      "price": "number",
      "images": ["string"]
    }
  ]
}
```

### POST /api/products
Crea un nuevo producto.

**Roles permitidos:** ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "string",
  "description": "string",
  "sku": "string",
  "barcode": "string (opcional)",
  "price": "number",
  "costPrice": "number (opcional)",
  "categoryId": "string (opcional)",
  "images": ["string (opcional)"],
  "stockAlert": "number (opcional)",
  "variants": [
    {
      "sku": "string",
      "size": "string (opcional)",
      "color": "string (opcional)",
      "stock": "number",
      "price": "number (opcional)",
      "images": ["string (opcional)"]
    }
  ]
}
```

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string",
  "barcode": "string",
  "price": "number",
  "costPrice": "number",
  "categoryId": "string",
  "images": ["string"],
  "isActive": true,
  "stockAlert": "number",
  "createdAt": "string",
  "updatedAt": "string",
  "variants": [
    {
      "id": "string",
      "sku": "string",
      "size": "string",
      "color": "string",
      "stock": "number",
      "price": "number",
      "images": ["string"]
    }
  ]
}
```

### PUT /api/products/:id
Actualiza un producto existente.

**Roles permitidos:** ADMIN

**Cuerpo de la solicitud:**
```json
{
  "name": "string (opcional)",
  "description": "string (opcional)",
  "sku": "string (opcional)",
  "barcode": "string (opcional)",
  "price": "number (opcional)",
  "costPrice": "number (opcional)",
  "categoryId": "string (opcional)",
  "images": ["string (opcional)"],
  "isActive": "boolean (opcional)",
  "stockAlert": "number (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "sku": "string",
  "barcode": "string",
  "price": "number",
  "costPrice": "number",
  "categoryId": "string",
  "images": ["string"],
  "isActive": "boolean",
  "stockAlert": "number",
  "updatedAt": "string"
}
```

## Ventas (POS)

### POST /api/pos/sales
Crea una nueva venta.

**Roles permitidos:** ADMIN, VENDOR, CASHIER

**Cuerpo de la solicitud:**
```json
{
  "customerId": "string (opcional)",
  "items": [
    {
      "productId": "string",
      "variantId": "string (opcional)",
      "quantity": "number",
      "unitPrice": "number",
      "discount": "number"
    }
  ],
  "subtotal": "number",
  "tax": "number",
  "discount": "number",
  "total": "number",
  "paymentMethod": "string (CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER, QR)",
  "notes": "string (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "saleNumber": "string",
  "date": "string",
  "subtotal": "number",
  "tax": "number",
  "discount": "number",
  "total": "number",
  "paymentMethod": "string",
  "paymentStatus": "string",
  "notes": "string",
  "source": "POS",
  "items": [
    {
      "id": "string",
      "productId": "string",
      "variantId": "string",
      "quantity": "number",
      "unitPrice": "number",
      "discount": "number",
      "total": "number",
      "product": {
        "name": "string",
        "sku": "string"
      }
    }
  ],
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "customer": {
    "id": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### POST /api/pos/cash-register/open
Abre una sesión de caja.

**Roles permitidos:** ADMIN, VENDOR, CASHIER

**Cuerpo de la solicitud:**
```json
{
  "openingAmount": "number",
  "notes": "string (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "openingAmount": "number",
  "notes": "string",
  "openedAt": "string",
  "status": "OPEN",
  "user": {
    "id": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### POST /api/pos/cash-register/close
Cierra una sesión de caja.

**Roles permitidos:** ADMIN, VENDOR, CASHIER

**Cuerpo de la solicitud:**
```json
{
  "closingAmount": "number",
  "notes": "string (opcional)"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "openingAmount": "number",
  "closingAmount": "number",
  "expectedAmount": "number",
  "difference": "number",
  "notes": "string",
  "openedAt": "string",
  "closedAt": "string",
  "status": "CLOSED"
}
```

## eCommerce (Público)

### GET /api/ecommerce/:tenantDomain/products
Obtiene productos para la tienda online.

**Roles permitidos:** Público

**Parámetros de consulta:**
- `categoryId` (opcional): Filtrar por categoría
- `search` (opcional): Buscar por nombre o descripción
- `page` (opcional): Número de página
- `limit` (opcional): Límite de resultados por página

**Respuesta:**
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "images": ["string"],
      "category": {
        "id": "string",
        "name": "string"
      },
      "variants": [
        {
          "id": "string",
          "size": "string",
          "color": "string",
          "price": "number",
          "stock": "number",
          "images": ["string"]
        }
      ]
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  }
}
```

### POST /api/ecommerce/:tenantDomain/checkout
Procesa una compra en la tienda online.

**Roles permitidos:** Público (cliente autenticado o no)

**Cuerpo de la solicitud:**
```json
{
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string (opcional)"
  },
  "items": [
    {
      "productId": "string",
      "variantId": "string (opcional)",
      "quantity": "number"
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "paymentMethod": "string (CREDIT_CARD, DEBIT_CARD, TRANSFER, QR)",
  "paymentDetails": {
    // Detalles específicos según el método de pago
  }
}
```

**Respuesta:**
```json
{
  "orderId": "string",
  "orderNumber": "string",
  "total": "number",
  "paymentStatus": "string",
  "paymentUrl": "string (opcional, para redirección a pasarela de pago)"
}
```

## Contabilidad

### GET /api/accounting/transactions
Obtiene transacciones financieras.

**Roles permitidos:** ADMIN, ACCOUNTANT

**Parámetros de consulta:**
- `startDate` (opcional): Fecha de inicio
- `endDate` (opcional): Fecha de fin
- `type` (opcional): Tipo de transacción (INCOME, EXPENSE)

**Respuesta:**
```json
[
  {
    "id": "string",
    "type": "string",
    "amount": "number",
    "description": "string",
    "referenceId": "string",
    "referenceType": "string",
    "date": "string",
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string"
    }
  }
]
```

### POST /api/accounting/transactions
Registra una nueva transacción.

**Roles permitidos:** ADMIN, ACCOUNTANT

**Cuerpo de la solicitud:**
```json
{
  "type": "string (INCOME, EXPENSE)",
  "amount": "number",
  "description": "string",
  "referenceId": "string (opcional)",
  "referenceType": "string (opcional)",
  "date": "string"
}
```

**Respuesta:**
```json
{
  "id": "string",
  "type": "string",
  "amount": "number",
  "description": "string",
  "referenceId": "string",
  "referenceType": "string",
  "date": "string",
  "createdAt": "string"
}
```

## Reportes

### GET /api/reports/sales
Obtiene reporte de ventas.

**Roles permitidos:** ADMIN, ACCOUNTANT

**Parámetros de consulta:**
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `groupBy` (opcional): Agrupar por (day, week, month)
- `userId` (opcional): Filtrar por vendedor

**Respuesta:**
```json
{
  "summary": {
    "totalSales": "number",
    "totalAmount": "number",
    "averageAmount": "number"
  },
  "byPeriod": [
    {
      "period": "string",
      "sales": "number",
      "amount": "number"
    }
  ],
  "byPaymentMethod": [
    {
      "method": "string",
      "sales": "number",
      "amount": "number"
    }
  ],
  "byUser": [
    {
      "userId": "string",
      "firstName": "string",
      "lastName": "string",
      "sales": "number",
      "amount": "number"
    }
  ]
}
```

### GET /api/reports/inventory
Obtiene reporte de inventario.

**Roles permitidos:** ADMIN, ACCOUNTANT

**Parámetros de consulta:**
- `lowStock` (opcional): Mostrar solo productos con stock bajo
- `categoryId` (opcional): Filtrar por categoría

**Respuesta:**
```json
{
  "summary": {
    "totalProducts": "number",
    "totalVariants": "number",
    "lowStockProducts": "number",
    "estimatedValue": "number"
  },
  "products": [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "category": "string",
      "variants": [
        {
          "id": "string",
          "sku": "string",
          "size": "string",
          "color": "string",
          "stock": "number",
          "stockAlert": "number",
          "value": "number"
        }
      ],
      "totalStock": "number",
      "totalValue": "number"
    }
  ]
}
```

### GET /api/reports/financial
Obtiene reporte financiero.

**Roles permitidos:** ADMIN, ACCOUNTANT

**Parámetros de consulta:**
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `groupBy` (opcional): Agrupar por (day, week, month)

**Respuesta:**
```json
{
  "summary": {
    "totalIncome": "number",
    "totalExpense": "number",
    "netProfit": "number"
  },
  "byPeriod": [
    {
      "period": "string",
      "income": "number",
      "expense": "number",
      "profit": "number"
    }
  ],
  "byCategory": [
    {
      "category": "string",
      "amount": "number",
      "percentage": "number"
    }
  ]
}
```