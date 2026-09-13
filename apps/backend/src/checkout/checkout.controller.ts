import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { resolveGuestSessionId } from '../cart/cart-cookie.util';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  private readonly cookieName: string;

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly cartService: CartService,
    config: ConfigService,
  ) {
    this.cookieName = config.get<string>('CART_COOKIE_NAME', 'ea_cart_sid');
  }

  @OptionalAuth()
  @Post()
  @ApiOperation({
    summary: 'Place an order from the current cart (Cash on Delivery — no online payment yet)',
  })
  async checkout(
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const sessionId = resolveGuestSessionId(req, res, this.cookieName, !!user);
    const cart = await this.cartService.getOrCreateCart(user?.id, sessionId);
    return this.checkoutService.checkout(cart.id, user?.id, dto);
  }
}
