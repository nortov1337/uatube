export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly handle: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
}
