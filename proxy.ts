import { NextResponse, type NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

// Next.js 16 renamed `middleware.ts` → `proxy.ts`. This runs on every request
// the matcher allows and prefixes un-prefixed paths with a locale.
const LOCALES = ["en", "es", "fr", "pt", "nl"] as const;
const DEFAULT_LOCALE = "en";
const COOKIE = "NEXT_LOCALE";

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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Already locale-prefixed → pass through.
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

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

export const config = {
  // Exclude API routes, the Sanity Studio, Next internals, and any file with
  // an extension (fonts, images, robots/sitemap, etc.) from locale rewriting.
  matcher: [
    "/((?!api|studio|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
