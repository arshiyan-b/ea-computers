import { BadRequestException, Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const ORDER_INCLUDE = { items: true };

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Turns a cart into an order. Everything the frontend cannot be trusted to
   * supply — product existence, active status, stock, price, name, and the
   * computed totals — is re-derived from the database inside one transaction,
   * so checkout can never partially succeed nor be manipulated by the client.
   */
  async checkout(cartId: string, userId: string | undefined, dto: CreateOrderDto): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      let subtotal = 0;
      const orderItemsData: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        subtotal: number;
      }[] = [];

      for (const item of cart.items) {
        const product = item.product;
        if (!product || !product.isActive) {
          throw new BadRequestException(`"${product?.name ?? 'A product'}" is no longer available`);
        }
        if (item.quantity > product.stock) {
          throw new BadRequestException(
            `Only ${product.stock} unit(s) of "${product.name}" are in stock (you have ${item.quantity} in your cart)`,
          );
        }

        const price = Number(product.price);
        const lineSubtotal = Math.round(price * item.quantity * 100) / 100;
        subtotal = Math.round((subtotal + lineSubtotal) * 100) / 100;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price,
          subtotal: lineSubtotal,
        });
      }

      // No shipping fee or tax logic yet — total mirrors subtotal, structured
      // so a ShippingModule/tax rule can extend this later without touching
      // the transaction shape.
      const total = subtotal;

      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          total,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress: dto.shippingAddress,
          city: dto.city,
          notes: dto.notes,
          items: { create: orderItemsData },
        },
        include: ORDER_INCLUDE,
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }
}
