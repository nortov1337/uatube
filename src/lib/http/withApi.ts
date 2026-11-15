import type { NextRequest } from "next/server";
import { ErrorMapper } from "@/infrastructure/http/ErrorMapper";
import { JsonResponder } from "@/infrastructure/http/JsonResponder";

export type ApiHandler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

export function withApi<C = unknown>(handler: ApiHandler<C>): ApiHandler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      const { status, body } = ErrorMapper.toResponse(error);
      return JsonResponder.error(status, body);
    }
  };
}
