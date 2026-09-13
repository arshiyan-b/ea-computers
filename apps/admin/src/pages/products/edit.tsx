import { Edit, useForm } from '@refinedev/antd';
import { Form } from 'antd';
import { ProductFormFields } from './ProductFormFields';
import { sanitizeProductPayload } from './sanitize';

export const ProductEdit = () => {
  const { formProps, saveButtonProps, onFinish } = useForm({ resource: 'products' });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values) => onFinish(sanitizeProductPayload(values))}
      >
        <ProductFormFields />
      </Form>
    </Edit>
  );
};
