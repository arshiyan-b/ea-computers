import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Switch } from 'antd';
import type { Brand } from '@/types';

export const BrandEdit = () => {
  const { formProps, saveButtonProps } = useForm<Brand>({ resource: 'brands' });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
        <Form.Item label="Logo URL" name="logo">
          <Input />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
