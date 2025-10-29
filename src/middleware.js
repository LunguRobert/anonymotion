// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "./lib/authz";

export async function middleware(req) {
  const url = req.nextUrl;
  const { pathname } = url;

  const redirectToSignIn = (reason = "unauthenticated") => {
    const signInUrl = new URL("/auth/signin", url.origin);
    signInUrl.searchParams.set("callbackUrl", url.href);
    signInUrl.searchParams.set("reason", reason);
    return NextResponse.redirect(signInUrl);
  };

  // ---- Admin: trebuie autentificat + admin; setăm noindex mereu
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // nu e logat -> redirect la login cu callback
    if (!token) return redirectToSignIn();

    // logat dar nu admin -> 403 + noindex
    if (!isAdminEmail(token.email)) {
      return new NextResponse("Forbidden", {
        status: 403,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    // admin autentic -> continuă + noindex
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // ---- User: totul sub /user necesită autentificare; redirect dacă nu e logat
  if (pathname.startsWith("/user")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // (opțional) dacă în JWT ai un flag `blocked`, deblochează comentariul:
    // if (token?.blocked) return redirectToSignIn("blocked");

    if (!token) return redirectToSignIn();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
