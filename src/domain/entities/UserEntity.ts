export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly handle: string;
  readonly name: string;
  readonly bio: string;
  readonly avatarName: string | null;
  readonly bannerName: string | null;
  readonly passwordHash: string;
  readonly createdAt: Date;
}
