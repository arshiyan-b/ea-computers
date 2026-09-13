import { List, useTable } from '@refinedev/antd';
import { Table, Tag } from 'antd';
import type { AdminUser } from '@/types';

export const UserList = () => {
  const { tableProps } = useTable<AdminUser>({
    resource: 'users',
    pagination: { pageSize: 20 },
  });

  return (
    <List title="Customers & Admins" canCreate={false}>
      <Table {...tableProps} rowKey="id">
        <Table.Column title="Name" dataIndex="name" />
        <Table.Column title="Email" dataIndex="email" />
        <Table.Column
          title="Role"
          dataIndex="role"
          render={(role: string) => <Tag color={role === 'ADMIN' ? 'purple' : 'blue'}>{role}</Tag>}
        />
        <Table.Column title="Joined" dataIndex="createdAt" render={(v) => new Date(v).toLocaleDateString()} />
      </Table>
    </List>
  );
};
