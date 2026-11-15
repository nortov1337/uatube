import type { PublicUserDTO } from "@/application/dto/PublicUserDTO";
import { UserMapper } from "@/application/mappers/UserMapper";
import type { HandleFactory } from "@/application/services/HandleFactory";
import { loginSchema, registerSchema } from "@/application/validation/schemas";
import { parseOrThrow } from "@/application/validation/parse";
import { ConflictError } from "@/domain/errors/ConflictError";
import { UnauthorizedError } from "@/domain/errors/UnauthorizedError";
import type { PasswordHasher } from "@/domain/ports/PasswordHasher";
import type { SessionCookie } from "@/domain/ports/SessionCookie";
import type { TokenService } from "@/domain/ports/TokenService";
import type { UserRepository } from "@/domain/ports/UserRepository";

interface AuthServiceDeps {
  users: UserRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  cookie: SessionCookie;
  handles: HandleFactory;
  sessionTtlSec: number;
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  async register(input: unknown): Promise<PublicUserDTO> {
    const { name, email, password } = parseOrThrow(registerSchema, input);
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.deps.users.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError("Пользователь с таким email уже зарегистрирован");
    }
    const handle = await this.deps.handles.fromEmail(normalizedEmail);
    const passwordHash = await this.deps.hasher.hash(password);
    const user = await this.deps.users.create({
      email: normalizedEmail,
      handle,
      name,
      passwordHash,
    });
    const token = await this.deps.tokens.sign({ sub: user.id });
    await this.deps.cookie.set(token, this.deps.sessionTtlSec);
    return UserMapper.toPublic(user);
  }

  async login(input: unknown): Promise<PublicUserDTO> {
    const { email, password } = parseOrThrow(loginSchema, input);
    const user = await this.deps.users.findByEmail(email.trim().toLowerCase());
    const valid = user ? await this.deps.hasher.verify(password, user.passwordHash) : false;
    if (!user || !valid) {
      throw new UnauthorizedError("Неверный email или пароль");
    }
    const token = await this.deps.tokens.sign({ sub: user.id });
    await this.deps.cookie.set(token, this.deps.sessionTtlSec);
    return UserMapper.toPublic(user);
  }

  async resolveSession(): Promise<{ userId: string } | null> {
    const token = await this.deps.cookie.get();
    if (!token) return null;
    const payload = await this.deps.tokens.verify(token);
    return payload ? { userId: payload.sub } : null;
  }

  async currentUser(): Promise<PublicUserDTO | null> {
    const session = await this.resolveSession();
    if (!session) return null;
    const user = await this.deps.users.findById(session.userId);
    return user ? UserMapper.toPublic(user) : null;
  }

  async logout(): Promise<void> {
    await this.deps.cookie.clear();
  }
}
