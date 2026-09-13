import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

function fakeProduct(overrides: Partial<any> = {}) {
  return {
    id: 'prod-1',
    name: 'RTX 5070',
    slug: 'rtx-5070',
    price: 100000,
    stock: 3,
    isActive: true,
    images: [{ url: 'https://img/1.jpg' }],
    ...overrides,
  };
}

function fakeCart(items: any[] = []) {
  return { id: 'cart-1', userId: null, sessionId: 'sess-1', items };
}

describe('CartService', () => {
  let prisma: PrismaMock;
  let service: CartService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CartService(prisma as any);
  });

  describe('getOrCreateCart', () => {
    it('reuses an existing user cart', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'u1' });
      const cart = await service.getOrCreateCart('u1', undefined);
      expect(cart.id).toBe('cart-1');
      expect(prisma.cart.create).not.toHaveBeenCalled();
    });

    it('creates a guest cart by session id when none exists', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({ id: 'cart-2', sessionId: 'sess-1' });
      const cart = await service.getOrCreateCart(undefined, 'sess-1');
      expect(cart.id).toBe('cart-2');
      expect(prisma.cart.create).toHaveBeenCalledWith({ data: { sessionId: 'sess-1' } });
    });

    it('throws when neither a user nor a session is available', async () => {
      await expect(service.getOrCreateCart(undefined, undefined)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addItem', () => {
    it('rejects adding a product that no longer exists', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.addItem('cart-1', 'missing', 1)).rejects.toThrow(NotFoundException);
    });

    it('rejects a quantity beyond available stock', async () => {
      prisma.product.findUnique.mockResolvedValue(fakeProduct({ stock: 2 }));
      prisma.cartItem.findUnique.mockResolvedValue(null);
      await expect(service.addItem('cart-1', 'prod-1', 5)).rejects.toThrow(BadRequestException);
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('sums quantity with an existing line and caps at stock', async () => {
      prisma.product.findUnique.mockResolvedValue(fakeProduct({ stock: 3 }));
      prisma.cartItem.findUnique.mockResolvedValue({ id: 'item-1', quantity: 2 });
      // desiredQuantity = 2 + 2 = 4 > stock(3) -> should reject
      await expect(service.addItem('cart-1', 'prod-1', 2)).rejects.toThrow(BadRequestException);
    });

    it('adds a new line item within stock', async () => {
      prisma.product.findUnique.mockResolvedValue(fakeProduct({ stock: 3 }));
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.upsert.mockResolvedValue({});
      prisma.cart.findUnique.mockResolvedValue(
        fakeCart([{ id: 'item-1', productId: 'prod-1', quantity: 2, product: fakeProduct() }]),
      );

      const view = await service.addItem('cart-1', 'prod-1', 2);

      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: { cartId: 'cart-1', productId: 'prod-1', quantity: 2 } }),
      );
      expect(view.items).toHaveLength(1);
      expect(view.subtotal).toBe(200000);
    });
  });

  describe('updateItem', () => {
    it('rejects updating an item that belongs to a different cart', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        cartId: 'other-cart',
        product: fakeProduct(),
      });
      await expect(service.updateItem('cart-1', 'item-1', 1)).rejects.toThrow(NotFoundException);
    });

    it('rejects a quantity beyond stock', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        product: fakeProduct({ stock: 1 }),
      });
      await expect(service.updateItem('cart-1', 'item-1', 5)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItem', () => {
    it('rejects removing an item that does not belong to this cart', async () => {
      prisma.cartItem.findUnique.mockResolvedValue({ id: 'item-1', cartId: 'other-cart' });
      await expect(service.removeItem('cart-1', 'item-1')).rejects.toThrow(NotFoundException);
      expect(prisma.cartItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('mergeGuestCartIntoUser', () => {
    it('does nothing when there is no guest session', async () => {
      await service.mergeGuestCartIntoUser(undefined, 'user-1');
      expect(prisma.cart.findUnique).not.toHaveBeenCalled();
    });

    it('merges guest items into the user cart and deletes the guest cart', async () => {
      const guestCart = {
        id: 'guest-cart',
        userId: null,
        items: [{ productId: 'prod-1', quantity: 2 }],
      };
      prisma.cart.findUnique.mockImplementation(({ where }: any) => {
        if (where.sessionId) return guestCart;
        if (where.userId) return null; // no existing user cart yet
        return null;
      });
      prisma.cart.create.mockResolvedValue({ id: 'user-cart', userId: 'user-1' });
      prisma.product.findUnique.mockResolvedValue(fakeProduct({ stock: 5 }));
      prisma.cartItem.findUnique.mockResolvedValue(null);

      await service.mergeGuestCartIntoUser('sess-1', 'user-1');

      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: { cartId: 'user-cart', productId: 'prod-1', quantity: 2 },
        }),
      );
      expect(prisma.cart.delete).toHaveBeenCalledWith({ where: { id: 'guest-cart' } });
    });
  });
});
