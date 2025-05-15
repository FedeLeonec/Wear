      // Función para crear un nuevo producto
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
      };