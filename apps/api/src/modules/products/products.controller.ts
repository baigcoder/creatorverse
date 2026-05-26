import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('creatorId') creatorId?: string) {
    return this.productsService.findAll({ page: Number(page), limit: Number(limit), creatorId });
  }

  @Get('my-downloads')
  @UseGuards(JwtAuthGuard)
  myDownloads(@CurrentUser() user: { id: string }) {
    return this.productsService.myDownloads(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get(':id')
  @Public()
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, user.id, user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('CREATOR', 'ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.productsService.remove(id, user.id, user.role);
  }
}
