      // Función para procesar una venta
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
      };