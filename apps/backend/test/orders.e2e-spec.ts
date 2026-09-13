import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { bootstrapTestApp, uniqueSuffix } from './utils/bootstrap';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let prisma: PrismaClient;
  let categoryId: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    server = app.getHttpServer();
    prisma = new PrismaClient();

    const category = await prisma.category.create({
      data: { name: `Orders Test Category ${uniqueSuffix()}`, slug: `orders-test-cat-${uniqueSuffix()}` },
    });
    categoryId = category.id;

    const adminEmail = `e2e-orders-admin-${uniqueSuffix()}@example.com`;
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Orders Admin',
        passwordHash: await bcrypt.hash('AdminPass123!', 12),
        role: 'ADMIN',
      },
    });
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'AdminPass123!' });
    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function registeredCustomer() {
    const email = `e2e-orders-customer-${uniqueSuffix()}@example.com`;
    const password = 'CustomerPass123!';
    const agent = request.agent(server);
    await agent.post('/api/auth/register').send({ email, name: 'Order Customer', password });
    const login = await agent.post('/api/auth/login').send({ email, password });
    return { agent, token: login.body.accessToken as string };
  }

  async function placeOrder(agent: ReturnType<typeof request.agent>, token: string) {
    const suffix = uniqueSuffix();
    const product = await prisma.product.create({
      data: {
        name: `Order Product ${suffix}`,
        slug: `order-product-${suffix}`,
        description: 'For order e2e tests',
        price: 2000,
        stock: 10,
        sku: `ORDER-SKU-${suffix}`,
        categoryId,
      },
    });
    // Every request must carry the bearer token — the JWT is never carried in
    // a cookie here, only the guest-cart session id is.
    await agent
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 1 })
      .expect(201);
    const res = await agent
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Order Customer',
        customerEmail: 'order-customer@example.com',
        customerPhone: '+92 300 1111111',
        shippingAddress: '1 Order Street',
        city: 'Karachi',
      })
      .expect(201);
    return res.body;
  }

  it("lets a customer see their own orders and not another customer's", async () => {
    const customerA = await registeredCustomer();
    const customerB = await registeredCustomer();

    const orderA = await placeOrder(customerA.agent, customerA.token);

    const ownOrders = await request(server)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerA.token}`)
      .expect(200);
    expect(ownOrders.body.data.some((o: any) => o.id === orderA.id)).toBe(true);

    const ownOrderDetail = await request(server)
      .get(`/api/orders/${orderA.id}`)
      .set('Authorization', `Bearer ${customerA.token}`)
      .expect(200);
    expect(ownOrderDetail.body.id).toBe(orderA.id);

    // Customer B must not be able to view customer A's order.
    await request(server)
      .get(`/api/orders/${orderA.id}`)
      .set('Authorization', `Bearer ${customerB.token}`)
      .expect(403);

    // Customer B's own order list must not include A's order.
    const bList = await request(server)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerB.token}`)
      .expect(200);
    expect(bList.body.data.some((o: any) => o.id === orderA.id)).toBe(false);
  });

  it('requires authentication to view orders', async () => {
    await request(server).get('/api/orders').expect(401);
  });

  it('lets an admin view any order and update its status', async () => {
    const customer = await registeredCustomer();
    const order = await placeOrder(customer.agent, customer.token);

    const adminView = await request(server)
      .get(`/api/admin/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(adminView.body.id).toBe(order.id);

    const statusRes = await request(server)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(200);
    expect(statusRes.body.status).toBe('CONFIRMED');

    // The customer should see the updated status too.
    const customerView = await request(server)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .expect(200);
    expect(customerView.body.status).toBe('CONFIRMED');
  });

  it('rejects a non-admin updating order status', async () => {
    const customer = await registeredCustomer();
    const order = await placeOrder(customer.agent, customer.token);

    await request(server)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ status: 'SHIPPED' })
      .expect(403);
  });
});
