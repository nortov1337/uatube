import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/domain/ports/PasswordHasher";

const COST = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
