import { List, useTable, EditButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag, Typography, Avatar } from 'antd';
import type { Brand } from '@/types';

export const BrandList = () => {
  const { tableProps } = useTable<Brand>({
    resource: 'brands',
    pagination: { pageSize: 50 },
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
  });

  return (
    <List headerButtons={<CreateButton />}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Logo"
          dataIndex="logo"
          render={(v, record: Brand) => <Avatar src={v} shape="square">{record.name.charAt(0)}</Avatar>}
        />
        <Table.Column title="Name" dataIndex="name" />
        <Table.Column title="Slug" dataIndex="slug" render={(v) => <Typography.Text code>{v}</Typography.Text>} />
        <Table.Column
          title="Status"
          dataIndex="isActive"
          render={(v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>}
        />
        <Table.Column
          title="Actions"
          render={(_, record: Brand) => (
            <Space>
              <EditButton size="small" recordItemId={record.id} />
              <DeleteButton size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
