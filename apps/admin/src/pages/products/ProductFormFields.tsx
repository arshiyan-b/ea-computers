import { useSelect } from '@refinedev/antd';
import { Form, Input, InputNumber, Select, Switch, Button, Space, Card, Row, Col, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ImageUploadButton } from '@/components/ImageUploadButton';
import type { Category, Brand } from '@/types';

export const ProductFormFields = () => {
  const { selectProps: categorySelectProps } = useSelect<Category>({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 100 },
  });
  const { selectProps: brandSelectProps } = useSelect<Brand>({
    resource: 'brands',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 100 },
  });

  return (
    <>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="ASUS ROG Strix RTX 5070 Ti 16GB" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
            <Input placeholder="ASUS-RTX5070TI-16G" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Slug" name="slug" tooltip="Leave blank to auto-generate from the name">
        <Input placeholder="asus-rog-strix-rtx-5070-ti-16gb" />
      </Form.Item>

      <Form.Item label="Description" name="description" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Price (PKR)" name="price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Compare-at Price (PKR)" name="compareAtPrice" tooltip="Shown crossed-out as the old price">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Stock Quantity" name="stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
            <Select {...categorySelectProps} placeholder="Select a category" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Brand" name="brandId">
            <Select {...brandSelectProps} allowClear placeholder="Select a brand" />
          </Form.Item>
        </Col>
      </Row>

      <Space size="large">
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Featured" name="isFeatured" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>

      <Divider orientation="left">Images</Divider>
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Card key={field.key} size="small" style={{ marginBottom: 12 }}>
                <Row gutter={8} align="middle">
                  <Col flex="auto">
                    <Form.Item {...field} name={[field.name, 'url']} label="Image URL" rules={[{ required: true }]}>
                      <Input placeholder="https://... or upload below" />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item shouldUpdate noStyle>
                      {(form) => (
                        <ImageUploadButton
                          onUploaded={(url) =>
                            form.setFieldValue(['images', field.name, 'url'], url)
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button danger icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
                <Form.Item {...field} name={[field.name, 'alt']} label="Alt text">
                  <Input placeholder="Descriptive alt text for this image" />
                </Form.Item>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add({ sortOrder: fields.length })} icon={<PlusOutlined />} block>
              Add Image
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Specifications</Divider>
      <Form.List name="specifications">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row gutter={8} key={field.key} style={{ marginBottom: 8 }}>
                <Col span={5}>
                  <Form.Item {...field} name={[field.name, 'group']} noStyle>
                    <Input placeholder="Group (optional)" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item {...field} name={[field.name, 'name']} rules={[{ required: true }]} noStyle>
                    <Input placeholder="Name (e.g. VRAM)" />
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item {...field} name={[field.name, 'value']} rules={[{ required: true }]} noStyle>
                    <Input placeholder="Value (e.g. 12GB)" />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button danger icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={() => add({ sortOrder: fields.length })} icon={<PlusOutlined />} block>
              Add Specification
            </Button>
          </>
        )}
      </Form.List>
    </>
  );
};
