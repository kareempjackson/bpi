import Logo from "./Logo";

type NavLink = { label: string; href: string };
type SocialName = "LinkedIn" | "X" | "Instagram" | "YouTube";
type SocialLink = { name: SocialName; href: string };
type Partner = { name: string; href?: string };

type NavGroup = {
  title: string;
  links: NavLink[];
};

type Props = {
  navGroups?: NavGroup[];
  legalLinks?: NavLink[];
  socialLinks?: SocialLink[];
  partners?: Partner[];
  newsletterAction?: string;
  className?: string;
};

const DEFAULT_NAV_GROUPS: NavGroup[] = [
  {
    title: "ABOUT US",
    links: [
      { label: "Why BPI", href: "/why-bpi" },
      { label: "Our Story", href: "/our-story" },
      { label: "Leadership", href: "/leadership" },
      { label: "Governance", href: "/governance" },
    ],
  },
  {
    title: "OUR WORK",
    links: [
      { label: "Market Access & Trade Development", href: "/pillars/market-access" },
      { label: "Workforce & Talent Development", href: "/pillars/workforce" },
      { label: "Research & Development", href: "/pillars/research-development" },
      { label: "Innovation & Technology", href: "/pillars/innovation-technology" },
      { label: "Regulatory Development & Policy", href: "/pillars/regulatory-policy" },
      { label: "Investment & Financing", href: "/pillars/investment-financing" },
    ],
  },
  {
    title: "CONNECT",
    links: [
      { label: "Partners", href: "/partners" },
      { label: "Investors", href: "/investors" },
      { label: "Media", href: "/media" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const DEFAULT_LEGAL: NavLink[] = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Media Assets Terms of Use", href: "/media-assets-terms" },
];

const DEFAULT_SOCIAL: SocialLink[] = [
  { name: "LinkedIn", href: "#" },
  { name: "X", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "YouTube", href: "#" },
];

const DEFAULT_PARTNERS: Partner[] = [
  { name: "Google+" },
  { name: "Microsoft" },
  { name: "MetalLB" },
  { name: "LinkedIn" },
  { name: "Instagram" },
];

function SocialIcon({ name }: { name: SocialName }) {
  switch (name) {
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zM9 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9.5z" />
        </svg>
      );
    case "X":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.78-6.26L4.8 22H2l7.02-8.03L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.69L7.23 4H5.45l10.4 16z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.75 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
  }
}

function PartnerMark({ name }: { name: string }) {
  return (
    <span className="text-sm md:text-base lg:text-lg font-semibold tracking-tight text-white/40">
      {name}
    </span>
  );
}

export default function Footer({
  navGroups = DEFAULT_NAV_GROUPS,
  legalLinks = DEFAULT_LEGAL,
  socialLinks = DEFAULT_SOCIAL,
  partners = DEFAULT_PARTNERS,
  newsletterAction,
  className,
}: Props) {
  const year = new Date().getFullYear();
  const pillField =
    "w-full rounded-round border border-dashed border-white/50 bg-white px-6 py-3.5 text-base text-primary-500 placeholder:text-gray-400 outline-none focus:border-white focus:ring-2 focus:ring-error-500/30";

  return (
    <footer
      data-nav-theme="dark"
      data-nav-bg="#155F8A"
      className={`relative text-white overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: "#155F8A" }}
    >
      {/* Animated icon watermark */}
      <div
        aria-hidden
        data-reveal="fade"
        className="pointer-events-none absolute -bottom-16 -right-10 md:-bottom-32 md:-right-24 lg:-bottom-40 lg:-right-32 z-0"
      >
        <Logo
          iconOnly
          size={420}
          className="footer-watermark text-white w-56 md:w-80 lg:w-105 h-auto"
        />
      </div>

      <div data-reveal-stagger className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-16 pb-6 md:pt-36 md:pb-10 lg:pt-44 lg:pb-12">
        {/* Newsletter row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-5 lg:gap-6">
          <a href="/" aria-label="BPI home" className="shrink-0">
            <Logo size={128} className="text-white w-24 md:w-28 lg:w-32 h-auto" />
          </a>
          <form
            action={newsletterAction}
            method="post"
            className="flex-1 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 lg:ml-8"
          >
            <span className="font-display text-xl md:text-2xl lg:text-display-xs text-white shrink-0 tracking-[-0.01em]">
              Newsletter signup
            </span>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="sr-only" htmlFor="footer-newsletter-name">Full name</label>
              <input
                id="footer-newsletter-name"
                name="fullName"
                type="text"
                placeholder="Full Name"
                autoComplete="name"
                required
                className={pillField}
              />
              <label className="sr-only" htmlFor="footer-newsletter-email">Email</label>
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                className={pillField}
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-round border border-dashed border-error-700/50 bg-error-500 px-5 py-3 text-sm md:px-6 md:py-3.5 md:text-base font-semibold text-primary-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-error-400 hover:border-error-700/80 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_-10px_rgba(0,0,54,0.5)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-500/60"
            >
              Sign up for newsletter
            </button>
          </form>
        </div>

        {/* Title block */}
        <div className="mt-10 md:mt-16 lg:mt-24">
          <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-warning-100 leading-[1.05] tracking-[-0.02em]">
            Barbados Pharmaceutical Inc.
          </h2>
          <p className="font-display text-display-xs md:text-display-sm lg:text-display-md text-warning-100/70 leading-[1.05] tracking-[-0.02em]">
            The Caribbean&rsquo;s pharmaceutical gateway.
          </p>
        </div>

        {/* Nav columns */}
        <div className="mt-10 md:mt-16 lg:mt-24 mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 md:gap-y-10 lg:gap-x-20">
          {navGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-[11px] md:text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
                {group.title}
              </h3>
              <ul className="mt-4 md:mt-5 border-t border-white/15">
                {group.links.map((link) => (
                  <li key={link.href} className="border-b border-white/15">
                    <a
                      href={link.href}
                      className="block py-3 md:py-3.5 text-sm md:text-base text-white hover:text-error-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Partners row */}
        <div className="mt-12 md:mt-20 lg:mt-28 mx-auto max-w-4xl flex flex-col items-center gap-3 md:gap-4 lg:gap-5">
          <span className="text-[11px] md:text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            Partners
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-9 md:gap-y-4 lg:gap-x-14">
            {partners.map((p) =>
              p.href ? (
                <a
                  key={p.name}
                  href={p.href}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  aria-label={p.name}
                >
                  <PartnerMark name={p.name} />
                </a>
              ) : (
                <PartnerMark key={p.name} name={p.name} />
              ),
            )}
          </div>
        </div>

        {/* Bottom legal row */}
        <div className="mt-14 md:mt-24 lg:mt-32 pt-6 md:pt-8 border-t border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs md:text-sm text-white/65">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-7">
            <span>© {year} Barbados Pharmaceutical Inc. All rights reserved.</span>
            <ul className="flex flex-wrap items-center gap-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-6 md:gap-9">
            <ul className="flex items-center gap-5 text-white">
              {socialLinks.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    aria-label={s.name}
                    className="inline-flex items-center justify-center hover:opacity-70 transition-opacity"
                  >
                    <SocialIcon name={s.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
