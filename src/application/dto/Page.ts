export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export function pageOf<T>(items: T[], hasMore: boolean, offset: number, limit: number): Page<T> {
  return { items, nextCursor: hasMore ? String(offset + limit) : null };
}

export function offsetFromCursor(cursor?: string): number {
  const offset = Number(cursor);
  return Number.isInteger(offset) && offset > 0 ? offset : 0;
}
