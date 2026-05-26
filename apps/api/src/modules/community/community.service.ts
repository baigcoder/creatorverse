import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { nanoid } from 'nanoid';
import { AnalyticsEventService } from '../../common/services/analytics-event.service';
import { GamificationTriggerService } from '../../common/services/gamification-trigger.service';
import { AppGateway } from '../../gateway/app.gateway';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private analyticsEvents: AnalyticsEventService,
    private gamification: GamificationTriggerService,
    private gateway: AppGateway,
  ) {}

  async findAll(params: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.community.findMany({
        where: { visibility: 'PUBLIC' },
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, brandName: true, logoUrl: true } },
          _count: { select: { rooms: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.community.count({ where: { visibility: 'PUBLIC' } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async discover(userId: string, role: string, params: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const [communities, total, creator, activeSubscriptions] = await Promise.all([
      this.prisma.community.findMany({
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              brandName: true,
              logoUrl: true,
              slug: true,
              membershipPlans: {
                where: { status: 'PUBLISHED', communityAccess: true },
                select: { id: true, name: true, price: true, currency: true, interval: true },
                orderBy: { price: 'asc' },
              },
            },
          },
          _count: { select: { rooms: true } },
        },
        orderBy: [{ visibility: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.community.count(),
      this.prisma.creatorProfile.findUnique({ where: { userId } }),
      this.prisma.subscription.findMany({
        where: { userId, status: 'ACTIVE', plan: { communityAccess: true } },
        select: { plan: { select: { creatorId: true } } },
      }),
    ]);

    const subscribedCreatorIds = new Set(activeSubscriptions.map((subscription) => subscription.plan.creatorId));
    const data = communities.map((community) => {
      const owned = creator?.id === community.creatorId;
      const admin = role === 'SUPER_ADMIN' || role === 'ADMIN';
      const canAccess = community.visibility === 'PUBLIC' || owned || admin || subscribedCreatorIds.has(community.creatorId);
      return {
        ...community,
        access: canAccess ? 'OPEN' : community.visibility === 'PAID' ? 'MEMBERSHIP_REQUIRED' : 'INVITE_REQUIRED',
        locked: !canAccess,
        rooms: canAccess ? undefined : [],
      };
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, brandName: true, logoUrl: true, slug: true } },
        rooms: { orderBy: { order: 'asc' } },
        _count: { select: { rooms: true } },
      },
    });
    if (!community || community.visibility !== 'PUBLIC') throw new NotFoundException('Community not found');
    return community;
  }

  async findAccessibleById(id: string, userId: string, role: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            brandName: true,
            logoUrl: true,
            slug: true,
            membershipPlans: {
              where: { status: 'PUBLISHED', communityAccess: true },
              select: { id: true, name: true, price: true, currency: true, interval: true },
              orderBy: { price: 'asc' },
            },
          },
        },
        rooms: { orderBy: { order: 'asc' } },
        _count: { select: { rooms: true } },
      },
    });
    if (!community) throw new NotFoundException('Community not found');
    await this.assertCanViewCommunity(id, userId, role);
    return { ...community, access: 'OPEN', locked: false };
  }

  async create(userId: string, dto: any) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Creator profile required');

    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + nanoid(6);
    const community = await this.prisma.community.create({
      data: {
        creatorId: creator.id,
        name: dto.name,
        slug,
        description: dto.description,
        visibility: dto.visibility || 'PRIVATE',
      },
    });

    await this.prisma.communityRoom.create({
      data: {
        communityId: community.id,
        name: 'General',
        type: 'TEXT',
        order: 0,
      },
    });

    return community;
  }

  async update(id: string, userId: string, role: string, data: any) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community) throw new NotFoundException('Community not found');

    await this.verifyOwnership(community.creatorId, userId, role);

    return this.prisma.community.update({ where: { id }, data });
  }

  async createRoom(communityId: string, userId: string, role: string, dto: any) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    await this.verifyOwnership(community.creatorId, userId, role);

    const maxOrder = await this.prisma.communityRoom.aggregate({
      where: { communityId },
      _max: { order: true },
    });

    return this.prisma.communityRoom.create({
      data: {
        communityId,
        name: dto.name,
        type: dto.type || 'TEXT',
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async getRooms(communityId: string, userId?: string, role?: string) {
    await this.assertCanViewCommunity(communityId, userId, role);
    return this.prisma.communityRoom.findMany({
      where: { communityId },
      orderBy: { order: 'asc' },
    });
  }

  async createPost(roomId: string, userId: string, role: string, dto: any) {
    const room = await this.prisma.communityRoom.findUnique({
      where: { id: roomId },
      include: { community: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    await this.assertCanViewCommunity(room.communityId, userId, role);

    const post = await this.prisma.post.create({
      data: {
        roomId,
        authorId: userId,
        content: dto.content,
        mediaUrls: dto.mediaUrls || [],
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } }, reactions: true, comments: true },
    });

    await Promise.allSettled([
      this.analyticsEvents.track(userId, room.community.creatorId, 'COMMUNITY_POST_CREATED', { communityId: room.communityId, roomId, postId: post.id }),
      this.gamification.onCommunityPost(userId, post.id),
    ]);
    this.gateway.sendToRoom(`community:${room.communityId}`, 'community:post_created', post);
    this.gateway.sendToRoom(`room:${roomId}`, 'community:post_created', post);
    return post;
  }

  async getPosts(roomId: string, userId: string, role: string, params: { page: number; limit: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const room = await this.prisma.communityRoom.findUnique({ where: { id: roomId }, select: { communityId: true } });
    if (!room) throw new NotFoundException('Room not found');
    await this.assertCanViewCommunity(room.communityId, userId, role);

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { roomId },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          comments: {
            include: { author: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 10,
          },
          reactions: true,
          poll: true,
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where: { roomId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createComment(postId: string, userId: string, role: string, dto: any) {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, include: { room: true } });
    if (!post) throw new NotFoundException('Post not found');
    await this.assertCanViewCommunity(post.room.communityId, userId, role);

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: dto.content,
        parentCommentId: dto.parentCommentId,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });

    this.gateway.sendToRoom(`post:${postId}`, 'community:comment_created', comment);
    return comment;
  }

  async createReaction(postId: string, userId: string, role: string, type: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, include: { room: true } });
    if (!post) throw new NotFoundException('Post not found');
    await this.assertCanViewCommunity(post.room.communityId, userId, role);
    return this.prisma.reaction.upsert({
      where: { postId_userId_type: { postId, userId, type } },
      create: { postId, userId, type },
      update: {},
    });
  }

  async createPoll(postId: string, userId: string, role: string, dto: any) {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, include: { room: true } });
    if (!post) throw new NotFoundException('Post not found');
    await this.assertCanViewCommunity(post.room.communityId, userId, role);
    return this.prisma.poll.create({
      data: {
        postId,
        question: dto.question,
        options: dto.options || [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        allowMultiple: dto.allowMultiple ?? false,
      },
    });
  }

  async votePoll(pollId: string, userId: string, role: string, option: string) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId }, include: { post: { include: { room: true } } } });
    if (!poll) throw new NotFoundException('Poll not found');
    await this.assertCanViewCommunity(poll.post.room.communityId, userId, role);
    return this.prisma.pollVote.upsert({
      where: { pollId_userId_option: { pollId, userId, option } },
      create: { pollId, userId, option },
      update: {},
    });
  }

  private async assertCanViewCommunity(communityId: string, userId?: string, role?: string) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.visibility === 'PUBLIC') return;
    if (!userId) throw new NotFoundException('Community not found');
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (creator?.id === community.creatorId) return;

    if (community.visibility === 'PAID') {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          plan: { creatorId: community.creatorId, communityAccess: true },
        },
      });
      if (subscription) return;
    }

    throw new ForbiddenException('You do not have access to this community');
  }

  private async verifyOwnership(creatorId: string, userId: string, role: string) {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator || creator.id !== creatorId) {
      throw new ForbiddenException('Not your community');
    }
  }
}
