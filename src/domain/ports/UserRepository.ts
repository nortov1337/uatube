import type { UserEntity } from "@/domain/entities/UserEntity";

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByHandle(handle: string): Promise<UserEntity | null>;
  handleExists(handle: string): Promise<boolean>;
  create(data: {
    email: string;
    handle: string;
    name: string;
    passwordHash: string;
  }): Promise<UserEntity>;
}
