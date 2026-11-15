import { SignJWT, jwtVerify } from "jose";
import type { TokenService } from "@/domain/ports/TokenService";

interface JoseTokenServiceConfig {
  secret: string;
  ttlDays: number;
}

export class JoseTokenService implements TokenService {
  private readonly secret: Uint8Array;
  private readonly ttlSec: number;

  constructor(config: JoseTokenServiceConfig) {
    if (!config.secret) throw new Error("AUTH_SECRET не задан");
    this.secret = new TextEncoder().encode(config.secret);
    this.ttlSec = config.ttlDays * 86400;
  }

  async sign(payload: { sub: string }): Promise<string> {
    const nowSec = Math.floor(Date.now() / 1000);
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt(nowSec)
      .setExpirationTime(nowSec + this.ttlSec)
      .sign(this.secret);
  }

  async verify(token: string): Promise<{ sub: string } | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, { algorithms: ["HS256"] });
      return typeof payload.sub === "string" ? { sub: payload.sub } : null;
    } catch {
      return null;
    }
  }
}
