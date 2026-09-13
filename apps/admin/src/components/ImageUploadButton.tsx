import { Upload, Button, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { API_URL, getToken } from '@/providers/http';

/**
 * Uploads a single image file to the backend's uploads endpoint and reports
 * the resulting public URL back via onUploaded. Used inline next to a plain
 * URL text field so admins can either paste a URL or upload a file.
 */
export const ImageUploadButton = ({ onUploaded }: { onUploaded: (url: string) => void }) => {
  const customRequest: NonNullable<UploadProps['customRequest']> = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const formData = new FormData();
      formData.append('file', file as Blob);

      const token = getToken();
      const res = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        throw new Error(body?.message ?? 'Upload failed');
      }
      const data = await res.json();
      onUploaded(data.url);
      onSuccess?.(data);
      message.success('Image uploaded');
    } catch (err) {
      onError?.(err as Error);
      message.error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <Upload customRequest={customRequest} showUploadList={false} accept="image/*">
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};
