import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [OrdersModule, UsersModule, LeadsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
