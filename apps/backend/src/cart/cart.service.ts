import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const CART_ITEM_INCLUDE = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: 'asc' as const }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

export interface CartView {
  id: string;
  items: {
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: string | null;
    price: number;
    quantity: number;
    stock: number;
    subtotal: number;
  }[];
  subtotal: number;
  total: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds (or lazily creates) the cart for an authenticated user or a guest
   * session. Uses `upsert` rather than a separate find-then-create so two
   * concurrent requests for a brand-new cart (e.g. the header and the page
   * both loading at once) can never race each other into a unique-constraint
   * violation on userId/sessionId.
   */
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (userId) {
      return this.prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    }
    if (sessionId) {
      return this.prisma.cart.upsert({
        where: { sessionId },
        update: {},
        create: { sessionId },
      });
    }
    throw new BadRequestException('Unable to resolve a cart without a user or session');
  }

  async getCartView(cartId: string): Promise<CartView> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: CART_ITEM_INCLUDE,
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return this.toView(cart);
  }

  async addItem(cartId: string, productId: string, quantity: number): Promise<CartView> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found or unavailable');
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
    const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (desiredQuantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      );
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity: desiredQuantity },
      update: { quantity: desiredQuantity },
    });

    return this.getCartView(cartId);
  }

  async updateItem(cartId: string, itemId: string, quantity: number): Promise<CartView> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException('Cart item not found');
    }
    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Only ${item.product.stock} unit(s) of "${item.product.name}" available in stock`,
      );
    }
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getCartView(cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<CartView> {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCartView(cartId);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  /**
   * Called right after a successful login/registration: folds a guest cart's
   * items into the user's cart (summing quantities, capped at stock) and
   * discards the guest cart.
   */
  async mergeGuestCartIntoUser(sessionId: string | undefined, userId: string): Promise<void> {
    if (!sessionId) return;
    const guestCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) await this.prisma.cart.delete({ where: { id: guestCart.id } });
      return;
    }

    const userCart = await this.getOrCreateCart(userId);
    if (userCart.id === guestCart.id) return; // already the same cart (shouldn't happen)

    if (userCart.userId && guestCart.userId && guestCart.userId !== userCart.userId) {
      throw new ForbiddenException('Cannot merge a cart belonging to another user');
    }

    for (const guestItem of guestCart.items) {
      const product = await this.prisma.product.findUnique({ where: { id: guestItem.productId } });
      if (!product || !product.isActive) continue;

      const existing = await this.prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
      });
      const merged = Math.min(
        (existing?.quantity ?? 0) + guestItem.quantity,
        product.stock,
      );
      if (merged <= 0) continue;

      await this.prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
        create: { cartId: userCart.id, productId: guestItem.productId, quantity: merged },
        update: { quantity: merged },
      });
    }

    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }

  private toView(cart: Cart & { items: any[] }): CartView {
    const items = cart.items.map((item) => {
      const price = Number(item.product.price);
      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name as string,
        slug: item.product.slug as string,
        image: (item.product.images[0]?.url as string) ?? null,
        price,
        quantity: item.quantity as number,
        stock: item.product.stock as number,
        subtotal: Math.round(price * item.quantity * 100) / 100,
      };
    });
    const subtotal = Math.round(items.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;
    return { id: cart.id, items, subtotal, total: subtotal };
  }
}
