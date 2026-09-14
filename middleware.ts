import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";
const COOKIE_VALUE = "authenticated";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = pathname === "/login" || pathname === "/api/auth";
  const isNextAsset = pathname.startsWith("/_next/") || pathname === "/favicon.ico";

  if (isPublicPath || isNextAsset) return NextResponse.next();

  const isAuthenticated = request.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  if (isAuthenticated) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
