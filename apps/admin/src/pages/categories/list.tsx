import { List, useTable, EditButton, DeleteButton, CreateButton } from '@refinedev/antd';
import { Table, Space, Tag, Typography } from 'antd';
import type { Category } from '@/types';

export const CategoryList = () => {
  const { tableProps } = useTable<Category>({
    resource: 'categories',
    pagination: { pageSize: 50 },
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
  });

  return (
    <List headerButtons={<CreateButton />}>
      <Table {...tableProps} rowKey="id">
        <Table.Column title="Name" dataIndex="name" />
        <Table.Column title="Slug" dataIndex="slug" render={(v) => <Typography.Text code>{v}</Typography.Text>} />
        <Table.Column
          title="Parent"
          dataIndex="parentId"
          render={(v) => (v ? <Tag>Sub-category</Tag> : <Tag color="blue">Top-level</Tag>)}
        />
        <Table.Column
          title="Status"
          dataIndex="isActive"
          render={(v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>}
        />
        <Table.Column
          title="Actions"
          render={(_, record: Category) => (
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
