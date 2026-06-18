import { NextResponse, type NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

import { SESSION_COOKIE, verifyToken } from "@/app/lib/portal/jwt";

// Next.js 16 renamed `middleware.ts` → `proxy.ts`. This runs on every request
// the matcher allows. It does two things:
//   1. Prefix un-prefixed paths with a locale.
//   2. Optimistically gate the investor/partner portal — redirect to the login
//      page if there's no validly signed session cookie. (Real authorization —
//      active status + per-item tier checks — lives in the server-side DAL.)
const LOCALES = ["en", "es", "fr", "pt", "nl"] as const;
const DEFAULT_LOCALE = "en";
const COOKIE = "NEXT_LOCALE";

// Portal paths reachable while logged out.
const PORTAL_PUBLIC_SUBPATHS = [
  "/portal/login",
  "/portal/request",
  "/portal/verify",
  "/portal/dev-login",
];

function detectLocale(req: NextRequest): string {
  // 1) Honor an explicit prior choice.
  const fromCookie = req.cookies.get(COOKIE)?.value;
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie;
  }
  // 2) Negotiate from the browser's Accept-Language.
  const headers = { "accept-language": req.headers.get("accept-language") ?? "" };
  const requested = new Negotiator({ headers }).languages();
  try {
    return match(requested, LOCALES as unknown as string[], DEFAULT_LOCALE);
  } catch {
    return DEFAULT_LOCALE;
  }
}

function isPublicPortalSub(sub: string): boolean {
  return PORTAL_PUBLIC_SUBPATHS.some((p) => sub === p || sub.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Un-prefixed → redirect to add a locale, then let the next request be gated.
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (!hasLocale) {
    const locale = detectLocale(req);
    req.nextUrl.pathname = `/${locale}${pathname}`;
    const res = NextResponse.redirect(req.nextUrl);
    res.cookies.set(COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // Locale-prefixed. If this is a protected portal path, require a session.
  const segments = pathname.split("/"); // ["", lang, "portal", ...rest]
  const lang = segments[1] || DEFAULT_LOCALE;
  if (segments[2] === "portal") {
    const sub = `/${segments.slice(2).join("/")}`; // "/portal/..."
    if (!isPublicPortalSub(sub)) {
      const token = req.cookies.get(SESSION_COOKIE)?.value;
      const payload = await verifyToken(token);
      if (!payload) {
        const url = req.nextUrl.clone();
        url.pathname = `/${lang}/portal/login`;
        url.search = "";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Exclude API routes, the Sanity Studio, Next internals, and any file with
  // an extension (fonts, images, robots/sitemap, etc.) from locale rewriting.
  matcher: [
    "/((?!api|studio|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
