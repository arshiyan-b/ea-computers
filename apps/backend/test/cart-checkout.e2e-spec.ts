import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { bootstrapTestApp, uniqueSuffix } from './utils/bootstrap';

describe('Cart & Checkout (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let prisma: PrismaClient;
  let categoryId: string;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    server = app.getHttpServer();
    prisma = new PrismaClient();

    const category = await prisma.category.create({
      data: { name: `Cart Test Category ${uniqueSuffix()}`, slug: `cart-test-cat-${uniqueSuffix()}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function makeProduct(overrides: Partial<{ price: number; stock: number }> = {}) {
    const suffix = uniqueSuffix();
    return prisma.product.create({
      data: {
        name: `Cart Product ${suffix}`,
        slug: `cart-product-${suffix}`,
        description: 'For cart e2e tests',
        price: overrides.price ?? 1000,
        stock: overrides.stock ?? 5,
        sku: `CART-SKU-${suffix}`,
        categoryId,
      },
    });
  }

  it('lets a guest add an item to the cart via a session cookie', async () => {
    const product = await makeProduct({ stock: 5 });
    const agent = request.agent(server);

    const res = await agent
      .post('/api/cart/items')
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.subtotal).toBe(2000);

    const getRes = await agent.get('/api/cart').expect(200);
    expect(getRes.body.items).toHaveLength(1);
  });

  it('rejects adding more than available stock', async () => {
    const product = await makeProduct({ stock: 2 });
    const agent = request.agent(server);

    await agent
      .post('/api/cart/items')
      .send({ productId: product.id, quantity: 5 })
      .expect(400);
  });

  it('rejects a zero or negative quantity', async () => {
    const product = await makeProduct();
    const agent = request.agent(server);
    await agent.post('/api/cart/items').send({ productId: product.id, quantity: 0 }).expect(400);
    await agent.post('/api/cart/items').send({ productId: product.id, quantity: -1 }).expect(400);
  });

  it('updates and removes a cart item', async () => {
    const product = await makeProduct({ stock: 5 });
    const agent = request.agent(server);
    const addRes = await agent.post('/api/cart/items').send({ productId: product.id, quantity: 1 });
    const itemId = addRes.body.items[0].id;

    const updateRes = await agent
      .patch(`/api/cart/items/${itemId}`)
      .send({ quantity: 3 })
      .expect(200);
    expect(updateRes.body.items[0].quantity).toBe(3);

    const removeRes = await agent.delete(`/api/cart/items/${itemId}`).expect(200);
    expect(removeRes.body.items).toHaveLength(0);
  });

  it('merges a guest cart into the user cart on login', async () => {
    const product = await makeProduct({ stock: 10 });
    const agent = request.agent(server);
    await agent.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

    const email = `e2e-merge-${uniqueSuffix()}@example.com`;
    const registerRes = await agent
      .post('/api/auth/register')
      .send({ email, name: 'Merge Test', password: 'MergeTest123!' });
    const token = registerRes.body.accessToken;

    // The merge itself is cookie-driven (same agent/session), but reading the
    // cart back as this now-authenticated user requires the bearer token —
    // the JWT is never carried in a cookie in this API.
    const cartRes = await agent.get('/api/cart').set('Authorization', `Bearer ${token}`).expect(200);
    expect(cartRes.body.items.some((i: any) => i.productId === product.id)).toBe(true);
  });

  describe('checkout', () => {
    const checkoutPayload = {
      customerName: 'Checkout Tester',
      customerEmail: 'checkout-tester@example.com',
      customerPhone: '+92 300 0000000',
      shippingAddress: '1 Test Street',
      city: 'Islamabad',
    };

    it('rejects checkout with an empty cart', async () => {
      const agent = request.agent(server);
      await agent.post('/api/checkout').send(checkoutPayload).expect(400);
    });

    it('computes totals server-side and creates an order, decrementing stock and clearing the cart', async () => {
      const product = await makeProduct({ price: 5000, stock: 10 });
      const agent = request.agent(server);

      await agent.post('/api/cart/items').send({ productId: product.id, quantity: 3 }).expect(201);

      const orderRes = await agent.post('/api/checkout').send(checkoutPayload).expect(201);
      expect(orderRes.body.subtotal).toBe('15000');
      expect(orderRes.body.total).toBe('15000');
      expect(orderRes.body.status).toBe('PENDING');
      expect(orderRes.body.items[0].productName).toBe(product.name);
      expect(orderRes.body.items[0].price).toBe('5000');

      const updated = await prisma.product.findUnique({ where: { id: product.id } });
      expect(updated?.stock).toBe(7);

      const cartRes = await agent.get('/api/cart').expect(200);
      expect(cartRes.body.items).toHaveLength(0);
    });

    it('rejects checkout when the cart quantity exceeds current stock', async () => {
      const product = await makeProduct({ stock: 2 });
      const agent = request.agent(server);
      await agent.post('/api/cart/items').send({ productId: product.id, quantity: 2 }).expect(201);

      // Stock drops below what's in the cart before checkout is attempted.
      await prisma.product.update({ where: { id: product.id }, data: { stock: 1 } });

      await agent.post('/api/checkout').send(checkoutPayload).expect(400);

      // Nothing should have been decremented/cleared on the failed attempt.
      const stillInCart = await agent.get('/api/cart').expect(200);
      expect(stillInCart.body.items).toHaveLength(1);
    });

    it('rejects checkout with an invalid payload (missing shipping fields)', async () => {
      const product = await makeProduct();
      const agent = request.agent(server);
      await agent.post('/api/cart/items').send({ productId: product.id, quantity: 1 });
      await agent.post('/api/checkout').send({ customerName: 'Only Name' }).expect(400);
    });
  });
});
