import type { UserRepository } from "@/domain/ports/UserRepository";

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

interface HandleFactoryDeps {
  users: UserRepository;
}

export class HandleFactory {
  constructor(private readonly deps: HandleFactoryDeps) {}

  async fromEmail(email: string): Promise<string> {
    const base = this.sanitize(email.split("@")[0] ?? "");
    if (!(await this.deps.users.handleExists(base))) return base;

    for (let index = 2; index < 100; index += 1) {
      const suffix = `-${index}`;
      const candidate = `${base.slice(0, MAX_LENGTH - suffix.length)}${suffix}`;
      if (!(await this.deps.users.handleExists(candidate))) return candidate;
    }
    throw new Error("Не удалось подобрать свободный handle");
  }

  private sanitize(local: string): string {
    const transliterated = [...local.toLowerCase()]
      .map((char) => TRANSLIT[char] ?? char)
      .join("");
    const cleaned = transliterated.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    const padded = cleaned.length < MIN_LENGTH ? `user_${cleaned}`.padEnd(MIN_LENGTH, "0") : cleaned;
    return padded.slice(0, MAX_LENGTH).replace(/_+$/g, "") || "user";
  }
}
