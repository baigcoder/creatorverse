import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { creatorProfile: true },
    });
    const { passwordHash, ...result } = user;
    return result;
  }
}