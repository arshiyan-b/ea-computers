import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { bootstrapTestApp, uniqueSuffix } from './utils/bootstrap';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let prisma: PrismaClient;
  let adminToken: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    server = app.getHttpServer();
    prisma = new PrismaClient();

    const suffix = uniqueSuffix();
    const adminEmail = `e2e-products-admin-${suffix}@example.com`;
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Products Admin',
        passwordHash: await bcrypt.hash('AdminPass123!', 12),
        role: 'ADMIN',
      },
    });
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'AdminPass123!' });
    adminToken = login.body.accessToken;

    const category = await prisma.category.create({
      data: { name: `E2E Category ${suffix}`, slug: `e2e-category-${suffix}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const suffix = uniqueSuffix();
  const productDto = {
    name: `E2E Test Product ${suffix}`,
    description: 'A product created by the e2e suite.',
    price: 12345,
    stock: 10,
    sku: `E2E-SKU-${suffix}`,
  };
  let productId: string;
  let productSlug: string;

  it('lists products publicly, without authentication', async () => {
    const res = await request(server).get('/api/products?limit=5').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('rejects product creation without authentication', async () => {
    await request(server)
      .post('/api/products')
      .send({ ...productDto, categoryId })
      .expect(401);
  });

  it('rejects product creation with an invalid payload (validation)', async () => {
    await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Missing required fields' })
      .expect(400);
  });

  it('lets an admin create a product', async () => {
    const res = await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...productDto, categoryId })
      .expect(201);

    expect(res.body.sku).toBe(productDto.sku);
    productId = res.body.id;
    productSlug = res.body.slug;
  });

  it('rejects a duplicate SKU', async () => {
    await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...productDto, name: 'Different name', categoryId })
      .expect(409);
  });

  it('fetches the product by slug', async () => {
    const res = await request(server).get(`/api/products/${productSlug}`).expect(200);
    expect(res.body.id).toBe(productId);
  });

  it("rejects a non-admin's attempt to update a product", async () => {
    const customerEmail = `e2e-products-customer-${uniqueSuffix()}@example.com`;
    await request(server)
      .post('/api/auth/register')
      .send({ email: customerEmail, name: 'Customer', password: 'CustPass123!' });
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: customerEmail, password: 'CustPass123!' });

    await request(server)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ price: 999 })
      .expect(403);
  });

  it('lets an admin update the product', async () => {
    const res = await request(server)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 54321, stock: 3 })
      .expect(200);

    expect(Number(res.body.price)).toBe(54321);
    expect(res.body.stock).toBe(3);
  });

  it('supports price-range filtering', async () => {
    const res = await request(server)
      .get('/api/products?minPrice=54000&maxPrice=55000')
      .expect(200);
    expect(res.body.data.some((p: any) => p.id === productId)).toBe(true);
  });

  it('lets an admin deactivate (soft-delete) or hard-delete the product', async () => {
    await request(server)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(server).get(`/api/products/${productSlug}`).expect(404);
  });
});
