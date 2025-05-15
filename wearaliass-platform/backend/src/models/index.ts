import Tenant from './Tenant';
import User from './User';
import Product from './Product';
import ProductVariant from './ProductVariant';
import Category from './Category';
import Sale from './Sale';
import SaleItem from './SaleItem';
import Transaction from './Transaction';
import CashRegisterSession from './CashRegisterSession';

// Definir relaciones entre modelos
User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'users' });

Product.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(Product, { foreignKey: 'tenantId', as: 'products' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });

ProductVariant.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(ProductVariant, { foreignKey: 'tenantId', as: 'productVariants' });

Category.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(Category, { foreignKey: 'tenantId', as: 'categories' });

Sale.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(Sale, { foreignKey: 'tenantId', as: 'sales' });

Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });

Sale.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
User.hasMany(Sale, { foreignKey: 'customerId', as: 'purchases' });

SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });

SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });

SaleItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });
ProductVariant.hasMany(SaleItem, { foreignKey: 'variantId', as: 'saleItems' });

SaleItem.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(SaleItem, { foreignKey: 'tenantId', as: 'saleItems' });

Transaction.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(Transaction, { foreignKey: 'tenantId', as: 'transactions' });

Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

CashRegisterSession.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Tenant.hasMany(CashRegisterSession, { foreignKey: 'tenantId', as: 'cashRegisterSessions' });

CashRegisterSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CashRegisterSession, { foreignKey: 'userId', as: 'cashRegisterSessions' });

export {
  Tenant,
  User,
  Product,
  ProductVariant,
  Category,
  Sale,
  SaleItem,
  Transaction,
  CashRegisterSession,
};