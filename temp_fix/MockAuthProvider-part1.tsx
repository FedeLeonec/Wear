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
];