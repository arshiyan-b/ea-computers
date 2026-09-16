export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  parentId?: string | null;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductSpecification {
  id?: string;
  group?: string;
  name: string;
  value: string;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  sku: string;
  categoryId: string;
  brandId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  category?: Category;
  brand?: Brand | null;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  status: OrderStatus;
  subtotal: string;
  total: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  lowStockProducts: number;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];
