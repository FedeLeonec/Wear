import { Request, Response } from 'express';
import { Sale, SaleItem, Product, ProductVariant, User, Transaction } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import sequelize from '../config/database';

/**
 * Mapea el estado de pago de una venta al estado correspondiente en la transacción
 */
const mapPaymentStatusToTransactionStatus = (paymentStatus: string): string => {
  switch (paymentStatus.toUpperCase()) {
    case 'PAID':
      return 'COMPLETED';
    case 'PENDING':
      return 'INCOMPLETE';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'REFUNDED':
      return 'REFUNDED';
    default:
      return 'INCOMPLETE';
  }
};

/**
 * Obtener todas las ventas
 */
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const { tenantId, role, id } = req.user;
    
    // Construir condiciones de búsqueda según el rol
    const whereCondition: any = { tenantId };
    
    // Si es vendedor, solo puede ver sus propias ventas
    if (role === 'VENDOR') {
      whereCondition.userId = id;
    }
    
    const sales = await Sale.findAll({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(sales);
  } catch (error) {
    logger.error('Error al obtener ventas:', error);
    return res.status(500).json({ message: 'Error al obtener ventas', error });
  }
};

/**
 * Obtener una venta por ID
 */
export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId, role, id: userId } = req.user;
    
    // Construir condiciones de búsqueda según el rol
    const whereCondition: any = { id, tenantId };
    
    // Si es vendedor, solo puede ver sus propias ventas
    if (role === 'VENDOR') {
      whereCondition.userId = userId;
    }
    
    const sale = await Sale.findOne({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    return res.status(200).json(sale);
  } catch (error) {
    logger.error(`Error al obtener venta ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener venta', error });
  }
};

/**
 * Crear una nueva venta
 */
export const createSale = async (req: Request, res: Response) => {
  // Iniciar transacción de base de datos
  const transaction = await sequelize.transaction();
  
  try {
    const { tenantId, id: userId } = req.user;
    const { items, customerId, paymentMethod, paymentStatus, notes } = req.body;
    
    // Validar que haya items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
    }
    
    // Calcular total de la venta
    let total = 0;
    const validatedItems = [];
    
    // Validar cada item y calcular el total
    for (const item of items) {
      const { productId, variantId, quantity, price } = item;
      
      // Validar que el producto exista y pertenezca al tenant
      const product = await Product.findOne({
        where: { id: productId, tenantId },
        transaction
      });
      
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ message: `Producto con ID ${productId} no encontrado` });
      }
      
      // Si se especifica una variante, validarla
      if (variantId) {
        const variant = await ProductVariant.findOne({
          where: { id: variantId, productId, tenantId },
          transaction
        });
        
        if (!variant) {
          await transaction.rollback();
          return res.status(400).json({ message: `Variante con ID ${variantId} no encontrada` });
        }
        
        // Verificar stock de la variante
        if (variant.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Stock insuficiente para la variante ${variant.name} del producto ${product.name}`,
            available: variant.stock,
            requested: quantity
          });
        }
        
        // Actualizar stock de la variante
        await variant.update({ stock: variant.stock - quantity }, { transaction });
      } else {
        // Verificar stock del producto principal
        if (product.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: `Stock insuficiente para el producto ${product.name}`,
            available: product.stock,
            requested: quantity
          });
        }
        
        // Actualizar stock del producto
        await product.update({ stock: product.stock - quantity }, { transaction });
      }
      
      // Calcular subtotal del item
      const subtotal = price * quantity;
      total += subtotal;
      
      validatedItems.push({
        productId,
        variantId,
        quantity,
        price,
        subtotal,
        tenantId
      });
    }
    
    // Crear la venta
    const sale = await Sale.create({
      tenantId,
      userId,
      customerId,
      total,
      paymentMethod,
      paymentStatus,
      notes
    }, { transaction });
    
    // Crear los items de la venta
    const saleItems = validatedItems.map(item => ({
      ...item,
      saleId: sale.id
    }));
    
    await SaleItem.bulkCreate(saleItems, { transaction });
    
    // Si el pago está completado, registrar la transacción
    if (paymentStatus === 'PAID') {
      await Transaction.create({
        tenantId,
        userId,
        amount: total,
        type: 'INCOME',
        description: `Pago de venta #${sale.id}`,
        paymentMethod,
        relatedEntityId: sale.id,
        relatedEntityType: 'SALE',
        status: mapPaymentStatusToTransactionStatus(paymentStatus)
      }, { transaction });
    }
    
    // Confirmar la transacción
    await transaction.commit();
    
    // Obtener la venta completa con sus relaciones
    const createdSale = await Sale.findByPk(sale.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ]
    });
    
    return res.status(201).json(createdSale);
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    logger.error('Error al crear venta:', error);
    return res.status(500).json({ message: 'Error al crear venta', error });
  }
};

