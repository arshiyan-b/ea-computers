import { List, useTable, EditButton, DeleteButton, CreateButton, useSelect } from '@refinedev/antd';
import { Table, Space, Tag, Typography, Image, Input, Select, Row, Col, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Product, Category, Brand } from '@/types';

export const ProductList = () => {
  const { tableProps, setFilters, filters } = useTable<Product>({
    resource: 'products',
    pagination: { pageSize: 20 },
    sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
    filters: {
      defaultBehavior: 'replace',
    },
  });

  const { selectProps: categorySelectProps } = useSelect<Category>({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'slug',
    pagination: { pageSize: 100 },
  });
  const { selectProps: brandSelectProps } = useSelect<Brand>({
    resource: 'brands',
    optionLabel: 'name',
    optionValue: 'slug',
    pagination: { pageSize: 100 },
  });

  function currentValue(field: string) {
    return (filters as any)?.find((f: any) => f.field === field)?.value;
  }

  return (
    <List headerButtons={<CreateButton />}>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Input.Search
            placeholder="Search by name, SKU or description"
            allowClear
            prefix={<SearchOutlined />}
            onSearch={(value) => setFilters([{ field: 'search', operator: 'eq', value }], 'replace')}
          />
        </Col>
        <Col xs={12} md={5}>
          <Select
            {...categorySelectProps}
            allowClear
            placeholder="Category"
            style={{ width: '100%' }}
            onChange={(value) => setFilters([{ field: 'category', operator: 'eq', value }], 'merge')}
          />
        </Col>
        <Col xs={12} md={5}>
          <Select
            {...brandSelectProps}
            allowClear
            placeholder="Brand"
            style={{ width: '100%' }}
            onChange={(value) => setFilters([{ field: 'brand', operator: 'eq', value }], 'merge')}
          />
        </Col>
        <Col xs={12} md={3}>
          <Space>
            <Switch
              checked={!!currentValue('stock')}
              onChange={(checked) =>
                setFilters([{ field: 'stock', operator: 'eq', value: checked ? true : undefined }], 'merge')
              }
            />
            <span>In stock</span>
          </Space>
        </Col>
        <Col xs={12} md={3}>
          <Space>
            <Switch
              checked={!!currentValue('featured')}
              onChange={(checked) =>
                setFilters([{ field: 'featured', operator: 'eq', value: checked ? true : undefined }], 'merge')
              }
            />
            <span>Featured</span>
          </Space>
        </Col>
      </Row>

      <Table {...tableProps} rowKey="id">
        <Table.Column
          title="Image"
          dataIndex="images"
          render={(images: Product['images']) => <Image src={images?.[0]?.url} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />}
        />
        <Table.Column
          title="Product"
          dataIndex="name"
          sorter
          render={(name, record: Product) => (
            <div>
              <div style={{ fontWeight: 500 }}>{name}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {record.sku}
              </Typography.Text>
            </div>
          )}
        />
        <Table.Column title="Category" dataIndex={['category', 'name']} />
        <Table.Column title="Brand" dataIndex={['brand', 'name']} />
        <Table.Column
          title="Price"
          dataIndex="price"
          sorter
          render={(v) => `Rs ${Number(v).toLocaleString()}`}
        />
        <Table.Column
          title="Stock"
          dataIndex="stock"
          render={(v: number) => (
            <Tag color={v === 0 ? 'red' : v <= 5 ? 'orange' : 'green'}>{v === 0 ? 'Out of stock' : v}</Tag>
          )}
        />
        <Table.Column
          title="Status"
          dataIndex="isActive"
          render={(v, record: Product) => (
            <Space direction="vertical" size={2}>
              <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>
              {record.isFeatured && <Tag color="gold">Featured</Tag>}
            </Space>
          )}
        />
        <Table.Column
          title="Actions"
          render={(_, record: Product) => (
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
