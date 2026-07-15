import type { Metadata } from "next";

import CtaLink from "@/app/components/CtaLink";
import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { toLocale } from "@/app/lib/locale";

export const metadata: Metadata = {
  title: "Investors & Partners — BPI",
  description:
    "Back the Caribbean's pharmaceutical gateway. Barbados Pharmaceutical Inc. is building the manufacturing capacity, supply chain, and regulatory infrastructure the region depends on — and we're inviting aligned investors and partners to build it with us.",
};

// At-a-glance framing of the opportunity. Deliberately qualitative — no
// invented financials — drawn from BPI's established positioning.
const STATS: { value: string; label: string }[] = [
  { value: "97%", label: "of Caribbean medicines are imported today" },
  { value: "44M+", label: "people across the Caribbean region" },
  { value: "3", label: "pillars: manufacturing, supply chain, regulation" },
  { value: "1st", label: "integrated pharmaceutical gateway of its kind" },
];

// The two ways to engage. Each track links to the gated portal, where
// approved investors and partners get tier-specific materials.
const TRACKS: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}[] = [
  {
    eyebrow: "For investors",
    title: "Capital that builds regional resilience",
    body: "We're raising to scale manufacturing capacity and the supporting infrastructure. Approved investors get access to the data room — financial models, the regulatory roadmap, and our capacity build-out plan.",
    points: [
      "Audited financials & projections",
      "Regulatory & licensing roadmap",
      "Capacity and go-to-market plan",
    ],
  },
  {
    eyebrow: "For partners",
    title: "Build the supply chain with us",
    body: "Manufacturers, distributors, regulators, and research institutions help turn the gateway into reality. We co-develop programs across the value chain — from production to last-mile distribution.",
    points: [
      "Manufacturing & co-production",
      "Distribution & logistics networks",
      "Research & regulatory collaboration",
    ],
  },
];

// How engagement actually runs, start to finish.
const STEPS: { title: string; body: string }[] = [
  {
    title: "Request access",
    body: "Tell us who you are and how you'd like to engage. Every request is reviewed by our team.",
  },
  {
    title: "Review the materials",
    body: "Once approved, you'll receive a secure sign-in link to the portal and the documents matched to your tier.",
  },
  {
    title: "Build together",
    body: "We move into diligence or program design with a dedicated point of contact at BPI.",
  },
];

export default async function InvestorsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);

  const requestHref = `/${lang}/portal/request`;
  const contactHref = `/${lang}/contact`;

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden bg-error-950"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative px-6 md:px-12 lg:px-20 xl:px-28 pt-32 md:pt-40 lg:pt-48 pb-20 md:pb-28 lg:pb-32">
          <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-end">
            <Stagger
              as="h1"
              className="font-display text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] max-w-3xl"
            >
              <StaggerItem as="span" className="text-white">Build the Caribbean&apos;s</StaggerItem>{" "}
              <StaggerItem as="span" className="text-error-500">pharmaceutical gateway</StaggerItem>{" "}
              <StaggerItem as="span" className="text-white">with us.</StaggerItem>
            </Stagger>

            <Stagger
              className="flex flex-col gap-6 max-w-md lg:justify-self-end"
            >
              <StaggerItem
                as="p"
                className="text-base md:text-lg text-white/70 leading-relaxed"
              >
                97% of Caribbean medicines are imported. BPI is building the
                manufacturing capacity, supply chain, and regulatory
                infrastructure to change that — and we&apos;re inviting aligned
                investors and partners to build it with us.
              </StaggerItem>
              <StaggerItem className="flex flex-wrap items-center gap-3">
                <CtaLink
                  href={requestHref}
                  className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
                >
                  Request access
                </CtaLink>
                <CtaLink
                  href={contactHref}
                  className="inline-flex w-fit items-center rounded-round border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 ease-(--ease-premium) hover:bg-white/10"
                >
                  Talk to us
                </CtaLink>
              </StaggerItem>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ── The opportunity (stats) ────────────────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-page">
          <Stagger className="max-w-2xl">
            <StaggerItem as="span" className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-error-700">
              The opportunity
            </StaggerItem>
            <StaggerItem as="h2" className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
              A region underserved by imported medicine — and ready for its own.
            </StaggerItem>
          </Stagger>

          <Stagger
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-primary-500/10"
          >
            {STATS.map((s) => (
              <StaggerItem
                key={s.label}
                className="flex flex-col gap-3 bg-error-25 p-6 md:p-8"
              >
                <span className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-500 tracking-[-0.02em]">
                  {s.value}
                </span>
                <span className="text-sm md:text-base text-primary-500/70 leading-snug">
                  {s.label}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Two tracks: investors / partners ───────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-28"
      >
        <div className="mx-auto w-full max-w-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {TRACKS.map((track) => (
              <Reveal
                key={track.eyebrow}
                preset="scale"
                className="flex flex-col rounded-3xl bg-primary-500 p-7 md:p-9 lg:p-10"
              >
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-error-500">
                  {track.eyebrow}
                </span>
                <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold text-white leading-snug tracking-[-0.01em]">
                  {track.title}
                </h3>
                <p className="mt-4 text-base text-white/65 leading-relaxed">
                  {track.body}
                </p>
                <ul className="mt-7 flex flex-col gap-3">
                  {track.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-3 text-sm md:text-base text-white/85"
                    >
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-error-500" />
                      {p}
                    </li>
                  ))}
                </ul>
                <CtaLink
                  href={requestHref}
                  className="group mt-9 inline-flex w-fit items-center gap-3 text-sm font-semibold text-error-500"
                >
                  Request access
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-error-500/40 transition-colors group-hover:bg-error-500/10">
                    <Arrow className="h-4 w-4" />
                  </span>
                </CtaLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover; the BPI logo mark replaces the cursor (via the global CustomCursor, data-cursor="icon"). */}
        <GridHoverBackdrop />
        <div className="relative mx-auto w-full max-w-page">
          <Stagger className="max-w-2xl">
            <StaggerItem as="span" className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-error-500">
              How it works
            </StaggerItem>
            <StaggerItem as="h2" className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-[-0.02em]">
              From first contact to building together.
            </StaggerItem>
          </Stagger>

          <Stagger
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {STEPS.map((step, i) => (
              <StaggerItem key={step.title} className="flex flex-col gap-4">
                <span className="font-display text-2xl font-bold text-error-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-px w-full bg-white/15" />
                <h3 className="font-display text-lg md:text-xl font-bold text-white leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-white/60 leading-relaxed">
                  {step.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 lg:py-32"
      >
        <Stagger
          className="mx-auto flex w-full max-w-page flex-col items-center gap-8 text-center"
        >
          <StaggerItem as="h2" className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em] max-w-3xl">
            Ready to look at the details?
          </StaggerItem>
          <StaggerItem as="p" className="max-w-xl text-base md:text-lg text-primary-500/70 leading-relaxed">
            Request access to the investor &amp; partner portal. We review every
            request and email you a secure sign-in link once you&apos;re
            approved.
          </StaggerItem>
          <StaggerItem className="flex flex-wrap items-center justify-center gap-3">
            <CtaLink
              href={requestHref}
              className="inline-flex w-fit items-center rounded-round bg-error-500 px-7 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
            >
              Request access
            </CtaLink>
            <CtaLink
              href={contactHref}
              className="inline-flex w-fit items-center rounded-round border border-primary-500/30 px-7 py-3 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
            >
              Talk to us first
            </CtaLink>
          </StaggerItem>
        </Stagger>
      </section>
    </main>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
