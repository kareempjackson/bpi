import type { Metadata } from "next";

import Button from "../../components/Button";
import ContactShape from "../../components/shapes/ContactShape";
import WhyShape from "../../components/shapes/WhyShape";
import { resolveMedia } from "../../../sanity/lib/image";
import { sanityFetch } from "../../../sanity/lib/live";
import { CONTACT_PAGE_QUERY } from "../../../sanity/lib/queries";
import type {
  ContactPage,
  ContactRow as ContactRowData,
} from "../../../sanity/lib/types";

async function getContactPage(): Promise<ContactPage | null> {
  const { data } = await sanityFetch({ query: CONTACT_PAGE_QUERY });
  return data as ContactPage | null;
}

export async function generateMetadata(): Promise<Metadata> {
  // Skip stega for metadata so SEO strings stay clean.
  const { data } = await sanityFetch({
    query: CONTACT_PAGE_QUERY,
    stega: false,
  });
  const doc = data as ContactPage | null;
  return {
    title: doc?.seoTitle ?? "Contact — BPI",
    description:
      doc?.seoDescription ??
      "Ready to partner with Barbados Pharmaceutical Inc.? Get in touch.",
  };
}

const INPUT_CLASS =
  "peer w-full rounded-round border border-transparent bg-white px-5 py-3 text-sm text-primary-500 placeholder-transparent outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";
const FLOATING_LABEL_CLASS =
  "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-primary-500 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0";

export default async function ContactPage() {
  const data = await getContactPage();

  if (!data) {
    return <EmptyState />;
  }

  const heroMedia = resolveMedia(data.heroImage, { width: 1200 });
  const formMedia = resolveMedia(data.formImage, { width: 1000 });
  const heroImageSrc =
    heroMedia?.kind === "image" ? heroMedia.src : heroMedia?.poster;
  const heroVideoSrc =
    heroMedia?.kind === "video" ? heroMedia.src : undefined;
  const formImageSrc =
    formMedia?.kind === "image" ? formMedia.src : formMedia?.poster;
  const formVideoSrc =
    formMedia?.kind === "video" ? formMedia.src : undefined;

  return (
    <main className="bg-error-25">
      <section className="px-12 md:px-20 lg:px-32 pt-16 md:pt-20 lg:pt-24 pb-6 lg:pb-8">
        <div className="mx-auto max-w-page grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:items-stretch">
          <div className="lg:col-span-7 flex flex-col gap-8 lg:gap-10">
            <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.02] tracking-[-0.01em]">
              <SplitHeading heading={data.heroHeading} />
            </h1>

            <div className="flex flex-col max-w-xl">
              {data.contactRows?.map((row, idx) => (
                <ContactInfoRow key={row.label + idx} row={row} />
              ))}
            </div>
          </div>

          {heroMedia ? (
            <div className="lg:col-span-5 flex lg:justify-end">
              <ContactShape
                size={600}
                imageSrc={heroImageSrc}
                videoSrc={heroVideoSrc}
                imageAlt={heroMedia.alt}
                className="w-full lg:max-w-110 h-auto"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-8 lg:pt-12 pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg p-5 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center"
          style={{ backgroundColor: data.formBg ?? "#CAF1FF" }}
        >
          <div className="lg:col-span-6 lg:order-1 lg:pl-20 flex flex-col">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              {data.formHeading}
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/85 leading-relaxed max-w-lg">
              {data.formDescription}
            </p>

            <form
              method="post"
              action="/api/contact"
              className="mt-6 lg:mt-8 flex flex-col gap-3 max-w-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                    aria-label="Full Name"
                    className={INPUT_CLASS}
                  />
                  <label className={FLOATING_LABEL_CLASS}>
                    Full Name <span className="text-[#ff5a5a]">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    name="businessName"
                    placeholder="Business Name"
                    autoComplete="organization"
                    aria-label="Business Name"
                    className={INPUT_CLASS}
                  />
                  <label className={FLOATING_LABEL_CLASS}>Business Name</label>
                </div>
                <div className="relative">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    autoComplete="tel"
                    aria-label="Phone Number"
                    className={INPUT_CLASS}
                  />
                  <label className={FLOATING_LABEL_CLASS}>Phone Number</label>
                </div>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    aria-label="Email"
                    className={INPUT_CLASS}
                  />
                  <label className={FLOATING_LABEL_CLASS}>
                    Email <span className="text-[#ff5a5a]">*</span>
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <Button variant="primary" type="submit">
                  {data.formSubmitLabel}
                </Button>
              </div>
            </form>
          </div>

          {formMedia ? (
            <div className="lg:col-span-6 lg:order-2 lg:pr-16 py-6 lg:py-8 flex justify-end">
              <WhyShape
                size={480}
                imageSrc={formImageSrc}
                videoSrc={formVideoSrc}
                imageAlt={formMedia.alt}
                imagePosition="xMidYMin slice"
                className="w-full lg:max-w-lg h-auto"
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ContactInfoRow({ row }: { row: ContactRowData }) {
  const copyText = row.copyValue ?? row.value;
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-4 lg:py-5 border-t border-primary-500/15 first:border-t-0">
      <div className="col-span-12 sm:col-span-4 text-lg lg:text-xl font-bold text-primary-500">
        {row.label}
      </div>
      <div className="col-span-9 sm:col-span-6 text-lg lg:text-xl text-primary-500 leading-snug">
        {row.value}
      </div>
      <div className="col-span-3 sm:col-span-2 flex justify-end">
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

// Render the hero heading as two lines: everything up to the word "with"
// on line one, "with …" on line two — so "Ready to Partner with us?" becomes
// "Ready to Partner" / "With us?". Falls back to a single line if no split
// point is found.
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
