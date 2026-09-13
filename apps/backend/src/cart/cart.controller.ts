import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { resolveGuestSessionId } from './cart-cookie.util';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  private readonly cookieName: string;

  constructor(
    private readonly cartService: CartService,
    config: ConfigService,
  ) {
    this.cookieName = config.get<string>('CART_COOKIE_NAME', 'ea_cart_sid');
  }

  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'Get the current guest or authenticated cart' })
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const sessionId = resolveGuestSessionId(req, res, this.cookieName, !!user);
    const cart = await this.cartService.getOrCreateCart(user?.id, sessionId);
    return this.cartService.getCartView(cart.id);
  }

  @OptionalAuth()
  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart (or increase its quantity)' })
  async addItem(
    @Body() dto: AddCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const sessionId = resolveGuestSessionId(req, res, this.cookieName, !!user);
    const cart = await this.cartService.getOrCreateCart(user?.id, sessionId);
    return this.cartService.addItem(cart.id, dto.productId, dto.quantity);
  }

  @OptionalAuth()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Set the quantity of a cart item' })
  async updateItem(
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const sessionId = resolveGuestSessionId(req, res, this.cookieName, !!user);
    const cart = await this.cartService.getOrCreateCart(user?.id, sessionId);
    return this.cartService.updateItem(cart.id, itemId, dto.quantity);
  }

  @OptionalAuth()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  async removeItem(
    @Param('id') itemId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const sessionId = resolveGuestSessionId(req, res, this.cookieName, !!user);
    const cart = await this.cartService.getOrCreateCart(user?.id, sessionId);
    return this.cartService.removeItem(cart.id, itemId);
  }
}
