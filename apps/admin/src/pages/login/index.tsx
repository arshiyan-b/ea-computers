import { useLogin } from '@refinedev/core';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { useState } from 'react';

export const LoginPage = () => {
  const { mutate: login, isLoading } = useLogin();
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f7fb',
      }}
    >
      <Card style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#1651e1',
              color: '#fff',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            EA
          </div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            EA Computers Admin
          </Typography.Title>
          <Typography.Text type="secondary">Sign in to manage the store</Typography.Text>
        </div>

        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

        <Form
          layout="vertical"
          onFinish={(values) => {
            setError(null);
            login(values, {
              onError: (err: any) => setError(err?.message ?? 'Login failed'),
            });
          }}
        >
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="admin@eacomputers.com" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
};
