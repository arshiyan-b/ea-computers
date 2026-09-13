import { BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

const checkoutDto = {
  customerName: 'Ali Raza',
  customerEmail: 'ali@example.com',
  customerPhone: '+92 300 1234567',
  shippingAddress: 'House 1, Street 2',
  city: 'Karachi',
};

function fakeProduct(overrides: Partial<any> = {}) {
  return { id: 'prod-1', name: 'RTX 5070', price: 100000, stock: 5, isActive: true, ...overrides };
}

describe('CheckoutService', () => {
  let prisma: PrismaMock;
  let service: CheckoutService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CheckoutService(prisma as any);
  });

  it('rejects checkout for an empty cart', async () => {
    prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });
    await expect(service.checkout('cart-1', 'user-1', checkoutDto as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects checkout for a missing cart', async () => {
    prisma.cart.findUnique.mockResolvedValue(null);
    await expect(service.checkout('cart-1', 'user-1', checkoutDto as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects checkout when a cart item is now inactive', async () => {
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 1, product: fakeProduct({ isActive: false }) }],
    });
    await expect(service.checkout('cart-1', 'user-1', checkoutDto as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects checkout when requested quantity exceeds stock', async () => {
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 10, product: fakeProduct({ stock: 2 }) }],
    });
    await expect(service.checkout('cart-1', 'user-1', checkoutDto as any)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('computes totals server-side from the database price, ignoring anything the client might send', async () => {
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [
        { productId: 'prod-1', quantity: 2, product: fakeProduct({ price: 1000, stock: 5 }) },
        { productId: 'prod-2', quantity: 1, product: fakeProduct({ id: 'prod-2', name: 'Mouse', price: 500, stock: 5 }) },
      ],
    });
    prisma.order.create.mockImplementation(({ data }: any) => ({ id: 'order-1', ...data }));

    const order = (await service.checkout('cart-1', 'user-1', checkoutDto as any)) as any;

    expect(order.subtotal).toBe(2500); // 2*1000 + 1*500
    expect(order.total).toBe(2500);
    expect(order.status).toBe('PENDING');
    expect(order.items.create).toEqual([
      { productId: 'prod-1', productName: 'RTX 5070', quantity: 2, price: 1000, subtotal: 2000 },
      { productId: 'prod-2', productName: 'Mouse', quantity: 1, price: 500, subtotal: 500 },
    ]);
  });

  it('decrements stock for every purchased item and clears the cart', async () => {
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-1', quantity: 2, product: fakeProduct({ price: 1000, stock: 5 }) }],
    });
    prisma.order.create.mockResolvedValue({ id: 'order-1', items: [] });

    await service.checkout('cart-1', 'user-1', checkoutDto as any);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { decrement: 2 } },
    });
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
  });
});
