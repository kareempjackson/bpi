import type { Metadata } from "next";
import Link from "next/link";

import Logo from "./components/Logo";

export const metadata: Metadata = {
  title: "Under construction — BPI",
  description:
    "This page is still under construction. Please be patient with us — we're building piece by piece.",
};

/**
 * Root-level 404 handler. Next.js renders this file whenever a request
 * URL doesn't match ANY route in the app — so every broken / not-yet-built
 * link in the site lands here. Lightweight on purpose: no Sanity fetches,
 * no global providers, just BPI branding + a clear "under construction"
 * message and two links back into the site.
 *
 * The route-group-scoped `app/(site)/not-found.tsx` still handles
 * `notFound()` thrown from inside `(site)` pages (e.g. unknown initiative
 * slugs) and uses the full site layout there.
 */
export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col bg-error-25 text-primary-500 overflow-hidden">
      {/* Top bar — just the logo so the page still feels like part of the
          site without needing the full sticky nav + Sanity data. */}
      <header className="relative z-10 px-6 md:px-12 lg:px-16 pt-8 lg:pt-10">
        <Link
          href="/"
          aria-label="Back to BPI home"
          className="inline-flex items-center"
        >
          <Logo
            size={130}
            className="text-primary-500 transition-opacity duration-300 hover:opacity-80"
          />
        </Link>
      </header>

      {/* Subtle icon watermarks — matching the careers / footer treatment. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Logo
          iconOnly
          size={460}
          className="absolute -top-20 -left-28 text-primary-500 opacity-[0.04]"
        />
        <Logo
          iconOnly
          size={520}
          className="absolute top-1/3 -right-32 text-primary-500 opacity-[0.04]"
        />
        <Logo
          iconOnly
          size={400}
          className="absolute -bottom-24 left-1/3 text-primary-500 opacity-[0.04]"
        />
      </div>

      <section className="relative z-10 flex-1 flex items-center px-5 md:px-20 lg:px-32 py-12 md:py-20 lg:py-24">
        <div className="mx-auto max-w-page flex flex-col items-center text-center">
          <div className="text-xs lg:text-sm font-medium tracking-[0.18em] text-primary-500/65 uppercase">
            Under construction
          </div>

          <h1 className="mt-5 lg:mt-6 font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.02] tracking-[-0.02em] max-w-3xl">
            Please be patient with us.
          </h1>

          <p className="mt-5 lg:mt-6 text-base md:text-lg lg:text-xl text-primary-500/75 leading-relaxed max-w-xl">
            The page you&rsquo;re looking for is still being built. We&rsquo;re
            putting it together piece by piece — check back soon, or take a
            look at what&rsquo;s already here.
          </p>

          <div className="mt-8 lg:mt-10 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
            <Link
              href="/"
              className="rounded-round border border-dashed border-primary-500/45 bg-error-500 px-6 lg:px-7 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-error-400 hover:border-primary-500/70 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500/60"
            >
              Back to home
            </Link>
            <Link
              href="/contact"
              className="rounded-round border border-dashed border-primary-500/60 bg-transparent px-6 lg:px-7 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-primary-500/5 hover:border-primary-500/90 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
