const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 24;
const HASHTAG_PATTERN = /#([\p{L}\p{N}_-]{1,40})/gu;
const SPLIT_PATTERN = /[\s,;]+/u;

export class TagNormalizer {
  static normalize(raw: string): string[] {
    return TagNormalizer.collect(raw.split(SPLIT_PATTERN));
  }

  static extract(text: string): string[] {
    const matches = [...text.matchAll(HASHTAG_PATTERN)].map((match) => match[1] ?? "");
    return TagNormalizer.collect(matches);
  }

  static merge(...lists: ReadonlyArray<readonly string[]>): string[] {
    return TagNormalizer.collect(lists.flat());
  }

  private static collect(values: readonly string[]): string[] {
    const result: string[] = [];
    for (const value of values) {
      const tag = TagNormalizer.clean(value);
      if (!tag || result.includes(tag)) continue;
      result.push(tag);
      if (result.length >= MAX_TAGS) break;
    }
    return result;
  }

  private static clean(value: string): string {
    return value
      .replace(/^#+/, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_-]+/gu, "")
      .slice(0, MAX_TAG_LENGTH);
  }
}