/**
 * Actualizar una venta existente
 */
export const updateSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { paymentStatus, notes } = req.body;
    
    // Verificar que la venta exista y pertenezca al tenant
    const sale = await Sale.findOne({
      where: { id, tenantId }
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Solo permitir actualizar ciertos campos
    const updateData: any = {};
    
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes) updateData.notes = notes;
    
    // Si se está cambiando el estado de pago a PAID, registrar la transacción
    if (paymentStatus === 'PAID' && sale.paymentStatus !== 'PAID') {
      await Transaction.create({
        tenantId,
        userId: req.user.id,
        amount: sale.total,
        type: 'INCOME',
        description: `Pago de venta #${sale.id}`,
        paymentMethod: sale.paymentMethod,
        relatedEntityId: sale.id,
        relatedEntityType: 'SALE',
        status: 'COMPLETED'
      });
    } else if (paymentStatus && paymentStatus !== sale.paymentStatus) {
      // Si está cambiando a otro estado, buscar la transacción existente y actualizarla
      const existingTransaction = await Transaction.findOne({
        where: {
          relatedEntityId: sale.id,
          relatedEntityType: 'SALE'
        }
      });
      
      if (existingTransaction) {
        await existingTransaction.update({
          status: mapPaymentStatusToTransactionStatus(paymentStatus)
        });
      }
    }
    
    await sale.update(updateData);
    
    // Obtener la venta actualizada con sus relaciones
    const updatedSale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ]
    });
    
    return res.status(200).json(updatedSale);
  } catch (error) {
    logger.error(`Error al actualizar venta ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar venta', error });
  }
};

/**
 * Anular una venta
 */
export const voidSale = async (req: Request, res: Response) => {
  // Iniciar transacción de base de datos
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { reason } = req.body;
    
    // Verificar que la venta exista y pertenezca al tenant
    const sale = await Sale.findOne({
      where: { id, tenantId },
      include: [
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ],
      transaction
    });
    
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar que la venta no esté ya anulada
    if (sale.status === 'VOIDED') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta ya está anulada' });
    }
    
    // Restaurar el inventario
    for (const item of sale.items) {
      if (item.variantId) {
        const variant = await ProductVariant.findByPk(item.variantId, { transaction });
        if (variant) {
          await variant.update({ stock: variant.stock + item.quantity }, { transaction });
        }
      } else {
        const product = await Product.findByPk(item.productId, { transaction });
        if (product) {
          await product.update({ stock: product.stock + item.quantity }, { transaction });
        }
      }
    }
    
    // Anular la venta
    await sale.update({
      status: 'VOIDED',
      notes: reason ? `${sale.notes || ''} [ANULADA: ${reason}]` : `${sale.notes || ''} [ANULADA]`
    }, { transaction });
    
    // Si había una transacción de pago, registrar la devolución
    if (sale.paymentStatus === 'PAID') {
      await Transaction.create({
        tenantId,
        userId: req.user.id,
        amount: sale.total,
        type: 'EXPENSE',
        description: `Devolución por anulación de venta #${sale.id}`,
        paymentMethod: sale.paymentMethod,
        relatedEntityId: sale.id,
        relatedEntityType: 'SALE_VOID',
        status: 'REFUNDED'
      }, { transaction });
      
      // Actualizar el estado de la transacción original a CANCELLED
      const originalTransaction = await Transaction.findOne({
        where: {
          relatedEntityId: sale.id,
          relatedEntityType: 'SALE'
        },
        transaction
      });
      
      if (originalTransaction) {
        await originalTransaction.update({ status: 'CANCELLED' }, { transaction });
      }
      
      // Actualizar el estado de pago
      await sale.update({ paymentStatus: 'REFUNDED' }, { transaction });
    }
    
    // Confirmar la transacción
    await transaction.commit();
    
    // Obtener la venta actualizada
    const voidedSale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ]
    });
    
    return res.status(200).json(voidedSale);
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    logger.error(`Error al anular venta ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al anular venta', error });
  }
};

/**
 * Obtener ventas por período
 */
export const getSalesByPeriod = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.params;
    const { tenantId, role, id: userId } = req.user;
    
    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Fechas inválidas' });
    }
    
    // Construir condiciones de búsqueda según el rol
    const whereCondition: any = { 
      tenantId,
      createdAt: {
        [Op.between]: [start, end]
      }
    };
    
    // Si es vendedor, solo puede ver sus propias ventas
    if (role === 'VENDOR') {
      whereCondition.userId = userId;
    }
    
    const sales = await Sale.findAll({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calcular estadísticas
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.status !== 'VOIDED' ? sale.total : 0), 0);
    const voidedSales = sales.filter(sale => sale.status === 'VOIDED').length;
    
    return res.status(200).json({
      sales,
      stats: {
        totalSales,
        totalAmount,
        voidedSales
      }
    });
  } catch (error) {
    logger.error(`Error al obtener ventas por período:`, error);
    return res.status(500).json({ message: 'Error al obtener ventas por período', error });
  }
};

/**
 * Obtener ventas por vendedor
 */
export const getSalesByVendor = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que el vendedor exista y pertenezca al tenant
    const vendor = await User.findOne({
      where: { id: vendorId, tenantId }
    });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendedor no encontrado' });
    }
    
    const sales = await Sale.findAll({
      where: { userId: vendorId, tenantId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calcular estadísticas
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.status !== 'VOIDED' ? sale.total : 0), 0);
    const voidedSales = sales.filter(sale => sale.status === 'VOIDED').length;
    
    return res.status(200).json({
      sales,
      stats: {
        totalSales,
        totalAmount,
        voidedSales
      }
    });
  } catch (error) {
    logger.error(`Error al obtener ventas del vendedor ${req.params.vendorId}:`, error);
    return res.status(500).json({ message: 'Error al obtener ventas por vendedor', error });
  }
};

/**
 * Registrar pago de una venta
 */
export const registerPayment = async (req: Request, res: Response) => {
  // Iniciar transacción de base de datos
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { paymentMethod, amount } = req.body;
    
    // Verificar que la venta exista y pertenezca al tenant
    const sale = await Sale.findOne({
      where: { id, tenantId },
      transaction
    });
    
    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Verificar que la venta no esté anulada
    if (sale.status === 'VOIDED') {
      await transaction.rollback();
      return res.status(400).json({ message: 'No se puede registrar pago en una venta anulada' });
    }
    
    // Verificar que la venta no esté ya pagada
    if (sale.paymentStatus === 'PAID') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La venta ya está pagada' });
    }
    
    // Verificar que el monto sea correcto
    if (amount !== sale.total) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'El monto del pago no coincide con el total de la venta',
        expected: sale.total,
        received: amount
      });
    }
    
    // Actualizar el estado de pago de la venta
    await sale.update({
      paymentStatus: 'PAID',
      paymentMethod
    }, { transaction });
    
    // Registrar la transacción
    await Transaction.create({
      tenantId,
      userId: req.user.id,
      amount,
      type: 'INCOME',
      description: `Pago de venta #${sale.id}`,
      paymentMethod,
      relatedEntityId: sale.id,
      relatedEntityType: 'SALE',
      status: 'COMPLETED'
    }, { transaction });
    
    // Confirmar la transacción
    await transaction.commit();
    
    // Obtener la venta actualizada
    const updatedSale = await Sale.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { 
          model: SaleItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: ProductVariant, as: 'variant' }
          ]
        }
      ]
    });
    
    return res.status(200).json(updatedSale);
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    logger.error(`Error al registrar pago de venta ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al registrar pago', error });
  }
};