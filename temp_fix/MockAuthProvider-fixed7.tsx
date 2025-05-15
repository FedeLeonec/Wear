  // Exponer la función de login y datos mock al objeto window para poder usarlos desde la consola
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
      };