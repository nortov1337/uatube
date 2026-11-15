import type { UserEntity } from "@/domain/entities/UserEntity";

export interface UserUpdateData {
  name?: string;
  handle?: string;
  bio?: string;
  avatarName?: string | null;
  bannerName?: string | null;
  passwordHash?: string;
}

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByIds(ids: readonly string[]): Promise<UserEntity[]>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByHandle(handle: string): Promise<UserEntity | null>;
  handleExists(handle: string): Promise<boolean>;
  create(data: {
    email: string;
    handle: string;
    name: string;
    passwordHash: string;
  }): Promise<UserEntity>;
  update(id: string, data: UserUpdateData): Promise<UserEntity>;
  remove(id: string): Promise<void>;
}
