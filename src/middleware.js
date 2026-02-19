import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("authToken");

  const protectedRoutes = ["/dashboard", "/customers", "/orders"];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/customers/:path*", "/orders/:path*"],
};
