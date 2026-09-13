import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: "List the current customer's own orders" })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryOrderDto) {
    return this.ordersService.findAllForUser(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Get one of the current customer's own orders" })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.findOneForUser(user.id, id);
  }
}
