import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './types/authenticated-user.interface';
import { UsersService } from '../users/users.service';
import { CartService } from '../cart/cart.service';
import { clearGuestSessionCookie, readGuestSessionId } from '../cart/cart-cookie.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly cartCookieName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly cartService: CartService,
    config: ConfigService,
  ) {
    this.cartCookieName = config.get<string>('CART_COOKIE_NAME', 'ea_cart_sid');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a new customer account' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto);
    await this.mergeGuestCart(req, res, result.user.id);
    return result;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    await this.mergeGuestCart(req, res, result.user.id);
    return result;
  }

  private async mergeGuestCart(req: FastifyRequest, res: FastifyReply, userId: string) {
    const guestSessionId = readGuestSessionId(req, this.cartCookieName);
    if (!guestSessionId) return;
    await this.cartService.mergeGuestCartIntoUser(guestSessionId, userId);
    clearGuestSessionCookie(res, this.cartCookieName);
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    const fullUser = await this.usersService.findById(user.id);
    return this.usersService.toResponse(fullUser);
  }
}
