import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "pp_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "play-port-secret-change-in-production"
);

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
