// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "./lib/authz";

export async function middleware(req) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl;
  const { pathname } = url;

  // 1) Canonical host: apex -> www (must run FIRST)
  if (host === "anonymotions.com") {
    const redirectUrl = url.clone();
    redirectUrl.host = "www.anonymotions.com";
    return NextResponse.redirect(redirectUrl, 301);
  }

  const redirectToSignIn = (reason = "unauthenticated") => {
    const signInUrl = new URL("/auth/signin", url.origin);
    signInUrl.searchParams.set("callbackUrl", url.href);
    signInUrl.searchParams.set("reason", reason);
    return NextResponse.redirect(signInUrl);
  };

  // ---- Admin: trebuie autentificat + admin; setăm noindex mereu
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return redirectToSignIn();

    if (!isAdminEmail(token.email)) {
      return new NextResponse("Forbidden", {
        status: 403,
        headers: { "X-Robots-Tag": "noindex, nofollow" },
      });
    }

    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // ---- User: totul sub /user necesită autentificare
  if (pathname.startsWith("/user")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return redirectToSignIn();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // run on everything except Next internals/static assets
  matcher: ["/((?!_next|.*\\.(?:css|js|map|png|jpg|jpeg|gif|svg|webp|ico|txt|xml|json|woff2?)$).*)"],
};
