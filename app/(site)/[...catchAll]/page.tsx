import type { Metadata } from "next";
import Link from "next/link";

import Logo from "../../components/Logo";

export const metadata: Metadata = {
  title: "Under construction — BPI",
  description:
    "This page is still under construction. Please be patient with us — we're building piece by piece.",
};

/**
 * Catch-all route. Next.js matches specific files first (e.g. `/about`,
 * `/contact`, `/initiatives/[slug]`), then dynamic segments, and only
 * falls through to `[...catchAll]` when nothing else matches. So every
 * "broken" or not-yet-built link in the site renders this page with the
 * full site layout (StickyTopNav + Footer from `(site)/layout.tsx`).
 *
 * This is the reliable counterpart to `app/not-found.tsx`: not-found
 * triggers on `notFound()` calls, but unmatched URLs are most
 * consistently handled by a real catch-all route.
 */
export default function UnderConstructionCatchAll() {
  return (
    <main className="relative bg-error-25 overflow-hidden min-h-[calc(100vh-160px)] flex items-center">
      {/* Subtle BPI-icon watermarks — matches the careers / footer treatment. */}
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
          className="absolute -bottom-20 left-1/3 text-primary-500 opacity-[0.04]"
        />
      </div>

      <section className="relative z-10 w-full px-5 md:px-20 lg:px-32 py-20 md:py-28 lg:py-32">
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
