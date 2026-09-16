import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { LeadsService } from '../leads/leads.service';
import { QueryOrderDto } from '../orders/dto/query-order.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { QueryLeadDto } from '../leads/dto/query-lead.dto';
import { Roles } from '../auth/decorators/roles.decorator';

class PaginationOnlyDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly leadsService: LeadsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: '[Admin] Dashboard summary statistics' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('orders')
  @ApiOperation({ summary: '[Admin] List all orders' })
  findAllOrders(@Query() query: QueryOrderDto) {
    return this.ordersService.findAllForAdmin(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: '[Admin] Get any order by id' })
  findOneOrder(@Param('id') id: string) {
    return this.ordersService.findOneForAdmin(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: '[Admin] Update an order status' })
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Get('users')
  @ApiOperation({ summary: '[Admin] List customers & admins' })
  findAllUsers(@Query() query: PaginationOnlyDto) {
    return this.usersService.findAllPaginated(query.page ?? 1, query.limit ?? 20);
  }

  @Get('leads')
  @ApiOperation({ summary: '[Admin] List "Get in Touch" leads submitted from the storefront' })
  findAllLeads(@Query() query: QueryLeadDto) {
    return this.leadsService.findAllForAdmin(query);
  }
}
