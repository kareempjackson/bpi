import type { Metadata } from "next";

import Button from "../components/Button";
import Logo from "../components/Logo";
import MenuLauncher from "../components/MenuLauncher";
import BlogPostShape from "../components/shapes/BlogPostShape";
import WhyShape from "../components/shapes/WhyShape";

export const metadata: Metadata = {
  title: "Contact — BPI",
  description:
    "Ready to partner with Barbados Pharmaceutical Inc.? Get in touch.",
};

const NAV_LINKS = [
  { label: "ECOSYSTEM", href: "/#ecosystem" },
  { label: "ABOUT", href: "/#about" },
  { label: "INITIATIVE", href: "/#initiative" },
];

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
  "w-full rounded-round border border-gray-200 bg-white px-5 py-3 text-sm text-primary-500 placeholder:text-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";

export default function ContactPage() {
  return (
    <main className="bg-error-25">
      <header className="relative px-8 lg:px-12 pt-6 lg:pt-8">
        <a href="/" aria-label="BPI home" className="inline-block">
          <Logo size={140} className="text-primary-500" />
        </a>
        <div className="absolute top-4 right-6 lg:top-6 lg:right-8 flex items-center gap-7 lg:gap-9">
          <nav data-hide-on-menu className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold tracking-[0.08em] text-primary-500">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <MenuLauncher size={95} />
        </div>
      </header>

      <section className="px-16 md:px-32 lg:px-56 pt-16 md:pt-20 lg:pt-24 pb-6 lg:pb-8">
        <div className="mx-auto max-w-page grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col gap-8 lg:gap-10">
            <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.05] max-w-md">
              Ready to Partner with us?
            </h1>

            <div className="flex flex-col max-w-xl">
              {CONTACT_ROWS.map((row) => (
                <ContactInfoRow key={row.label} row={row} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <WhyShape
              size={280}
              imageSrc={HERO_IMAGE}
              imageAlt="BPI partner ready to collaborate"
              className="w-full max-w-70 h-auto"
            />
          </div>
        </div>
      </section>

      <section className="px-16 md:px-32 lg:px-56 pt-8 lg:pt-12 pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg p-8 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
          style={{ backgroundColor: "#cee2ef" }}
        >
          <div className="lg:col-span-7">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Contact Us
            </h2>
            <p className="mt-3 text-sm lg:text-md text-primary-500 leading-relaxed max-w-md">
              Get in touch with BPI — we&apos;re here to answer your
              questions, support your journey, and help you connect with
              opportunities in pharmaceutical innovation and supply chain
              excellence.
            </p>

            <form
              method="post"
              action="/api/contact"
              className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl"
            >
              <input
                name="fullName"
                placeholder="Full Name *"
                autoComplete="name"
                required
                aria-label="Full Name"
                className={INPUT_CLASS}
              />
              <input
                name="businessName"
                placeholder="Business Name"
                autoComplete="organization"
                aria-label="Business Name"
                className={INPUT_CLASS}
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                autoComplete="tel"
                aria-label="Phone Number"
                className={INPUT_CLASS}
              />
              <input
                name="email"
                type="email"
                placeholder="Email *"
                autoComplete="email"
                required
                aria-label="Email"
                className={INPUT_CLASS}
              />
              <div className="sm:col-span-2 mt-3">
                <Button variant="primary" type="submit">
                  Get in touch
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <BlogPostShape
              size={260}
              imageSrc={FORM_IMAGE}
              imageAlt="BPI team meeting with partners"
              flipX
              className="w-full max-w-65 h-auto"
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
    <div className="grid grid-cols-12 gap-3 items-center py-3 lg:py-4 border-t border-primary-500/15 first:border-t-0">
      <div className="col-span-12 sm:col-span-4 text-sm font-bold text-primary-500">
        {row.label}
      </div>
      <div className="col-span-9 sm:col-span-6 text-sm text-primary-500 leading-snug">
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
