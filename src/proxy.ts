import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "session";

export function proxy(req: NextRequest) {
  if (req.cookies.get(COOKIE_NAME)?.value) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/upload",
    "/studio/:path*",
    "/settings/:path*",
    "/history/:path*",
    "/subscriptions/:path*",
    "/notifications/:path*",
    "/playlists/:path*",
  ],
};
