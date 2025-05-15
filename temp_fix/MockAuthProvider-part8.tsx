      // Función para actualizar un tenant
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
      };