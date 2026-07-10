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

// ── Coming-soon gate ────────────────────────────────────────────────────────
// When `COMING_SOON` is truthy (set it only on the Production/Vercel env), the
// public sees a branded splash instead of the site — so staging keeps showing
// the real app while it's built. The team bypasses the gate by visiting any URL
// with `?preview=<token>` (matching `COMING_SOON_BYPASS`), which drops a cookie.
const COMING_SOON_PATH = "coming-soon";
const BYPASS_COOKIE = "cs_bypass";
const BYPASS_QUERY = "preview";

function comingSoonEnabled(): boolean {
  const v = process.env.COMING_SOON;
  return v === "1" || v === "true";
}

function isLocale(seg: string | undefined): boolean {
  return !!seg && (LOCALES as readonly string[]).includes(seg);
}

// Returns a response when the gate handles the request, or null to fall through
// to normal locale/portal routing (i.e. the visitor is allowed onto the site).
function gateComingSoon(req: NextRequest, pathname: string): NextResponse | null {
  const bypassToken = process.env.COMING_SOON_BYPASS;

  // 1) Team preview link: stash a bypass cookie, then strip the token from the
  //    URL so it doesn't linger in history or server logs.
  const preview = req.nextUrl.searchParams.get(BYPASS_QUERY);
  if (bypassToken && preview === bypassToken) {
    const url = req.nextUrl.clone();
    url.searchParams.delete(BYPASS_QUERY);
    const res = NextResponse.redirect(url);
    res.cookies.set(BYPASS_COOKIE, bypassToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  // 2) Already holding a valid bypass cookie → let the real site through.
  if (bypassToken && req.cookies.get(BYPASS_COOKIE)?.value === bypassToken) {
    return null;
  }

  // 3) Already on the splash → don't rewrite onto itself (avoid a loop).
  const segments = pathname.split("/");
  if (segments[2] === COMING_SOON_PATH) return null;

  // 4) Everyone else → serve the splash at the visitor's locale, keeping their
  //    URL intact (rewrite, not redirect) and out of search indexes.
  const locale = isLocale(segments[1]) ? segments[1] : detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}/${COMING_SOON_PATH}`;
  url.search = "";
  const res = NextResponse.rewrite(url);
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

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

  // Public coming-soon gate runs first: if enabled and the visitor isn't a
  // team member holding a bypass cookie, everything below is short-circuited.
  if (comingSoonEnabled()) {
    const gated = gateComingSoon(req, pathname);
    if (gated) return gated;
  }

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
