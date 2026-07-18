import type { Metadata } from "next";

import GridHoverBackdrop from "@/app/components/GridHoverBackdrop";
import MediaImage from "@/app/components/MediaImage";
import { Stagger, StaggerItem } from "@/app/components/motion";
import PageSections from "@/app/components/PageSections";
import { resolveMedia } from "@/sanity/lib/image";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { CONTACT_PAGE_QUERY } from "@/sanity/lib/queries";
import type {
  ContactPage,
  ContactRow as ContactRowData,
} from "@/sanity/lib/types";
import ContactForm from "./ContactForm";

// Time-based backstop only; busted on publish via the revalidate webhook.
export const revalidate = 3600;

async function getContactPage(lang: string): Promise<ContactPage | null> {
  return loadQuery<ContactPage | null>(CONTACT_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.contactPage],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  // Skip stega for metadata so SEO strings stay clean.
  const doc = await loadQuery<ContactPage | null>(CONTACT_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.contactPage],
    stega: false,
  });
  return {
    title: doc?.seoTitle ?? "Contact — BPI",
    description:
      doc?.seoDescription ??
      "Ready to partner with Barbados Pharmaceutical Inc.? Get in touch.",
  };
}

// Feature cards beneath the statement section.
const WHY_ITEMS: { title: string; body: string }[] = [
  {
    title: "Proven research expertise",
    body: "Delivering credible research that informs decisions and drives impact.",
  },
  {
    title: "Strong policy engagement",
    body: "Connecting evidence with policy makers to influence meaningful change.",
  },
  {
    title: "Accountability",
    body: "Clear reporting, accountability, and measurable performance outcomes.",
  },
  {
    title: "Multi-sector impact",
    body: "Measurable outcomes across health, education, and development.",
  },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await getContactPage(lang);

  if (!data) {
    return <EmptyState />;
  }

  const heroMedia = resolveMedia(data.heroImage, { width: 1200 });
  const formMedia = resolveMedia(data.formImage, { width: 1000 });

  return (
    <main className="relative bg-error-25 overflow-hidden">
      {/* ── Hero header — interactive grid + logo cursor, split two-tone
          headline (Partner with Us / Get in touch). ──────────────────── */}
      <section
        data-nav-theme="dark"
        data-cursor="icon"
        className="relative overflow-hidden bg-error-950 px-6 md:px-10 lg:px-14 pt-28 md:pt-32 lg:pt-24 pb-14 md:pb-20 lg:pb-12 lg:min-h-dvh lg:flex lg:flex-col"
      >
        <GridHoverBackdrop />

        <div className="relative mx-auto flex w-full max-w-page flex-col lg:flex-1 lg:min-h-0 lg:justify-center">
          {/* Accessible heading; the oversized split lines below are decorative
              duplicates so the body copy can sit between them. */}
          <h1 className="sr-only">Partner with Us — Get in touch</h1>

          <Stagger
            aria-hidden
            className="font-display text-[clamp(2.5rem,6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-error-300"
          >
            Partner with Us
          </Stagger>

          <Stagger
            as="p"
            className="mt-6 md:mt-8 max-w-xl text-base md:text-lg text-white/80 leading-relaxed"
          >
            Reach out about partnerships, investment, media, or careers.
            Wherever you are across the Caribbean and the wider world, we&apos;d
            love to hear from you and build the region&apos;s pharmaceutical
            future together.
          </Stagger>

          <Stagger
            aria-hidden
            className="mt-8 md:mt-10 lg:mt-12 font-display text-[clamp(2.5rem,6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-error-300 lg:ml-[28%]"
          >
            Get in touch
          </Stagger>

          <Stagger
            as="p"
            className="mt-12 md:mt-16 text-center text-lg md:text-xl text-white/85 leading-relaxed"
          >
            Together, we are advancing healthcare, innovation, and opportunity.
          </Stagger>
        </div>
      </section>

      {/* ── Ready to partner — heading + contact details + portrait ── */}
      <section className="px-6 md:px-10 lg:px-14 pt-16 md:pt-20 lg:pt-24 pb-6 lg:pb-8">
        <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 lg:items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-12 lg:gap-16">
            <h2 className="font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.02] tracking-[-0.01em]">
              <SplitHeading heading={data.heroHeading} />
            </h2>

            {data.contactRows?.length ? (
              <div className="flex flex-col gap-2 max-w-xl">
                {data.contactRows.map((row, idx) => (
                  <ContactInfoRow key={row.label + idx} row={row} />
                ))}
              </div>
            ) : null}
          </div>

          {heroMedia ? (
            <div className="lg:col-span-5 flex lg:justify-end">
              <div className="relative w-full lg:max-w-md aspect-4/5 overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500/5">
                <MediaImage
                  media={heroMedia}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Contact form — full-bleed green panel; image (left) + Contact Us
          heading, description, and form (right). ────────────────────── */}
      <section
        className="w-full px-6 md:px-10 lg:px-14 py-16 md:py-20 lg:py-28"
        style={{ backgroundColor: data.formBg ?? "#9BFFCD" }}
      >
        <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {formMedia ? (
            <div className="relative w-full aspect-video lg:aspect-3/2 overflow-hidden rounded-2xl lg:rounded-3xl bg-primary-500/10">
              <MediaImage
                media={formMedia}
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
          ) : null}

          <div className="flex flex-col">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1] tracking-[-0.01em]">
              {data.formHeading}
            </h2>
            <p className="mt-4 text-base text-primary-500/80 leading-relaxed max-w-md">
              {data.formDescription}
            </p>

            <ContactForm submitLabel={data.formSubmitLabel} />
          </div>
        </div>
      </section>

      {/* ── Statement + why work with us ───────────────────────────── */}
      <section
        data-nav-theme="light"
        className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-page">
          {/* Statement — eyebrow (left) + two-tone underlined headline. */}
          <Stagger
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            <StaggerItem className="lg:col-span-3">
              <span className="text-sm font-bold text-primary-500">
                For Investors
              </span>
            </StaggerItem>
            <StaggerItem className="lg:col-span-9">
              <h2 className="font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-bold leading-[1.4] tracking-[-0.02em]">
                <span className="block text-primary-500/40">
                  We partner with investors
                </span>
                <span className="text-primary-500">
                  and development stakeholders to
                  <br />
                  transform research into measurable
                  <br />
                  social and economic outcomes across
                  <br />
                  Barbados
                </span>
              </h2>
            </StaggerItem>
          </Stagger>

          {/* Why investors work with us — 4-up with vertical dividers. */}
          <Stagger className="mt-16 md:mt-20 lg:mt-24">
            <StaggerItem as="h3" className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
              Why Investors Work With Us
            </StaggerItem>
            <StaggerItem className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10">
              {WHY_ITEMS.map((item, i) => (
                <div
                  key={item.title}
                  className={`flex flex-col gap-5 lg:px-8 lg:first:pl-0 ${
                    i > 0 ? "lg:border-l lg:border-primary-500/15" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-16 w-24 rounded-md bg-error-200"
                  />
                  <div>
                    <h4 className="text-base font-bold text-primary-500">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm md:text-base text-primary-500/55 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </StaggerItem>
          </Stagger>
        </div>
      </section>
      <PageSections sections={data.pageSections} />
    </main>
  );
}

function ContactInfoRow({ row }: { row: ContactRowData }) {
  const copyText = row.copyValue ?? row.value;
  return (
    <div className="grid grid-cols-12 gap-3 items-start py-4 lg:py-5">
      <div className="col-span-12 sm:col-span-3 text-sm md:text-base font-bold text-primary-500">
        {row.label}
      </div>
      <div className="col-span-8 sm:col-span-6 text-sm md:text-base text-primary-500/90 leading-snug">
        {row.value}
      </div>
      <div className="col-span-4 sm:col-span-3">
        <CopyAction value={copyText} />
      </div>
    </div>
  );
}

function CopyAction({ value }: { value: string }) {
  return (
    <a
      href={`#copy-${encodeURIComponent(value).slice(0, 16)}`}
      data-copy-value={value}
      className="text-sm text-primary-500/70 hover:text-primary-500 transition-colors"
    >
      Copy
    </a>
  );
}

// Render the heading as two lines: everything up to the word "with" on line
// one, "with …" on line two — so "Ready to Partner with us?" becomes "Ready to
// Partner" / "With us?". Falls back to a single line if no split point is found.
function SplitHeading({ heading }: { heading?: string }) {
  if (!heading) return null;
  const match = heading.match(/^(.+?)\s+(with\b.*)$/i);
  if (!match) return <>{heading}</>;
  const line2 = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return (
    <>
      <span className="block">{match[1]}</span>
      <span className="block">{line2}</span>
    </>
  );
}

function EmptyState() {
  return (
    <main className="bg-error-25 min-h-[60vh] flex items-center justify-center px-5 md:px-20 lg:px-32 py-20">
      <div className="mx-auto max-w-page text-center">
        <h1 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
          Contact page not yet configured
        </h1>
        <p className="mt-4 text-base text-primary-500/75 max-w-xl mx-auto leading-relaxed">
          Open Sanity Studio at <code>/studio</code> and create the
          &ldquo;Contact page&rdquo; document to populate this page.
        </p>
      </div>
    </main>
  );
}
