import { Show } from '@refinedev/antd';
import { useShow, useUpdate } from '@refinedev/core';
import { Descriptions, Table, Typography, Select, Space, message } from 'antd';
import type { Order } from '@/types';
import { ORDER_STATUSES } from '@/types';
import { OrderStatusTag } from './OrderStatusTag';

export const OrderShow = () => {
  const { query } = useShow<Order>({ resource: 'orders' });
  const order = query.data?.data;
  const { mutate: updateStatus, isLoading: updating } = useUpdate();

  if (!order) return null;

  return (
    <Show isLoading={query.isLoading} title={`Order ${order.id.slice(0, 10)}…`}>
      <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Customer">{order.customerName}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.customerEmail}</Descriptions.Item>
        <Descriptions.Item label="Phone">{order.customerPhone}</Descriptions.Item>
        <Descriptions.Item label="City">{order.city}</Descriptions.Item>
        <Descriptions.Item label="Shipping Address" span={2}>
          {order.shippingAddress}
        </Descriptions.Item>
        {order.notes && (
          <Descriptions.Item label="Notes" span={2}>
            {order.notes}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Order Date">{new Date(order.createdAt).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Payment Method">Cash on Delivery</Descriptions.Item>
      </Descriptions>

      <Space align="center" style={{ marginBottom: 24 }}>
        <Typography.Text strong>Status:</Typography.Text>
        <OrderStatusTag status={order.status} />
        <Select
          style={{ width: 200 }}
          value={order.status}
          loading={updating}
          options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))}
          onChange={(status) =>
            updateStatus(
              { resource: 'orders', id: order.id, values: { status } },
              { onSuccess: () => message.success('Order status updated'), onError: () => message.error('Failed to update status') },
            )
          }
        />
      </Space>

      <Typography.Title level={5}>Items</Typography.Title>
      <Table dataSource={order.items} rowKey="id" pagination={false}>
        <Table.Column title="Product" dataIndex="productName" />
        <Table.Column title="Price" dataIndex="price" render={(v) => `Rs ${Number(v).toLocaleString()}`} />
        <Table.Column title="Quantity" dataIndex="quantity" />
        <Table.Column title="Subtotal" dataIndex="subtotal" render={(v) => `Rs ${Number(v).toLocaleString()}`} />
      </Table>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Typography.Text>Subtotal: Rs {Number(order.subtotal).toLocaleString()}</Typography.Text>
        <br />
        <Typography.Title level={4}>Total: Rs {Number(order.total).toLocaleString()}</Typography.Title>
      </div>
    </Show>
  );
};
