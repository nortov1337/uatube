import type { User as PrismaUser } from "@prisma/client";
import type { UserEntity } from "@/domain/entities/UserEntity";

export class PrismaUserMapper {
  static toDomain(row: PrismaUser): UserEntity {
    return {
      id: row.id,
      email: row.email,
      handle: row.handle,
      name: row.name,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    };
  }
}
