import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(AppGateway.name);
  private userSockets = new Map<string, string>();

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async afterInit(server: Server) {
    const redisHost = this.configService.get('redis.host') || 'localhost';
    const redisPort = this.configService.get('redis.port') || 6379;
    server.use(async (socket, next) => {
      try {
        const token = this.extractAccessToken(socket);
        if (!token) return next(new Error('Authentication required'));
        const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
          secret: this.configService.get<string>('jwt.accessSecret') || 'change-me-in-production-access-secret',
        });
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, role: true, status: true, emailVerified: true },
        });
        if (!user || user.status !== 'ACTIVE' || !user.emailVerified) return next(new Error('Authentication required'));
        socket.data.user = { id: user.id, role: user.role };
        return next();
      } catch {
        return next(new Error('Authentication required'));
      }
    });

    try {
      const pubClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      const ioServer = ((server as any).server ?? server) as Server;
      if (typeof ioServer.adapter !== 'function') throw new Error('Socket.IO adapter API unavailable');
      ioServer.adapter(createAdapter(pubClient, subClient));
      this.logger.log('WebSocket server initialized with Redis adapter');
    } catch (err: any) {
      this.logger.warn(`Redis adapter not available, using default: ${err.message}`);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      this.userSockets.set(String(userId), client.id);
      client.join(`user:${userId}`);
      client.join(`role:${client.data.user.role}`);
      this.logger.log(`Client connected: ${client.id} for user ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('community:join')
  async joinCommunity(@ConnectedSocket() client: Socket, @MessageBody() body: { communityId?: string; roomId?: string; postId?: string }) {
    const userId = client.data.user?.id;
    if (!userId) return { ok: false, reason: 'unauthenticated' };

    if (body.communityId) {
      client.join(`community:${body.communityId}`);
    }
    if (body.roomId) {
      client.join(`room:${body.roomId}`);
    }
    if (body.postId) {
      client.join(`post:${body.postId}`);
    }
    return { ok: true };
  }

  @SubscribeMessage('workshop:join')
  async joinWorkshop(@ConnectedSocket() client: Socket, @MessageBody() body: { workshopId?: string }) {
    const userId = client.data.user?.id;
    if (!userId || !body.workshopId) return { ok: false, reason: 'invalid_request' };
    client.join(`workshop:${body.workshopId}`);
    this.server.to(`workshop:${body.workshopId}`).emit('workshop:presence', { userId, status: 'joined', at: new Date().toISOString() });
    return { ok: true };
  }

  @SubscribeMessage('workshop:message')
  async workshopMessage(@ConnectedSocket() client: Socket, @MessageBody() body: { workshopId?: string; message?: string }) {
    const userId = client.data.user?.id;
    if (!userId || !body.workshopId || !body.message?.trim()) return { ok: false, reason: 'invalid_request' };
    const payload = { userId, message: body.message.trim(), at: new Date().toISOString() };
    this.server.to(`workshop:${body.workshopId}`).emit('workshop:message', payload);
    return { ok: true, data: payload };
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  private extractAccessToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) return authToken;
    const authorization = client.handshake.headers.authorization;
    if (authorization?.startsWith('Bearer ')) return authorization.slice(7);
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((part) => {
        const [key, ...value] = part.trim().split('=');
        return [key, decodeURIComponent(value.join('='))];
      }),
    );
    return cookies.accessToken ?? null;
  }
}
