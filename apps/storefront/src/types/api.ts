export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductSpecification {
  id: string;
  group: string | null;
  name: string;
  value: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  sku: string;
  categoryId: string;
  brandId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  category: Category;
  brand: Brand | null;
}

export interface CartItemView {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface CartView {
  id: string;
  items: CartItemView[];
  subtotal: number;
  total: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  subtotal: string;
  total: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
