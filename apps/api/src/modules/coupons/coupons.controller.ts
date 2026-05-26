import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './coupons.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  findAll(@CurrentUser() user: { id: string }) {
    return this.couponsService.findAll(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateCouponDto) {
    return this.couponsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.couponsService.remove(id, user.id);
  }

  @Post('validate')
  @Public()
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, { type: dto.applicableType, id: dto.applicableId });
  }
}
