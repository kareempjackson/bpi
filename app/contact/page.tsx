import type { Metadata } from "next";

import Button from "../components/Button";
import BlogPostShape from "../components/shapes/BlogPostShape";
import WhyShape from "../components/shapes/WhyShape";

export const metadata: Metadata = {
  title: "Contact — BPI",
  description:
    "Ready to partner with Barbados Pharmaceutical Inc.? Get in touch.",
};

type ContactRow = {
  label: string;
  value: string;
  copyValue?: string;
};

const CONTACT_ROWS: ContactRow[] = [
  {
    label: "Partner with us",
    value: "hr_bpi@investbarbados.org",
  },
  {
    label: "Find us",
    value: "Trident Insurance Financial Centre Hastings, Christ",
  },
  {
    label: "Call us",
    value: "1-246-626-2000",
  },
  {
    label: "Email us",
    value: "adminBPI@gmai.com",
  },
];

const HERO_IMAGE = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg";
const FORM_IMAGE = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg";

const INPUT_CLASS =
  "peer w-full rounded-round border border-transparent bg-white px-6 py-4 text-base text-primary-500 placeholder-transparent outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";
const FLOATING_LABEL_CLASS =
  "pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-base text-primary-500 transition-opacity peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0";

export default function ContactPage() {
  return (
    <main className="bg-error-25">
      <section className="px-12 md:px-20 lg:px-32 pt-16 md:pt-20 lg:pt-24 pb-6 lg:pb-8">
        <div className="mx-auto max-w-page grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 lg:items-stretch">
          <div className="lg:col-span-7 flex flex-col gap-8 lg:gap-10">
            <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.05] max-w-md">
              Ready to Partner with us?
            </h1>

            <div className="flex flex-col max-w-xl lg:mt-auto">
              {CONTACT_ROWS.map((row) => (
                <ContactInfoRow key={row.label} row={row} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:h-full">
            <WhyShape
              size={600}
              imageSrc={HERO_IMAGE}
              imageAlt="BPI partner ready to collaborate"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-8 lg:pt-12 pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
          style={{ backgroundColor: "#CAF1FF" }}
        >
          <div className="lg:col-span-6 flex flex-col">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Contact Us
            </h2>
            <p className="mt-3 text-base lg:text-lg text-primary-500 leading-relaxed max-w-lg">
              Get in touch with BPI — we&rsquo;re here to answer your
              questions, support your journey, and help you connect with
              opportunities in pharmaceutical innovation and supply chain
              excellence.
            </p>

            <form
              method="post"
              action="/api/contact"
              className="mt-auto pt-10 lg:pt-12 flex flex-col gap-4 max-w-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                    aria-label="Full Name"
                    className={INPUT_CLASS}
                  />
                  <label htmlFor="" className={FLOATING_LABEL_CLASS}>
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
                  Get in touch
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-6">
            <BlogPostShape
              size={640}
              imageSrc={FORM_IMAGE}
              imageAlt="BPI team meeting with partners"
              flipX
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactInfoRow({ row }: { row: ContactRow }) {
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
