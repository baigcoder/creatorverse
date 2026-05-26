import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(params: { page: number; limit: number; creatorId?: string }) {
    const skip = (params.page - 1) * params.limit;
    return this.prisma.product.findMany({
      where: { creatorId: params.creatorId, status: 'PUBLISHED' },
      skip,
      take: params.limit,
      include: { creator: { select: { id: true, brandName: true, slug: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { creator: { select: { id: true, brandName: true, slug: true, logoUrl: true } } },
    });
    if (!product || product.status !== 'PUBLISHED') throw new NotFoundException('Product not found');
    const { fileUrl, ...publicProduct } = product;
    return publicProduct;
  }

  async myDownloads(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        orderType: 'PRODUCT',
        status: { in: ['PENDING', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productIds = [...new Set(orders.map((order) => order.referenceId))];
    if (!productIds.length) return [];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { creator: { select: { id: true, brandName: true, slug: true, logoUrl: true } } },
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    return orders
      .map((order) => {
        const product = productById.get(order.referenceId);
        if (!product) return null;
        const { fileUrl, ...safeProduct } = product;
        return {
          orderId: order.id,
          orderStatus: order.status,
          purchasedAt: order.createdAt,
          amount: order.amount,
          currency: order.currency,
          product: safeProduct,
          downloadKey: order.status === 'COMPLETED' ? fileUrl : null,
          access: order.status === 'COMPLETED' && fileUrl ? 'READY' : order.status === 'COMPLETED' ? 'NO_FILE' : 'PENDING_PAYMENT',
        };
      })
      .filter(Boolean);
  }

  async create(userId: string, dto: CreateProductDto) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');
    const slug = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${nanoid(6)}`;

    return this.prisma.product.create({
      data: {
        creatorId: creator.id,
        type: dto.type ?? 'DOWNLOAD',
        title: dto.title,
        slug,
        description: dto.description,
        price: dto.price ?? 0,
        currency: dto.currency ?? 'USD',
        fileUrl: dto.fileUrl,
        thumbnailUrl: dto.thumbnailUrl,
        status: dto.status ?? 'DRAFT',
      },
    });
  }

  async update(id: string, userId: string, role: string, dto: UpdateProductDto) {
    const product = await this.findManageableById(id);
    await this.verifyOwnership(product.creatorId, userId, role);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string, role: string) {
    const product = await this.findManageableById(id);
    await this.verifyOwnership(product.creatorId, userId, role);
    return this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  private async findManageableById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async verifyOwnership(creatorId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== creatorId) throw new ForbiddenException('Not your product');
  }
}
