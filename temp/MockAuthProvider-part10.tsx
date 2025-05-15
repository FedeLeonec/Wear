      // Exponer datos mock para usar en la aplicación
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