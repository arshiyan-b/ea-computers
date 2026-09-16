import { List, useTable } from '@refinedev/antd';
import { Table, Typography, Grid } from 'antd';
import type { Lead } from '@/types';

const { useBreakpoint } = Grid;

export const LeadList = () => {
  const { tableProps } = useTable<Lead>({
    resource: 'leads',
    pagination: { pageSize: 20 },
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
  });
  const screens = useBreakpoint();

  return (
    <List title="Get in Touch Leads" canCreate={false}>
      <Table
        {...tableProps}
        rowKey="id"
        scroll={{ x: screens.md ? undefined : 700 }}
        expandable={{
          expandedRowRender: (record: Lead) => (
            <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {record.message}
            </Typography.Paragraph>
          ),
        }}
      >
        <Table.Column title="Name" dataIndex="name" />
        <Table.Column
          title="Email"
          dataIndex="email"
          render={(email: string) => <a href={`mailto:${email}`}>{email}</a>}
        />
        <Table.Column title="Phone" dataIndex="phone" render={(v) => v ?? '—'} />
        <Table.Column title="Company" dataIndex="company" render={(v) => v ?? '—'} />
        <Table.Column
          title="Message"
          dataIndex="message"
          ellipsis
          render={(message: string) => (
            <Typography.Text ellipsis style={{ maxWidth: 320, display: 'inline-block' }}>
              {message}
            </Typography.Text>
          )}
        />
        <Table.Column
          title="Submitted"
          dataIndex="createdAt"
          sorter
          render={(v) => new Date(v).toLocaleString()}
        />
      </Table>
    </List>
  );
};
