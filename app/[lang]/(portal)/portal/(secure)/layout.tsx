import Link from "next/link";

import Logo from "@/app/components/Logo";
import { logout } from "@/app/lib/portal/actions";
import { requireUser } from "@/app/lib/portal/dal";
import { DEV_BYPASS_USER_ID } from "@/app/lib/portal/devBypass";
import { toLocale } from "@/app/lib/locale";

import { pillClass } from "../ui";

// Per-user, never cached.
export const dynamic = "force-dynamic";

export default async function SecurePortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);
  // The real gate. Redirects to login if not an active, signed-in user.
  const user = await requireUser(lang);
  const isPreview = user._id === DEV_BYPASS_USER_ID;

  return (
    <div className="min-h-screen">
      {isPreview ? (
        <div className="bg-warning-500 px-4 py-1.5 text-center text-xs font-medium text-white">
          Preview mode — you&apos;re signed in as a sample user. Not real
          authentication.
        </div>
      ) : null}
      <header className="border-b border-primary-500/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href={`/${lang}/portal`}
              className="flex items-center gap-2.5 text-primary-500"
              aria-label="BPI Portal — overview"
            >
              <Logo size={80} className="text-primary-500" />
              <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-primary-500/50 sm:inline">
                Portal
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-primary-500/70">
              <Link
                href={`/${lang}/portal`}
                className="hov-underline hover:text-primary-500"
              >
                Overview
              </Link>
              <Link
                href={`/${lang}/portal/resources`}
                className="hov-underline hover:text-primary-500"
              >
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-primary-500/70">
            <span className="hidden sm:inline">{user.name ?? user.email}</span>
            <form action={logout}>
              <input type="hidden" name="lang" value={lang} />
              <button type="submit" className={pillClass("secondary")}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
