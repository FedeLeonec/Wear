import { Request, Response } from 'express';
import { Product, ProductVariant, Category } from '../models';
import { logger } from '../utils/logger';

/**
 * Obtener todos los productos
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    
    const products = await Product.findAll({
      where: { tenantId },
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    return res.status(200).json(products);
  } catch (error) {
    logger.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error al obtener productos', error });
  }
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const product = await Product.findOne({
      where: { id, tenantId },
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    logger.error(`Error al obtener producto ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener producto', error });
  }
};

/**
 * Crear un nuevo producto
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    const productData = { ...req.body, tenantId };
    
    // Validar que la categoría exista y pertenezca al tenant
    if (productData.categoryId) {
      const category = await Category.findOne({
        where: { id: productData.categoryId, tenantId }
      });
      
      if (!category) {
        return res.status(400).json({ message: 'La categoría no existe o no pertenece a este tenant' });
      }
    }
    
    const product = await Product.create(productData);
    
    // Crear variantes si se proporcionan
    if (req.body.variants && Array.isArray(req.body.variants)) {
      const variants = req.body.variants.map((variant: any) => ({
        ...variant,
        productId: product.id,
        tenantId
      }));
      
      await ProductVariant.bulkCreate(variants);
    }
    
    // Obtener el producto con sus relaciones
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    return res.status(201).json(createdProduct);
  } catch (error) {
    logger.error('Error al crear producto:', error);
    return res.status(500).json({ message: 'Error al crear producto', error });
  }
};

/**
 * Actualizar un producto existente
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const productData = req.body;
    
    // Verificar que el producto exista y pertenezca al tenant
    const product = await Product.findOne({
      where: { id, tenantId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Validar que la categoría exista y pertenezca al tenant si se está actualizando
    if (productData.categoryId) {
      const category = await Category.findOne({
        where: { id: productData.categoryId, tenantId }
      });
      
      if (!category) {
        return res.status(400).json({ message: 'La categoría no existe o no pertenece a este tenant' });
      }
    }
    
    // Actualizar el producto
    await product.update(productData);
    
    // Actualizar o crear variantes si se proporcionan
    if (productData.variants && Array.isArray(productData.variants)) {
      // Eliminar variantes existentes que no estén en la nueva lista
      const variantIds = productData.variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);
      
      await ProductVariant.destroy({
        where: {
          productId: id,
          id: { [Op.notIn]: variantIds }
        }
      });
      
      // Actualizar o crear variantes
      for (const variant of productData.variants) {
        if (variant.id) {
          await ProductVariant.update(variant, {
            where: { id: variant.id, productId: id, tenantId }
          });
        } else {
          await ProductVariant.create({
            ...variant,
            productId: id,
            tenantId
          });
        }
      }
    }
    
    // Obtener el producto actualizado con sus relaciones
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    return res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error(`Error al actualizar producto ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar producto', error });
  }
};

/**
 * Eliminar un producto
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que el producto exista y pertenezca al tenant
    const product = await Product.findOne({
      where: { id, tenantId }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Eliminar variantes asociadas
    await ProductVariant.destroy({
      where: { productId: id }
    });
    
    // Eliminar el producto
    await product.destroy();
    
    return res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    logger.error(`Error al eliminar producto ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al eliminar producto', error });
  }
};

/**
 * Buscar productos
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { tenantId } = req.user;
    
    const products = await Product.findAll({
      where: {
        tenantId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { sku: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    return res.status(200).json(products);
  } catch (error) {
    logger.error(`Error al buscar productos con query "${req.params.query}":`, error);
    return res.status(500).json({ message: 'Error al buscar productos', error });
  }
};

/**
 * Obtener productos por categoría
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que la categoría exista y pertenezca al tenant
    const category = await Category.findOne({
      where: { id: categoryId, tenantId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    const products = await Product.findAll({
      where: { categoryId, tenantId },
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' }
      ]
    });
    
    return res.status(200).json(products);
  } catch (error) {
    logger.error(`Error al obtener productos de la categoría ${req.params.categoryId}:`, error);
    return res.status(500).json({ message: 'Error al obtener productos por categoría', error });
  }
};

/**
 * Actualizar inventario de un producto
 */
export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { quantity, variantId } = req.body;
    
    if (variantId) {
      // Actualizar inventario de una variante específica
      const variant = await ProductVariant.findOne({
        where: { id: variantId, productId: id, tenantId }
      });
      
      if (!variant) {
        return res.status(404).json({ message: 'Variante no encontrada' });
      }
      
      await variant.update({ stock: quantity });
      
      return res.status(200).json({ message: 'Inventario actualizado correctamente', variant });
    } else {
      // Actualizar inventario del producto principal
      const product = await Product.findOne({
        where: { id, tenantId }
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      
      await product.update({ stock: quantity });
      
      return res.status(200).json({ message: 'Inventario actualizado correctamente', product });
    }
  } catch (error) {
    logger.error(`Error al actualizar inventario del producto ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar inventario', error });
  }
};

// Importar Op de Sequelize para operaciones avanzadas
import { Op } from 'sequelize';