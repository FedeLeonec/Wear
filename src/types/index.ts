export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface RootStackParamList {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ProductList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string };
  [key: string]: undefined | object;
}

export interface Color {
  name: string;
  code: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  images: string[];
  tenantId: string;
  isActive: boolean;
  sizes: string[];
  colors: Color[];
  createdAt?: string;
  updatedAt?: string;
} 