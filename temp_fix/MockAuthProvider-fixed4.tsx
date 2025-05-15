// Datos de ejemplo para transacciones
const defaultTransactions = [
  {
    id: '1',
    products: [
      { productId: '1', name: 'Camiseta Básica', quantity: 2, price: 19.99 },
      { productId: '2', name: 'Pantalón Vaquero', quantity: 1, price: 49.99 }
    ],
    customerId: '1',
    customerName: 'Juan Pérez',
    total: 89.97,
    date: '2023-06-15T14:30:00Z',
    paymentMethod: 'Efectivo',
    status: 'completed',
    vendorId: '3',
    vendorName: 'Vendedor Ejemplo',
    tenantId: '1'
  },
  {
    id: '2',
    products: [
      { productId: '3', name: 'Vestido Floral', quantity: 1, price: 39.99 },
      { productId: '5', name: 'Zapatillas Deportivas', quantity: 1, price: 59.99 }
    ],
    customerId: '2',
    customerName: 'María López',
    total: 99.98,
    date: '2023-06-14T11:15:00Z',
    paymentMethod: 'Tarjeta',
    status: 'completed',
    vendorId: '3',
    vendorName: 'Vendedor Ejemplo',
    tenantId: '1'
  },
  {
    id: '3',
    products: [
      { productId: '4', name: 'Chaqueta de Cuero', quantity: 1, price: 89.99 }
    ],
    customerId: '3',
    customerName: 'Carlos Ruiz',
    total: 89.99,
    date: '2023-06-13T16:45:00Z',
    paymentMethod: 'Transferencia',
    status: 'completed',
    vendorId: '3',
    vendorName: 'Vendedor Ejemplo',
    tenantId: '1'
  },
  {
    id: '4',
    products: [
      { productId: '6', name: 'Sudadera con Capucha', quantity: 2, price: 34.99 },
      { productId: '8', name: 'Falda Plisada', quantity: 1, price: 29.99 }
    ],
    customerId: '4',
    customerName: 'Ana Martínez',
    total: 99.97,
    date: '2023-06-12T10:30:00Z',
    paymentMethod: 'QR',
    status: 'completed',
    vendorId: '3',
    vendorName: 'Vendedor Ejemplo',
    tenantId: '1'
  }
];