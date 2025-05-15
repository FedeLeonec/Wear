import { Request, Response } from 'express';
import { Category, Product } from '../models';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Obtener todas las categorías
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    
    const categories = await Category.findAll({
      where: { tenantId },
      include: [
        {
          model: Category,
          as: 'subcategories',
          required: false
        }
      ]
    });
    
    return res.status(200).json(categories);
  } catch (error) {
    logger.error('Error al obtener categorías:', error);
    return res.status(500).json({ message: 'Error al obtener categorías', error });
  }
};

/**
 * Obtener una categoría por ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const category = await Category.findOne({
      where: { id, tenantId },
      include: [
        {
          model: Category,
          as: 'subcategories',
          required: false
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    logger.error(`Error al obtener categoría ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener categoría', error });
  }
};

/**
 * Crear una nueva categoría
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    const categoryData = { ...req.body, tenantId };
    
    // Si se especifica una categoría padre, verificar que exista
    if (categoryData.parentId) {
      const parentCategory = await Category.findOne({
        where: { id: categoryData.parentId, tenantId }
      });
      
      if (!parentCategory) {
        return res.status(400).json({ message: 'La categoría padre no existe o no pertenece a este tenant' });
      }
    }
    
    const category = await Category.create(categoryData);
    
    return res.status(201).json(category);
  } catch (error) {
    logger.error('Error al crear categoría:', error);
    return res.status(500).json({ message: 'Error al crear categoría', error });
  }
};

/**
 * Actualizar una categoría existente
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const categoryData = req.body;
    
    // Verificar que la categoría exista y pertenezca al tenant
    const category = await Category.findOne({
      where: { id, tenantId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Si se está actualizando la categoría padre, verificar que exista
    if (categoryData.parentId) {
      // Evitar ciclos: una categoría no puede ser su propia subcategoría
      if (categoryData.parentId === id) {
        return res.status(400).json({ message: 'Una categoría no puede ser su propia subcategoría' });
      }
      
      const parentCategory = await Category.findOne({
        where: { id: categoryData.parentId, tenantId }
      });
      
      if (!parentCategory) {
        return res.status(400).json({ message: 'La categoría padre no existe o no pertenece a este tenant' });
      }
    }
    
    await category.update(categoryData);
    
    // Obtener la categoría actualizada con sus relaciones
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          required: false
        }
      ]
    });
    
    return res.status(200).json(updatedCategory);
  } catch (error) {
    logger.error(`Error al actualizar categoría ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar categoría', error });
  }
};

/**
 * Eliminar una categoría
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que la categoría exista y pertenezca al tenant
    const category = await Category.findOne({
      where: { id, tenantId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Verificar si hay productos asociados a esta categoría
    const productsCount = await Product.count({
      where: { categoryId: id }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque tiene productos asociados',
        productsCount
      });
    }
    
    // Verificar si hay subcategorías
    const subcategoriesCount = await Category.count({
      where: { parentId: id }
    });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque tiene subcategorías',
        subcategoriesCount
      });
    }
    
    // Eliminar la categoría
    await category.destroy();
    
    return res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    logger.error(`Error al eliminar categoría ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al eliminar categoría', error });
  }
};

/**
 * Obtener productos de una categoría
 */
export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que la categoría exista y pertenezca al tenant
    const category = await Category.findOne({
      where: { id, tenantId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Obtener productos de la categoría
    const products = await Product.findAll({
      where: { categoryId: id, tenantId }
    });
    
    return res.status(200).json(products);
  } catch (error) {
    logger.error(`Error al obtener productos de la categoría ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener productos de la categoría', error });
  }
};

/**
 * Obtener subcategorías de una categoría
 */
export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verificar que la categoría exista y pertenezca al tenant
    const category = await Category.findOne({
      where: { id, tenantId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Obtener subcategorías
    const subcategories = await Category.findAll({
      where: { parentId: id, tenantId }
    });
    
    return res.status(200).json(subcategories);
  } catch (error) {
    logger.error(`Error al obtener subcategorías de la categoría ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener subcategorías', error });
  }
};