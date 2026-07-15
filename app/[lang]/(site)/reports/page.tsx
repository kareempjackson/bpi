import type { Metadata } from "next";

import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import { Stagger, StaggerItem } from "@/app/components/motion";
import NewsletterForm from "@/app/components/NewsletterForm";
import { toLocale } from "@/app/lib/locale";
import PublicationsGrid, { type Publication } from "./PublicationsGrid";

export const metadata: Metadata = {
  title: "Reports — BPI",
  description:
    "Annual reports, impact summaries, and research from Barbados Pharmaceutical Inc. — how we're building the Caribbean's pharmaceutical infrastructure, in the open.",
};

// Placeholder publications until wired to Sanity posts. `contentType` drives the
// tab a post falls under (Publications = article/news, Research = resource,
// Reports = report); `size` drives the bento layout for the grid tabs; reports
// add `year` + `typeLabel`. Images are empty → branded placeholder.
const SHARED_EXCERPT =
  "Reports, articles, and thought leadership shaping the future of pharmaceuticals and healthcare innovation across Barbados and the wider Caribbean.";
const REPORT_EXCERPT =
  "Serving 40+ countries across the Caribbean and Latin America.";
const PUBLICATIONS: Publication[] = [
  // ── Publications (Articles / News) ──────────────────────────────────
  {
    contentType: "article",
    size: "large",
    title: "UAMSA Health Week 2025: the rumours are true",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "news",
    size: "small",
    title: "Aging like fine wine: longevity and access",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "article",
    size: "half",
    title: "Always be creative: building a culture of innovation",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "news",
    size: "half",
    title: "Hello March: a month of regional momentum",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  // ── Research (Resources) ────────────────────────────────────────────
  {
    contentType: "resource",
    size: "wide",
    title: "Empowering humans with current brands",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "resource",
    size: "large",
    title: "Learning without limits across the Caribbean",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "resource",
    size: "small",
    title: "Saying hello in every language: regional outreach",
    excerpt: SHARED_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  // ── Reports (row layout) ────────────────────────────────────────────
  {
    contentType: "report",
    year: "2025",
    typeLabel: "Annual Report",
    title: "Building the gateway: BPI 2025 Annual Report",
    excerpt: REPORT_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "report",
    year: "2025",
    typeLabel: "Annual Report",
    title: "Closing the medicine gap in the Caribbean",
    excerpt: REPORT_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "report",
    year: "2024",
    typeLabel: "Impact Summary",
    title: "Scaling regional manufacturing capacity",
    excerpt: REPORT_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "report",
    year: "2024",
    typeLabel: "Annual Report",
    title: "A year of building: BPI 2024 Annual Report",
    excerpt: REPORT_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
  {
    contentType: "report",
    year: "2023",
    typeLabel: "Research Brief",
    title: "Mapping the Caribbean pharmaceutical supply chain",
    excerpt: REPORT_EXCERPT,
    date: "May 20, 2026",
    author: "BPI Editorial",
    slug: "",
  },
];

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = toLocale(raw);

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden bg-error-950 px-6 md:px-12 lg:px-20 xl:px-28 pt-28 md:pt-32 lg:pt-24 pb-14 md:pb-20 lg:pb-12 lg:min-h-dvh lg:flex lg:flex-col"
      >
        {/* Interactive rounded-tile grid backdrop — tiles light up on hover,
            and the BPI logo mark replaces the cursor across the hero (via the
            global CustomCursor, opted in with data-cursor="icon"). */}
        <GridHoverBackdrop />

        <div className="relative mx-auto flex w-full max-w-page flex-col lg:flex-1 lg:min-h-0 lg:justify-center">
          {/* Accessible heading; the oversized split lines below are decorative
              duplicates so the body copy can sit between them. */}
          <h1 className="sr-only">Insights, Research &amp; Industry Perspectives</h1>

          <Stagger
            aria-hidden
            className="font-display text-[clamp(2.5rem,6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-error-300"
          >
            Insights, Research &amp;
          </Stagger>

          <Stagger
            as="p"
            className="mt-6 md:mt-8 max-w-xl text-base md:text-lg text-white/80 leading-relaxed"
          >
            Explore reports, articles, research publications, and thought
            leadership content shaping the future of pharmaceuticals, healthcare
            innovation, and industry development across Barbados and the wider
            Caribbean.
          </Stagger>

          <Stagger
            aria-hidden
            className="mt-8 md:mt-10 lg:mt-12 font-display text-[clamp(2.5rem,6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-error-300 lg:ml-[28%]"
          >
            Industry Perspectives
          </Stagger>

          <Stagger
            as="p"
            className="mt-12 md:mt-16 text-center text-lg md:text-xl text-white/85 leading-relaxed"
          >
            Together, we are advancing healthcare, innovation, and opportunity.
          </Stagger>
        </div>
      </section>

      {/* ── Publications grid ──────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-page">
          <PublicationsGrid lang={lang} posts={PUBLICATIONS} />
        </div>
      </section>

      {/* ── Newsletter CTA ─────────────────────────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-20 md:pb-28 lg:pb-32"
      >
        <div className="mx-auto w-full max-w-page">
          <Stagger
            className="flex flex-col items-center gap-8 rounded-3xl bg-primary-500 px-6 md:px-12 py-14 md:py-20 text-center"
          >
            <StaggerItem>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-[-0.02em]">
                Never Miss a BPI Story
              </h2>
              <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
                Stay updated about BPI news, initiatives and partnerships as it
                happens
              </p>
            </StaggerItem>
            <StaggerItem>
              <NewsletterForm
                idPrefix="reports-newsletter"
                heading={null}
                className="md:justify-center"
              />
            </StaggerItem>
          </Stagger>
        </div>
      </section>
    </main>
  );
}
