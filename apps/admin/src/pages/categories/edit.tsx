import { Edit, useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Switch } from 'antd';
import type { Category } from '@/types';

export const CategoryEdit = () => {
  const { formProps, saveButtonProps } = useForm<Category>({ resource: 'categories' });
  // Note: the backend itself rejects a category being set as its own parent,
  // so we don't need to filter the option list here.
  const { selectProps: parentSelectProps } = useSelect<Category>({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'id',
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Image URL" name="image">
          <Input />
        </Form.Item>
        <Form.Item label="Parent Category" name="parentId">
          <Select {...parentSelectProps} allowClear placeholder="None (top-level)" />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
