import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Alert } from 'antd';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { request } from '@/providers/http';
import type { DashboardStats } from '@/types';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    request<DashboardStats>('/admin/dashboard')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Dashboard
      </Typography.Title>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}

      {!stats && !error ? (
        <Spin />
      ) : stats ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <StatCard title="Total Products" value={stats.totalProducts} icon={<ShoppingOutlined />} color="#1651e1" />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCartOutlined />} color="#0ea5e9" />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<ClockCircleOutlined />} color="#f59e0b" />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard title="Total Customers" value={stats.totalCustomers} icon={<UserOutlined />} color="#10b981" />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCard
              title="Low Stock Products"
              value={stats.lowStockProducts}
              icon={<WarningOutlined />}
              color="#ef4444"
            />
          </Col>
        </Row>
      ) : null}
    </div>
  );
};

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={<span style={{ color }}>{icon}</span>}
        valueStyle={{ fontWeight: 700 }}
      />
    </Card>
  );
}
