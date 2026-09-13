import { Tag } from 'antd';
import type { OrderStatus } from '@/types';

const COLORS: Record<OrderStatus, string> = {
  PENDING: 'gold',
  CONFIRMED: 'blue',
  PROCESSING: 'geekblue',
  SHIPPED: 'cyan',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

export const OrderStatusTag = ({ status }: { status: OrderStatus }) => (
  <Tag color={COLORS[status]}>{status}</Tag>
);
