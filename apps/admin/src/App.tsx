import { Refine, Authenticated } from '@refinedev/core';
import {
  ThemedLayoutV2,
  ThemedSiderV2,
  ErrorComponent,
  useNotificationProvider,
  RefineThemes,
} from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router-v6';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';

import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { ProductList, ProductCreate, ProductEdit } from './pages/products';
import { CategoryList, CategoryCreate, CategoryEdit } from './pages/categories';
import { BrandList, BrandCreate, BrandEdit } from './pages/brands';
import { OrderList, OrderShow } from './pages/orders';
import { UserList } from './pages/users';
import { InventoryList } from './pages/inventory';
import { Title } from './components/Title';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider}
            authProvider={authProvider}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: 'dashboard', list: '/', meta: { label: 'Dashboard', icon: <DashboardOutlined /> } },
              {
                name: 'products',
                list: '/products',
                create: '/products/create',
                edit: '/products/edit/:id',
                meta: { label: 'Products', icon: <ShoppingOutlined /> },
              },
              {
                name: 'categories',
                list: '/categories',
                create: '/categories/create',
                edit: '/categories/edit/:id',
                meta: { label: 'Categories', icon: <AppstoreOutlined /> },
              },
              {
                name: 'brands',
                list: '/brands',
                create: '/brands/create',
                edit: '/brands/edit/:id',
                meta: { label: 'Brands', icon: <TagsOutlined /> },
              },
              {
                name: 'orders',
                list: '/orders',
                show: '/orders/show/:id',
                meta: { label: 'Orders', icon: <ShoppingCartOutlined /> },
              },
              {
                name: 'inventory',
                list: '/inventory',
                meta: { label: 'Inventory', icon: <DatabaseOutlined /> },
              },
              {
                name: 'users',
                list: '/users',
                meta: { label: 'Users', icon: <TeamOutlined /> },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              disableTelemetry: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="authenticated-layout" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2 Title={Title} Sider={() => <ThemedSiderV2 fixed Title={Title} />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />

                <Route path="/products">
                  <Route index element={<ProductList />} />
                  <Route path="create" element={<ProductCreate />} />
                  <Route path="edit/:id" element={<ProductEdit />} />
                </Route>

                <Route path="/categories">
                  <Route index element={<CategoryList />} />
                  <Route path="create" element={<CategoryCreate />} />
                  <Route path="edit/:id" element={<CategoryEdit />} />
                </Route>

                <Route path="/brands">
                  <Route index element={<BrandList />} />
                  <Route path="create" element={<BrandCreate />} />
                  <Route path="edit/:id" element={<BrandEdit />} />
                </Route>

                <Route path="/orders">
                  <Route index element={<OrderList />} />
                  <Route path="show/:id" element={<OrderShow />} />
                </Route>

                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/users" element={<UserList />} />

                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated key="authenticated-auth" fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>

            <UnsavedChangesNotifier />
            <DocumentTitleHandler
              handler={({ resource, action }) => {
                const label = resource?.meta?.label ?? resource?.name;
                const showAction = action && resource?.name !== 'dashboard';
                const actionLabel = showAction ? `${action.charAt(0).toUpperCase()}${action.slice(1)} ` : '';
                return label ? `${actionLabel}${label} | EA Computers Admin` : 'EA Computers Admin';
              }}
            />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
