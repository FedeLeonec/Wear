import { Request, Response } from 'express';
import { CashRegisterSession, Transaction, Product, User } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Abrir caja (iniciar sesión de caja)
 */
export const openRegister = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user;
    const { initialAmount, notes } = req.body;
    
    // Verificar si ya hay una caja abierta para este usuario
    const activeSession = await CashRegisterSession.findOne({
      where: {
        tenantId,
        userId,
        status: 'OPEN'
      }
    });
    
    if (activeSession) {
      return res.status(400).json({ 
        message: 'Ya tienes una caja abierta',
        session: activeSession
      });
    }
    
    // Crear nueva sesión de caja
    const session = await CashRegisterSession.create({
      tenantId,
      userId,
      initialAmount,
      currentAmount: initialAmount,
      status: 'OPEN',
      notes,
      openedAt: new Date()
    });
    
    // Registrar transacción de apertura
    await Transaction.create({
      tenantId,
      userId,
      amount: initialAmount,
      type: 'CASH_IN',
      description: `Apertura de caja #${session.id}`,
      paymentMethod: 'CASH',
      relatedEntityId: session.id,
      relatedEntityType: 'CASH_REGISTER'
    });
    
    return res.status(200).json({
      message: 'Caja abierta correctamente',
      session
    });
  } catch (error) {
    logger.error('Error al abrir caja:', error);
    return res.status(500).json({ message: 'Error al abrir caja', error });
  }
};

/**
 * Cerrar caja (finalizar sesión de caja)
 */
export const closeRegister = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user;
    const { finalAmount, notes } = req.body;
    
    // Buscar la sesión de caja abierta para este usuario
    const session = await CashRegisterSession.findOne({
      where: {
        tenantId,
        userId,
        status: 'OPEN'
      }
    });
    
    if (!session) {
      return res.status(404).json({ message: 'No hay una caja abierta para este usuario' });
    }
    
    // Calcular diferencia entre monto esperado y monto final
    const difference = finalAmount - session.currentAmount;
    
    // Actualizar sesión de caja
    await session.update({
      finalAmount,
      difference,
      status: 'CLOSED',
      notes: notes ? `${session.notes || ''} | Cierre: ${notes}` : session.notes,
      closedAt: new Date()
    });
    
    // Registrar transacción de cierre
    await Transaction.create({
      tenantId,
      userId,
      amount: finalAmount,
      type: 'CASH_OUT',
      description: `Cierre de caja #${session.id}`,
      paymentMethod: 'CASH',
      relatedEntityId: session.id,
      relatedEntityType: 'CASH_REGISTER'
    });
    
    return res.status(200).json({
      message: 'Caja cerrada correctamente',
      session: {
        ...session.toJSON(),
        difference
      }
    });
  } catch (error) {
    logger.error('Error al cerrar caja:', error);
    return res.status(500).json({ message: 'Error al cerrar caja', error });
  }
};

/**
 * Obtener estado actual de la caja
 */
export const getRegisterStatus = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user;
    
    // Buscar la sesión de caja abierta para este usuario
    const session = await CashRegisterSession.findOne({
      where: {
        tenantId,
        userId,
        status: 'OPEN'
      }
    });
    
    if (!session) {
      return res.status(200).json({ 
        status: 'CLOSED',
        message: 'No hay una caja abierta para este usuario'
      });
    }
    
    // Obtener transacciones de la sesión actual
    const transactions = await Transaction.findAll({
      where: {
        tenantId,
        userId,
        createdAt: {
          [Op.gte]: session.openedAt
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'OPEN',
      session,
      transactions
    });
  } catch (error) {
    logger.error('Error al obtener estado de caja:', error);
    return res.status(500).json({ message: 'Error al obtener estado de caja', error });
  }
};

/**
 * Realizar un movimiento de caja (entrada/salida de efectivo)
 */
