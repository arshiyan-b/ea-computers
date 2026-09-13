import { Create, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Switch } from 'antd';
import type { Category } from '@/types';

export const CategoryCreate = () => {
  const { formProps, saveButtonProps } = useForm<Category>({ resource: 'categories' });
  const { selectProps: parentSelectProps } = useSelect<Category>({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'id',
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={{ isActive: true }}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Graphics Cards" />
        </Form.Item>
        <Form.Item label="Slug" name="slug" tooltip="Leave blank to auto-generate from the name">
          <Input placeholder="graphics-cards" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Image URL" name="image">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item label="Parent Category" name="parentId" tooltip="Leave blank for a top-level category">
          <Select {...parentSelectProps} allowClear placeholder="None (top-level)" />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
