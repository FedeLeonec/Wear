import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { loadAuthData } from '../../store/slices/authSlice';

// Función para obtener datos del localStorage
const getLocalStorageItem = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

// Función para guardar datos en localStorage
const setLocalStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
};

// Usuarios de prueba para desarrollo
const defaultUsers = [
  {
    id: '1',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@alias.com',
    password: 'Admin123!',
    role: 'SUPER_ADMIN',
    tenantId: null, // No tiene tenant específico
    isActive: true,
  },
  {
    id: '2',
    firstName: 'Admin',
    lastName: 'Usuario',
    email: 'admin@alias.com',
    password: 'Admin123!',
    role: 'ADMIN',
    tenantId: '1', // Tenant: Moda Express
    isActive: true,
  },
  {
    id: '3',
    firstName: 'Vendedor',
    lastName: 'Ejemplo',
    email: 'vendedor@alias.com',
    password: 'Vendedor123!',
    role: 'VENDOR',
    tenantId: '1', // Tenant: Moda Express
    isActive: true,
  },
  {
    id: '4',
    firstName: 'Cajero',
    lastName: 'Ejemplo',
    email: 'cajero@alias.com',
    password: 'Cajero123!',
    role: 'CASHIER',
    tenantId: '1', // Tenant: Moda Express
    isActive: true,
  },
  {
    id: '5',
    firstName: 'Contable',
    lastName: 'Ejemplo',
    email: 'contable@alias.com',
    password: 'Contable123!',
    role: 'ACCOUNTANT',
    tenantId: '1', // Tenant: Moda Express
    isActive: true,
  },
  {
    id: '6',
    firstName: 'Admin',
    lastName: 'Urban',
    email: 'admin@urbanstyle.com',
    password: 'Admin123!',
    role: 'ADMIN',
    tenantId: '2', // Tenant: Urban Style
    isActive: true,
  },
];// Datos de ejemplo para tenants
const defaultTenants = [
  {
    id: '1',
    name: 'Moda Express',
    domain: 'modaexpress',
    isActive: true,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-05-20T14:45:00Z',
    plan: 'premium',
    logo: 'https://via.placeholder.com/150',
    users: 5,
    sales: 0,
    customers: 0,
    products: 8,
    monthlyRevenue: 0,
    transactions: []
  },
  {
    id: '2',
    name: 'Urban Style',
    domain: 'urbanstyle',
    isActive: true,
    createdAt: '2023-02-10T09:15:00Z',
    updatedAt: '2023-06-05T11:20:00Z',
    plan: 'standard',
    logo: 'https://via.placeholder.com/150',
    users: 1,
    sales: 0,
    customers: 0,
    products: 0,
    monthlyRevenue: 0,
    transactions: []
  },
  {
    id: '3',
    name: 'Elegance Boutique',
    domain: 'elegance',
    isActive: false,
    createdAt: '2023-03-05T14:20:00Z',
    updatedAt: '2023-04-18T16:30:00Z',
    plan: 'basic',
    logo: 'https://via.placeholder.com/150',
    users: 1,
    sales: 0,
    customers: 0,
    products: 0,
    monthlyRevenue: 0,
    transactions: []
  },
  {
    id: '4',
    name: 'Fashion Hub',
    domain: 'fashionhub',
    isActive: true,
    createdAt: '2023-04-20T08:45:00Z',
    updatedAt: '2023-06-10T13:15:00Z',
    plan: 'premium',
    logo: 'https://via.placeholder.com/150',
    users: 1,
    sales: 0,
    customers: 0,
    products: 0,
    monthlyRevenue: 0,
    transactions: []
  },
];// Datos de ejemplo para transacciones
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
];// Datos de ejemplo para clientes
const defaultCustomers = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '555-1234',
    address: 'Calle Principal 123',
    city: 'Ciudad Capital',
    postalCode: '28001',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-01-20T10:30:00Z',
    updatedAt: '2023-05-15T14:45:00Z',
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@example.com',
    phone: '555-5678',
    address: 'Avenida Central 456',
    city: 'Ciudad Capital',
    postalCode: '28002',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-01-25T11:20:00Z',
    updatedAt: '2023-05-18T09:30:00Z',
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Ruiz',
    email: 'carlos.ruiz@example.com',
    phone: '555-9012',
    address: 'Plaza Mayor 789',
    city: 'Ciudad Secundaria',
    postalCode: '29001',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-02-05T14:15:00Z',
    updatedAt: '2023-05-20T16:40:00Z',
  },
  {
    id: '4',
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@example.com',
    phone: '555-3456',
    address: 'Calle Secundaria 321',
    city: 'Ciudad Capital',
    postalCode: '28003',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-02-10T09:45:00Z',
    updatedAt: '2023-05-22T11:20:00Z',
  },
  {
    id: '5',
    firstName: 'Pedro',
    lastName: 'González',
    email: 'pedro.gonzalez@example.com',
    phone: '555-7890',
    address: 'Avenida Principal 654',
    city: 'Ciudad Terciaria',
    postalCode: '30001',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-02-15T13:30:00Z',
    updatedAt: '2023-05-25T10:15:00Z',
  },
  {
    id: '6',
    firstName: 'Laura',
    lastName: 'Sánchez',
    email: 'laura.sanchez@example.com',
    phone: '555-2345',
    address: 'Calle Comercial 987',
    city: 'Ciudad Capital',
    postalCode: '28004',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-02-20T15:10:00Z',
    updatedAt: '2023-05-28T14:50:00Z',
  },
  {
    id: '7',
    firstName: 'Miguel',
    lastName: 'Fernández',
    email: 'miguel.fernandez@example.com',
    phone: '555-6789',
    address: 'Plaza Central 246',
    city: 'Ciudad Secundaria',
    postalCode: '29002',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-03-01T10:20:00Z',
    updatedAt: '2023-06-01T09:30:00Z',
  },
  {
    id: '8',
    firstName: 'Sofía',
    lastName: 'Díaz',
    email: 'sofia.diaz@example.com',
    phone: '555-0123',
    address: 'Avenida Comercial 135',
    city: 'Ciudad Capital',
    postalCode: '28005',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-03-05T11:45:00Z',
    updatedAt: '2023-06-05T13:20:00Z',
  },
  {
    id: '9',
    firstName: 'Javier',
    lastName: 'Torres',
    email: 'javier.torres@example.com',
    phone: '555-4567',
    address: 'Calle Residencial 864',
    city: 'Ciudad Terciaria',
    postalCode: '30002',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-03-10T14:30:00Z',
    updatedAt: '2023-06-10T15:40:00Z',
  },
  {
    id: '10',
    firstName: 'Carmen',
    lastName: 'Navarro',
    email: 'carmen.navarro@example.com',
    phone: '555-8901',
    address: 'Plaza Residencial 753',
    city: 'Ciudad Capital',
    postalCode: '28006',
    country: 'España',
    tenantId: '1',
    createdAt: '2023-03-15T16:20:00Z',
    updatedAt: '2023-06-15T17:30:00Z',
  }
];// Función para generar un token JWT simulado
const generateMockToken = (user: any) => {
  // En un entorno real, esto sería generado por el backend
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 horas
  }))}.MOCK_SIGNATURE`;
};

interface MockAuthProviderProps {
  children: React.ReactNode;
}

const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Inicializar datos mock en localStorage si no existen
    const mockUsers = getLocalStorageItem('mockUsers', defaultUsers);
    const mockTenants = getLocalStorageItem('mockTenants', defaultTenants);
    const mockProducts = getLocalStorageItem('mockProducts', defaultProducts);
    const mockTransactions = getLocalStorageItem('mockTransactions', defaultTransactions);
    const mockCustomers = getLocalStorageItem('mockCustomers', defaultCustomers);
    
    // Guardar datos mock en localStorage
    setLocalStorageItem('mockUsers', mockUsers);
    setLocalStorageItem('mockTenants', mockTenants);
    setLocalStorageItem('mockProducts', mockProducts);
    setLocalStorageItem('mockTransactions', mockTransactions);
    setLocalStorageItem('mockCustomers', mockCustomers);
    
    // Verificar si hay un usuario guardado en localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // Si hay datos guardados, cargarlos en el estado de Redux
      dispatch(loadAuthData());
    }
    
    setInitialized(true);
  }, [dispatch]);  // Exponer la función de login y datos mock al objeto window para poder usarlos desde la consola
  useEffect(() => {
    if (initialized) {
      // Función para iniciar sesión
      (window as any).mockLogin = (email: string, password: string) => {
        const mockUsers = getLocalStorageItem('mockUsers', defaultUsers);
        const user = mockUsers.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          // Eliminar la contraseña antes de guardar
          const { password, ...userWithoutPassword } = user;
          
          // Generar token
          const token = generateMockToken(user);
          
          // Guardar en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          console.log('Login exitoso:', userWithoutPassword);
          return true;
        } else {
          console.error('Credenciales incorrectas');
          return false;
        }
      };
      
      // Función para crear un nuevo tenant
      (window as any).createTenant = (tenantData: any, adminData: any) => {
        try {
          // Obtener datos actualizados
          const currentTenants = getLocalStorageItem('mockTenants', []);
          const currentUsers = getLocalStorageItem('mockUsers', []);
          
          // Crear nuevo tenant con estadísticas iniciales en cero
          const newTenant = {
            id: `${currentTenants.length + 1}`,
            name: tenantData.name,
            domain: tenantData.domain,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            plan: tenantData.plan || 'standard',
            logo: tenantData.logo || 'https://via.placeholder.com/150',
            users: 1, // El admin inicial
            sales: 0,
            customers: 0,
            products: 0,
            monthlyRevenue: 0,
            transactions: []
          };
          
          // Crear usuario admin para el tenant
          const newAdmin = {
            id: `${currentUsers.length + 1}`,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            email: adminData.email,
            password: adminData.password || 'Admin123!', // Contraseña por defecto si no se proporciona
            role: 'ADMIN',
            tenantId: newTenant.id,
            isActive: true,
          };
          
          // Actualizar datos en localStorage
          setLocalStorageItem('mockTenants', [...currentTenants, newTenant]);
          setLocalStorageItem('mockUsers', [...currentUsers, newAdmin]);
          
          console.log('Tenant creado:', newTenant);
          console.log('Admin creado:', newAdmin);
          
          return { tenant: newTenant, admin: newAdmin };
        } catch (error) {
          console.error('Error al crear tenant:', error);
          return null;
        }
      };      // Función para actualizar un tenant
      (window as any).updateTenant = (tenantId: string, tenantData: any) => {
        try {
          // Obtener datos actualizados
          const currentTenants = getLocalStorageItem('mockTenants', []);
          
          // Actualizar tenant
          const updatedTenants = currentTenants.map((t: any) => 
            t.id === tenantId ? { 
              ...t, 
              ...tenantData,
              updatedAt: new Date().toISOString() 
            } : t
          );
          
          // Guardar datos actualizados
          setLocalStorageItem('mockTenants', updatedTenants);
          
          console.log('Tenant actualizado:', updatedTenants.find((t: any) => t.id === tenantId));
          
          return updatedTenants.find((t: any) => t.id === tenantId);
        } catch (error) {
          console.error('Error al actualizar tenant:', error);
          return null;
        }
      };
      
      // Función para eliminar un tenant
      (window as any).deleteTenant = (tenantId: string) => {
        try {
          // Obtener datos actualizados
          const currentTenants = getLocalStorageItem('mockTenants', []);
          const currentUsers = getLocalStorageItem('mockUsers', []);
          
          // Eliminar tenant
          const updatedTenants = currentTenants.filter((t: any) => t.id !== tenantId);
          
          // Eliminar usuarios asociados al tenant
          const updatedUsers = currentUsers.filter((u: any) => u.tenantId !== tenantId);
          
          // Guardar datos actualizados
          setLocalStorageItem('mockTenants', updatedTenants);
          setLocalStorageItem('mockUsers', updatedUsers);
          
          console.log('Tenant eliminado:', tenantId);
          
          return true;
        } catch (error) {
          console.error('Error al eliminar tenant:', error);
          return false;
        }
      };
      
      // Función para entrar como admin de un tenant
      (window as any).loginAsTenant = (tenantId: string) => {
        try {
          const mockUsers = getLocalStorageItem('mockUsers', defaultUsers);
          // Buscar el admin del tenant
          const adminUser = mockUsers.find((u: any) => u.role === 'ADMIN' && u.tenantId === tenantId);
          
          if (adminUser) {
            // Eliminar la contraseña antes de guardar
            const { password, ...userWithoutPassword } = adminUser;
            
            // Generar token
            const token = generateMockToken(adminUser);
            
            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            
            console.log('Login como admin del tenant exitoso:', userWithoutPassword);
            return true;
          } else {
            console.error('No se encontró un admin para este tenant');
            return false;
          }
        } catch (error) {
          console.error('Error al entrar como admin del tenant:', error);
          return false;
        }
      };      // Función para crear un nuevo producto
      (window as any).createProduct = (productData: any) => {
        try {
          // Obtener datos actualizados
          const currentProducts = getLocalStorageItem('mockProducts', []);
          const currentTenants = getLocalStorageItem('mockTenants', []);
          
          // Crear nuevo producto
          const newProduct = {
            id: `${currentProducts.length + 1}`,
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          };
          
          // Actualizar datos en localStorage
          setLocalStorageItem('mockProducts', [...currentProducts, newProduct]);
          
          // Actualizar estadísticas del tenant
          const updatedTenants = currentTenants.map((t: any) => 
            t.id === productData.tenantId ? { 
              ...t, 
              products: t.products + 1,
              updatedAt: new Date().toISOString() 
            } : t
          );
          
          setLocalStorageItem('mockTenants', updatedTenants);
          
          console.log('Producto creado:', newProduct);
          
          return newProduct;
        } catch (error) {
          console.error('Error al crear producto:', error);
          return null;
        }
      };
      
      // Función para actualizar un producto
      (window as any).updateProduct = (productId: string, productData: any) => {
        try {
          // Obtener datos actualizados
          const currentProducts = getLocalStorageItem('mockProducts', []);
          
          // Actualizar producto
          const updatedProducts = currentProducts.map((p: any) => 
            p.id === productId ? { 
              ...p, 
              ...productData,
              updatedAt: new Date().toISOString() 
            } : p
          );
          
          // Guardar datos actualizados
          setLocalStorageItem('mockProducts', updatedProducts);
          
          console.log('Producto actualizado:', updatedProducts.find((p: any) => p.id === productId));
          
          return updatedProducts.find((p: any) => p.id === productId);
        } catch (error) {
          console.error('Error al actualizar producto:', error);
          return null;
        }
      };      // Función para procesar una venta
      (window as any).processTransaction = (transactionData: any) => {
        try {
          // Obtener datos actualizados
          const currentTransactions = getLocalStorageItem('mockTransactions', []);
          const currentTenants = getLocalStorageItem('mockTenants', []);
          const currentProducts = getLocalStorageItem('mockProducts', []);
          
          // Crear nueva transacción
          const newTransaction = {
            id: `${currentTransactions.length + 1}`,
            ...transactionData,
            date: new Date().toISOString(),
            status: 'completed'
          };
          
          // Actualizar datos en localStorage
          setLocalStorageItem('mockTransactions', [...currentTransactions, newTransaction]);
          
          // Actualizar estadísticas del tenant
          const tenant = currentTenants.find((t: any) => t.id === transactionData.tenantId);
          if (tenant) {
            const updatedTenants = currentTenants.map((t: any) => 
              t.id === transactionData.tenantId ? { 
                ...t, 
                sales: t.sales + 1,
                monthlyRevenue: t.monthlyRevenue + transactionData.total,
                transactions: [...(t.transactions || []), newTransaction.id],
                updatedAt: new Date().toISOString() 
              } : t
            );
            
            setLocalStorageItem('mockTenants', updatedTenants);
          }
          
          // Actualizar stock de productos
          const updatedProducts = currentProducts.map((p: any) => {
            const soldProduct = transactionData.products.find((tp: any) => tp.productId === p.id);
            if (soldProduct) {
              return {
                ...p,
                stock: p.stock - soldProduct.quantity,
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          });
          
          setLocalStorageItem('mockProducts', updatedProducts);
          
          console.log('Transacción procesada:', newTransaction);
          
          return newTransaction;
        } catch (error) {
          console.error('Error al procesar transacción:', error);
          return null;
        }
      };      // Exponer datos mock para usar en la aplicación
      (window as any).mockData = {
        getUsers: () => getLocalStorageItem('mockUsers', []).map(({ password, ...user }: any) => user), // Eliminar contraseñas
        getTenants: () => getLocalStorageItem('mockTenants', []),
        getProducts: () => getLocalStorageItem('mockProducts', []),
        getTransactions: () => getLocalStorageItem('mockTransactions', []),
        getCustomers: () => getLocalStorageItem('mockCustomers', []),
      };
      
      console.log('MockAuthProvider inicializado. Puedes usar window.mockLogin(email, password) para cambiar de usuario.');
      console.log('Usuarios disponibles:');
      const mockUsers = getLocalStorageItem('mockUsers', defaultUsers);
      mockUsers.forEach((user: any) => {
        console.log(`- ${user.role}: ${user.email} / ${user.password}`);
      });
    }
  }, [initialized]);

  return <>{children}</>;
};

// Exportar funciones y datos para usar en la aplicación
export const getMockTenants = () => getLocalStorageItem('mockTenants', defaultTenants);
export const getMockProducts = () => getLocalStorageItem('mockProducts', defaultProducts);
export const getMockTransactions = () => getLocalStorageItem('mockTransactions', defaultTransactions);
export const getCustomers = () => getLocalStorageItem('mockCustomers', defaultCustomers);

export default MockAuthProvider;