export const registerMovement = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId } = req.user;
    const { amount, type, description } = req.body;
    
    // Validar tipo de movimiento
    if (type !== 'CASH_IN' && type !== 'CASH_OUT') {
      return res.status(400).json({ message: 'Tipo de movimiento inválido. Debe ser CASH_IN o CASH_OUT' });
    }
    
    // Buscar la sesión de caja abierta para este usuario
    const session = await CashRegisterSession.findOne({
      where: {
        tenantId,
        userId,
        status: 'OPEN'
      }
    });
    
    if (!session) {
      return res.status(400).json({ message: 'No hay una caja abierta para este usuario' });
    }
    
    // Actualizar monto actual de la caja
    const newAmount = type === 'CASH_IN' 
      ? session.currentAmount + amount 
      : session.currentAmount - amount;
    
    await session.update({ currentAmount: newAmount });
    
    // Registrar transacción
    const transaction = await Transaction.create({
      tenantId,
      userId,
      amount,
      type,
      description,
      paymentMethod: 'CASH',
      relatedEntityId: session.id,
      relatedEntityType: 'CASH_REGISTER'
    });
    
    return res.status(200).json({
      message: 'Movimiento registrado correctamente',
      transaction,
      currentAmount: newAmount
    });
  } catch (error) {
    logger.error('Error al registrar movimiento de caja:', error);
    return res.status(500).json({ message: 'Error al registrar movimiento de caja', error });
  }
};

/**
 * Buscar productos para el POS (búsqueda optimizada)
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { tenantId } = req.user;
    
    // Buscar productos que coincidan con la consulta
    const products = await Product.findAll({
      where: {
        tenantId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { sku: { [Op.iLike]: `%${query}%` } },
          { barcode: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 10 // Limitar resultados para mejor rendimiento
    });
    
    return res.status(200).json(products);
  } catch (error) {
    logger.error(`Error al buscar productos para POS con query "${req.params.query}":`, error);
    return res.status(500).json({ message: 'Error al buscar productos', error });
  }
};

/**
 * Escanear código de barras/QR
 */
export const scanCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const { tenantId } = req.user;
    
    if (!code) {
      return res.status(400).json({ message: 'Código no proporcionado' });
    }
    
    // Buscar producto por código de barras o QR
    const product = await Product.findOne({
      where: {
        tenantId,
        [Op.or]: [
          { barcode: code },
          { sku: code }
        ]
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    logger.error('Error al escanear código:', error);
    return res.status(500).json({ message: 'Error al escanear código', error });
  }
};

/**
 * Obtener resumen de ventas del día actual
 */
export const getDailySummary = async (req: Request, res: Response) => {
  try {
    const { tenantId, id: userId, role } = req.user;
    
    // Establecer fechas para el día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Construir condiciones de búsqueda según el rol
    const whereCondition: any = { 
      tenantId,
      createdAt: {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      }
    };
    
    // Si es vendedor, solo puede ver sus propias ventas
    if (role === 'VENDOR') {
      whereCondition.userId = userId;
    }
    
    // Obtener transacciones del día
    const transactions = await Transaction.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });
    
    // Calcular totales
    const totalSales = transactions.filter(t => t.type === 'INCOME').length;
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const cashIn = transactions
      .filter(t => t.type === 'CASH_IN')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const cashOut = transactions
      .filter(t => t.type === 'CASH_OUT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return res.status(200).json({
      date: today,
      totalSales,
      totalIncome,
      totalExpenses,
      cashIn,
      cashOut,
      netIncome: totalIncome - totalExpenses,
      cashFlow: cashIn - cashOut,
      transactions
    });
  } catch (error) {
    logger.error('Error al obtener resumen diario:', error);
    return res.status(500).json({ message: 'Error al obtener resumen diario', error });
  }
};

/**
 * Obtener clientes frecuentes para selección rápida
 */
export const getFrequentCustomers = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    
    // Buscar usuarios con rol CUSTOMER que tengan compras recientes
    const customers = await User.findAll({
      where: {
        tenantId,
        role: 'CUSTOMER'
      },
      attributes: ['id', 'name', 'email', 'phone'],
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });
    
    return res.status(200).json(customers);
  } catch (error) {
    logger.error('Error al obtener clientes frecuentes:', error);
    return res.status(500).json({ message: 'Error al obtener clientes frecuentes', error });
  }
};