import { NextResponse } from "next/server";

export class JsonResponder {
  static ok<T>(data: T): NextResponse {
    return NextResponse.json(data, { status: 200 });
  }

  static created<T>(data: T): NextResponse {
    return NextResponse.json(data, { status: 201 });
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  static error(status: number, body: unknown): NextResponse {
    return NextResponse.json(body, { status });
  }
}
