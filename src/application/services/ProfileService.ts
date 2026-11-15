import type { SettingsDTO } from "@/application/dto/SettingsDTO";
import type { ImageKind } from "@/domain/ports/ImageStorage";
import type { ImagePolicy } from "@/application/services/ImagePolicy";
import { parseOrThrow } from "@/application/validation/parse";
import { passwordSchema, profileSchema } from "@/application/validation/schemas";
import { ConflictError } from "@/domain/errors/ConflictError";
import { NotFoundError } from "@/domain/errors/NotFoundError";
import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import type { ImageStorage } from "@/domain/ports/ImageStorage";
import type { PasswordHasher } from "@/domain/ports/PasswordHasher";
import type { ThumbStorage } from "@/domain/ports/ThumbStorage";
import type { UserEntity } from "@/domain/entities/UserEntity";
import type { UserRepository } from "@/domain/ports/UserRepository";
import type { VideoRepository } from "@/domain/ports/VideoRepository";
import type { VideoStorage } from "@/domain/ports/VideoStorage";

interface ProfileServiceDeps {
  users: UserRepository;
  videos: VideoRepository;
  hasher: PasswordHasher;
  images: ImageStorage;
  imagePolicy: ImagePolicy;
  storage: VideoStorage;
  thumbs: ThumbStorage;
}

export class ProfileService {
  constructor(private readonly deps: ProfileServiceDeps) {}

  async get(userId: string): Promise<SettingsDTO> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");
    return ProfileService.toDTO(user);
  }

  async update(userId: string, input: unknown): Promise<SettingsDTO> {
    const data = parseOrThrow(profileSchema, input);
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");

    if (data.handle !== user.handle) {
      const taken = await this.deps.users.findByHandle(data.handle);
      if (taken && taken.id !== user.id) throw new ConflictError("Такой адрес канала уже занят");
    }

    const updated = await this.deps.users.update(user.id, {
      name: data.name,
      handle: data.handle,
      bio: data.bio,
    });
    return ProfileService.toDTO(updated);
  }

  async changePassword(userId: string, input: unknown): Promise<void> {
    const data = parseOrThrow(passwordSchema, input);
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");

    const valid = await this.deps.hasher.verify(data.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError("Текущий пароль неверный");

    await this.deps.users.update(user.id, {
      passwordHash: await this.deps.hasher.hash(data.newPassword),
    });
  }

  async setImage(userId: string, kind: ImageKind, file: File): Promise<{ url: string }> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");

    this.deps.imagePolicy.assertJpeg(file);
    const name = await this.deps.images.save(kind, user.id, new Uint8Array(await file.arrayBuffer()));
    await this.deps.users.update(user.id, kind === "avatar" ? { avatarName: name } : { bannerName: name });

    const base = kind === "avatar" ? "/api/avatar" : "/api/banner";
    return { url: `${base}/${user.handle}?v=${Date.now()}` };
  }

  async removeImage(userId: string, kind: ImageKind): Promise<void> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");

    const name = kind === "avatar" ? user.avatarName : user.bannerName;
    if (!name) return;
    await this.deps.images.remove(name);
    await this.deps.users.update(
      user.id,
      kind === "avatar" ? { avatarName: null } : { bannerName: null },
    );
  }

  async removeAccount(userId: string): Promise<void> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw new NotFoundError("Пользователь не найден");

    const limit = 200;
    for (let offset = 0; ; offset += limit) {
      const page = await this.deps.videos.listFeed({
        authorId: user.id,
        visibility: ["public", "unlisted", "private"],
        offset,
        limit,
      });
      await Promise.all(
        page.items.map(async (video) => {
          await this.deps.storage.remove(video.fileName);
          if (video.thumbName) await this.deps.thumbs.remove(video.thumbName);
        }),
      );
      if (!page.hasMore) break;
    }
    if (user.avatarName) await this.deps.images.remove(user.avatarName);
    if (user.bannerName) await this.deps.images.remove(user.bannerName);
    await this.deps.users.remove(user.id);
  }

  private static toDTO(user: UserEntity): SettingsDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      bio: user.bio,
      avatarUrl: user.avatarName ? `/api/avatar/${user.handle}` : null,
      bannerUrl: user.bannerName ? `/api/banner/${user.handle}` : null,
    };
  }
}
