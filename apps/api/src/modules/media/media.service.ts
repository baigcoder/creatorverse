import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CompleteUploadDto } from './media.dto';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'application/zip',
]);

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly maxUploadSize = 1024 * 1024 * 500;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async createUploadPolicy(userId: string, dto: { filename: string; contentType: string; size: number; folder?: string }) {
    if (!allowedMimeTypes.has(dto.contentType)) throw new BadRequestException('Unsupported file type');
    if (dto.size > this.maxUploadSize) throw new BadRequestException('File exceeds 500MB limit');

    const bucket = this.configService.get<string>('storage.bucket');
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId }, select: { id: true } });
    const folder = this.normalizeFolder(dto.folder, dto.contentType);
    const ownerPrefix = creator ? `creators/${creator.id}` : `users/${userId}`;
    const key = `${folder}/${ownerPrefix}/${nanoid(12)}-${this.sanitizeFilename(dto.filename)}`;

    if (!bucket) {
      return {
        provider: 'local-dev',
        bucket: null,
        key,
        maxSize: this.maxUploadSize,
        contentType: dto.contentType,
        uploadUrl: null,
        message: 'Configure S3 credentials for production file storage.',
      };
    }

    const accessKey = this.configService.get<string>('storage.accessKey') || '';
    const secretKey = this.configService.get<string>('storage.secretKey') || '';

    if (!accessKey || !secretKey) {
      return {
        provider: 's3-compatible',
        bucket,
        key,
        maxSize: this.maxUploadSize,
        contentType: dto.contentType,
        uploadUrl: null,
        message: 'S3 bucket configured but access keys are missing.',
      };
    }

    const expiresIn = 900;
    const uploadUrl = await getSignedUrl(
      this.createS3Client(),
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: dto.contentType,
        ContentLength: dto.size,
      }),
      { expiresIn },
    );

    return {
      provider: 's3-compatible',
      bucket,
      key,
      maxSize: 1024 * 1024 * 500,
      contentType: dto.contentType,
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      expiresIn,
    };
  }

  async completeUpload(userId: string, dto: CompleteUploadDto) {
    if (!allowedMimeTypes.has(dto.contentType)) throw new BadRequestException('Unsupported file type');
    if (dto.size > this.maxUploadSize) throw new BadRequestException('File exceeds 500MB limit');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    this.assertUploadKeyBelongsToUser(dto.key, userId, creator?.id);
    const bucket = this.configService.get<string>('storage.bucket') || null;
    const folder = dto.folder ? this.normalizeFolder(dto.folder, dto.contentType) : this.folderFromKey(dto.key);

    return this.prisma.mediaAsset.upsert({
      where: { key: dto.key },
      update: {
        filename: dto.filename,
        contentType: dto.contentType,
        size: dto.size,
        url: dto.url,
        folder,
        visibility: dto.visibility ?? 'PROTECTED',
        status: 'UPLOADED',
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonObject,
      },
      create: {
        uploaderId: userId,
        creatorId: creator?.id,
        key: dto.key,
        filename: dto.filename,
        contentType: dto.contentType,
        size: dto.size,
        provider: bucket ? 's3-compatible' : 'local-dev',
        bucket,
        url: dto.url,
        folder,
        visibility: dto.visibility ?? 'PROTECTED',
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  }

  async list(userId: string, role: string, params: { folder?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 40));
    const where: Prisma.MediaAssetWhereInput = {};

    if (params.folder) where.folder = params.folder;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      where.OR = [{ uploaderId: userId }, ...(creator ? [{ creatorId: creator.id }] : [])];
    }

    const [data, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async signedUrl(key: string, userId: string, role: string) {
    await this.assertCanAccess(key, userId, role);

    const bucket = this.configService.get<string>('storage.bucket');
    const accessKey = this.configService.get<string>('storage.accessKey') || '';
    const secretKey = this.configService.get<string>('storage.secretKey') || '';
    const expiresIn = 600;

    if (!bucket || !accessKey || !secretKey) {
      return { key, url: key.startsWith('http') ? key : `/protected-media/${encodeURIComponent(key)}`, expiresIn };
    }

    const url = await getSignedUrl(
      this.createS3Client(),
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn },
    );
    return { key, url, expiresIn };
  }

  private async assertCanAccess(key: string, userId: string, role: string) {
    if (!key) throw new BadRequestException('Asset key is required');
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;

    const asset = await this.prisma.mediaAsset.findUnique({ where: { key } });
    if (!asset) return;
    if (asset.visibility === 'PUBLIC' || asset.uploaderId === userId) return;

    if (asset.creatorId) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (creator?.id === asset.creatorId) return;
    }

    const videoUrlChecks = [{ videoUrl: key }];
    if (asset.url) videoUrlChecks.push({ videoUrl: asset.url });

    const lesson = await this.prisma.lesson.findFirst({
      where: {
        OR: videoUrlChecks,
      },
      select: { courseId: true },
    });

    if (lesson) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } },
      });
      if (enrollment && enrollment.status !== 'EXPIRED') return;
    }

    const productUrlChecks = [{ fileUrl: key }];
    if (asset.url) productUrlChecks.push({ fileUrl: asset.url });
    const product = await this.prisma.product.findFirst({
      where: { OR: productUrlChecks },
      select: { id: true, creatorId: true, price: true, status: true },
    });

    if (product) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (creator?.id === product.creatorId) return;
      if (Number(product.price) === 0 && product.status === 'PUBLISHED') return;
      const completedOrder = await this.prisma.order.findFirst({
        where: {
          userId,
          orderType: 'PRODUCT',
          referenceId: product.id,
          status: 'COMPLETED',
        },
      });
      if (completedOrder) return;
    }

    throw new ForbiddenException('You do not have access to this media asset');
  }

  private createS3Client() {
    const endpoint = this.configService.get<string>('storage.endpoint') || undefined;
    const region = this.configService.get<string>('storage.region') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('storage.accessKey') || '';
    const secretAccessKey = this.configService.get<string>('storage.secretKey') || '';

    return new S3Client({
      endpoint,
      region,
      forcePathStyle: Boolean(endpoint),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private normalizeFolder(folder: string | undefined, contentType: string) {
    const fallback = contentType.startsWith('video/') ? 'videos' : 'uploads';
    const rawFolder = folder?.trim() || fallback;
    const segments = rawFolder
      .replace(/\\/g, '/')
      .split('/')
      .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, ''))
      .filter((segment) => segment && segment !== '.' && segment !== '..');

    return segments.length ? segments.join('/') : fallback;
  }

  private folderFromKey(key: string) {
    const normalized = key.replace(/\\/g, '/');
    const ownerMarker = normalized.includes('/creators/') ? '/creators/' : normalized.includes('/users/') ? '/users/' : null;
    if (!ownerMarker) return normalized.split('/')[0] || 'uploads';
    return normalized.slice(0, normalized.indexOf(ownerMarker)) || 'uploads';
  }

  private sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'asset';
  }

  private assertUploadKeyBelongsToUser(key: string, userId: string, creatorId?: string) {
    const normalized = key.replace(/\\/g, '/');
    const allowedSegments = creatorId ? [`/creators/${creatorId}/`, `/${userId}/`] : [`/users/${userId}/`, `/${userId}/`];
    if (allowedSegments.some((segment) => normalized.includes(segment))) return;
    throw new ForbiddenException('Upload key does not belong to the current creator');
  }
}
