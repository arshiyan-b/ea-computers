import { Create, useForm } from '@refinedev/antd';
import { Form } from 'antd';
import { ProductFormFields } from './ProductFormFields';
import { sanitizeProductPayload } from './sanitize';

export const ProductCreate = () => {
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'products' });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{ isActive: true, isFeatured: false, images: [], specifications: [] }}
        onFinish={(values) => onFinish(sanitizeProductPayload(values))}
      >
        <ProductFormFields />
      </Form>
    </Create>
  );
};
