import type { PrismaClient } from "@prisma/client";
import type { UserEntity } from "@/domain/entities/UserEntity";
import type { UserRepository, UserUpdateData } from "@/domain/ports/UserRepository";
import { PrismaUserMapper } from "@/infrastructure/repositories/mappers/PrismaUserMapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? PrismaUserMapper.toDomain(row) : null;
  }

  async findByIds(ids: readonly string[]): Promise<UserEntity[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.user.findMany({ where: { id: { in: [...ids] } } });
    return rows.map(PrismaUserMapper.toDomain);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? PrismaUserMapper.toDomain(row) : null;
  }

  async findByHandle(handle: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { handle } });
    return row ? PrismaUserMapper.toDomain(row) : null;
  }

  async handleExists(handle: string): Promise<boolean> {
    const row = await this.prisma.user.findUnique({
      where: { handle },
      select: { id: true },
    });
    return row !== null;
  }

  async create(data: {
    email: string;
    handle: string;
    name: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const row = await this.prisma.user.create({ data });
    return PrismaUserMapper.toDomain(row);
  }

  async update(id: string, data: UserUpdateData): Promise<UserEntity> {
    const row = await this.prisma.user.update({ where: { id }, data });
    return PrismaUserMapper.toDomain(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
