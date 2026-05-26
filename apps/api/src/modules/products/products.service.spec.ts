import { describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service';

describe('ProductsService downloads', () => {
  it('returns completed product orders with a download key', async () => {
    const prisma = {
      order: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'order_1', referenceId: 'product_1', status: 'COMPLETED', amount: 19, currency: 'USD', createdAt: new Date('2026-05-22') },
        ]),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'product_1', title: 'Template', fileUrl: 'products/user/template.zip', creator: { brandName: 'Creator' } },
        ]),
      },
    };
    const service = new ProductsService(prisma as never);

    const downloads = await service.myDownloads('user_1');

    expect(downloads).toEqual([
      expect.objectContaining({
        orderId: 'order_1',
        access: 'READY',
        downloadKey: 'products/user/template.zip',
        product: expect.not.objectContaining({ fileUrl: expect.anything() }),
      }),
    ]);
  });

  it('does not expose download keys for pending product orders', async () => {
    const prisma = {
      order: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'order_1', referenceId: 'product_1', status: 'PENDING', amount: 19, currency: 'USD', createdAt: new Date('2026-05-22') },
        ]),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'product_1', title: 'Template', fileUrl: 'products/user/template.zip', creator: { brandName: 'Creator' } },
        ]),
      },
    };
    const service = new ProductsService(prisma as never);

    const downloads = await service.myDownloads('user_1');

    expect(downloads[0]).toMatchObject({ access: 'PENDING_PAYMENT', downloadKey: null });
  });
});
