import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a "Get in Touch" lead from the storefront contact form' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }
}
