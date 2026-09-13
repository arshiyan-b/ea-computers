import { List, useTable, EditButton } from '@refinedev/antd';
import { Table, Tag, Typography, Alert } from 'antd';
import type { Product } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

export const InventoryList = () => {
  // Fetched from the same Products API — sorting is done client-side below
  // since "stock" isn't (deliberately) an allow-listed sort field on the
  // public/admin products endpoint.
  const { tableProps } = useTable<Product>({
    resource: 'inventory',
    pagination: { pageSize: 100 },
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
  });

  const sortedData = [...(tableProps.dataSource ?? [])].sort((a, b) => a.stock - b.stock);
  const lowStockCount = sortedData.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <List title="Inventory">
      {lowStockCount > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`${lowStockCount} product(s) are at or below ${LOW_STOCK_THRESHOLD} units in stock.`}
        />
      )}
      <Table {...tableProps} dataSource={sortedData} rowKey="id">
        <Table.Column
          title="Product"
          dataIndex="name"
          render={(name, record: Product) => (
            <div>
              <div>{name}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.sku}
              </Typography.Text>
            </div>
          )}
        />
        <Table.Column title="Category" dataIndex={['category', 'name']} />
        <Table.Column
          title="Stock"
          dataIndex="stock"
          render={(v: number) => (
            <Tag color={v === 0 ? 'red' : v <= LOW_STOCK_THRESHOLD ? 'orange' : 'green'}>{v}</Tag>
          )}
        />
        <Table.Column
          title="Status"
          dataIndex="isActive"
          render={(v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>}
        />
        <Table.Column
          title="Actions"
          render={(_, record: Product) => <EditButton size="small" resource="products" recordItemId={record.id} />}
        />
      </Table>
    </List>
  );
};
