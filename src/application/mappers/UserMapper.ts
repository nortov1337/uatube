import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import type { UserEntity } from "@/domain/entities/UserEntity";

export class UserMapper {
  static toPublic(user: UserEntity): PublicUserDTO {
    return {
      id: user.id,
      handle: user.handle,
      name: user.name,
      avatarUrl: user.avatarName ? `/api/avatar/${user.handle}` : null,
    };
  }
}
