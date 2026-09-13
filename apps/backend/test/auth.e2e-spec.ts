import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { bootstrapTestApp, uniqueSuffix } from './utils/bootstrap';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let prisma: PrismaClient;
  let adminEmail: string;
  const adminPassword = 'AdminE2E123!';

  beforeAll(async () => {
    app = await bootstrapTestApp();
    server = app.getHttpServer();

    // Create a dedicated ADMIN user directly via Prisma — the public register
    // endpoint can only ever create CUSTOMER accounts (by design), so admin
    // accounts for this test are seeded independently of it.
    prisma = new PrismaClient();
    adminEmail = `e2e-admin-${uniqueSuffix()}@example.com`;
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'E2E Admin',
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const email = `e2e-auth-${uniqueSuffix()}@example.com`;
  const password = 'StrongPassw0rd!';

  it('registers a new customer', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ email, name: 'E2E Tester', password })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects registering the same email twice', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ email, name: 'Duplicate', password })
      .expect(409);
  });

  it('rejects a weak password on registration', async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ email: `weak-${uniqueSuffix()}@example.com`, name: 'Weak', password: '123' })
      .expect(400);
  });

  it('logs in with valid credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword!' })
      .expect(401);
  });

  it('rejects an unknown email on login', async () => {
    await request(server)
      .post('/api/auth/login')
      .send({ email: 'nobody-at-all@example.com', password: 'whatever123' })
      .expect(401);
  });

  it('rejects /auth/me without a token', async () => {
    await request(server).get('/api/auth/me').expect(401);
  });

  it('returns the current user for a valid token', async () => {
    const login = await request(server).post('/api/auth/login').send({ email, password });
    const token = login.body.accessToken;

    const res = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(email);
  });

  it('rejects an admin-only route for a regular customer', async () => {
    const login = await request(server).post('/api/auth/login').send({ email, password });
    const token = login.body.accessToken;

    await request(server)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('allows an admin user to reach admin-only routes', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    expect(login.status).toBe(200);
    const token = login.body.accessToken;

    const res = await request(server)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('totalProducts');
  });
});
