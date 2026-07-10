import type { Metadata } from "next";
import Logo from "@/app/components/Logo";

// Public-facing coming-soon splash. The site is gated to this page in
// production via `proxy.ts` (env `COMING_SOON`), so the real site stays
// visible on staging while it's built. Team members bypass the gate with a
// `?preview=<token>` link. This page is intentionally standalone — it lives
// directly under `[lang]` (html/fonts root) but outside the `(site)` group,
// so none of the nav/footer/Sanity chrome loads.

// TODO: confirm/replace with BPI's preferred public inbox before launch.
const CONTACT_EMAIL = "info@barbadospharmainc.org";

export const metadata: Metadata = {
  title: "Coming soon — Barbados Pharmaceutical Inc",
  description: "A new era of pharmaceutical care for Barbados and the region.",
  // Keep the placeholder out of search results until the real site launches.
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-base-blue px-6 py-16 text-base-white">
      {/* Soft brand-green glow behind the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-base-green) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        <Logo size={168} className="text-base-white" aria-label="Barbados Pharmaceutical Inc" />

        <p className="mt-12 text-sm font-medium uppercase tracking-[0.35em] text-base-green">
          Coming soon
        </p>

        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl md:text-5xl">
          A new era of pharmaceutical care for Barbados and the region.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-base-white/70 sm:text-lg">
          Our new home is nearly ready. We&rsquo;re building something meaningful
          for our patients, partners, and communities — thank you for your
          patience.
        </p>

        <div className="mt-10 h-px w-16 bg-base-green/60" />

        <p className="mt-8 text-sm text-base-white/60">
          For inquiries, reach us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-base-green underline-offset-4 transition hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}
