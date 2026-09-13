import { List, useTable, ShowButton } from '@refinedev/antd';
import { Table, Tag, Select, Space } from 'antd';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUSES } from '@/types';
import { OrderStatusTag } from './OrderStatusTag';

export const OrderList = () => {
  const { tableProps, setFilters, filters } = useTable<Order>({
    resource: 'orders',
    pagination: { pageSize: 20 },
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
  });

  const currentStatus = (filters as any)?.find((f: any) => f.field === 'status')?.value;

  return (
    <List>
      <Space style={{ marginBottom: 16 }}>
        <span>Filter by status:</span>
        <Select
          allowClear
          style={{ width: 180 }}
          placeholder="All statuses"
          value={currentStatus}
          options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))}
          onChange={(value) => setFilters([{ field: 'status', operator: 'eq', value }], 'replace')}
        />
      </Space>

      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Order ID"
          dataIndex="id"
          render={(id: string) => <code>{id.slice(0, 10)}…</code>}
        />
        <Table.Column title="Customer" dataIndex="customerName" />
        <Table.Column
          title="Date"
          dataIndex="createdAt"
          sorter
          render={(v) => new Date(v).toLocaleString()}
        />
        <Table.Column
          title="Total"
          dataIndex="total"
          sorter
          render={(v) => `Rs ${Number(v).toLocaleString()}`}
        />
        <Table.Column
          title="Status"
          dataIndex="status"
          render={(status: OrderStatus) => <OrderStatusTag status={status} />}
        />
        <Table.Column
          title="Actions"
          render={(_, record: Order) => <ShowButton size="small" recordItemId={record.id} />}
        />
      </Table>
    </List>
  );
};
