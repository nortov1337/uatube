import { randomInt } from "node:crypto";
import type { VideoIdGenerator } from "@/domain/ports/VideoIdGenerator";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
const LENGTH = 11;

export class RandomVideoIdGenerator implements VideoIdGenerator {
  generate(): string {
    let id = "";
    for (let index = 0; index < LENGTH; index += 1) {
      id += ALPHABET[randomInt(ALPHABET.length)];
    }
    return id;
  }
}
