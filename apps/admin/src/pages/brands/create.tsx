import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Switch } from 'antd';
import type { Brand } from '@/types';

export const BrandCreate = () => {
  const { formProps, saveButtonProps } = useForm<Brand>({ resource: 'brands' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={{ isActive: true }}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="ASUS" />
        </Form.Item>
        <Form.Item label="Slug" name="slug" tooltip="Leave blank to auto-generate from the name">
          <Input placeholder="asus" />
        </Form.Item>
        <Form.Item label="Logo URL" name="logo">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
