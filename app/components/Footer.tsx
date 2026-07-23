import CtaLink from "./CtaLink";
import FooterWatermark from "./FooterWatermark";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { Stagger, StaggerItem } from "./motion";

type NavLink = { label: string; href: string };
type SocialName = "LinkedIn" | "X" | "Instagram" | "YouTube";
type SocialLink = { name: SocialName; href: string };
type Partner = {
  name: string;
  /** URL of the partner logo image (PNG/SVG with transparent bg recommended). */
  logoSrc?: string;
  href?: string;
};

type NavGroup = {
  title: string;
  links: NavLink[];
};

type Props = {
  navGroups?: NavGroup[];
  legalLinks?: NavLink[];
  socialLinks?: SocialLink[];
  partners?: Partner[];
  /** Toggle the partner marquee on/off. Defaults to true. */
  showPartners?: boolean;
  /** Localized tagline under the brand name. */
  tagline?: string;
  /** Localized "All rights reserved." line in the bottom legal row. */
  rightsLabel?: string;
  /** Localized "Partners" marquee label. */
  partnersLabel?: string;
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
      { label: "Dignity", href: "/dignity" },
      { label: "Sovereignty", href: "/sovereignty" },
      { label: "Alliance", href: "/alliance" },
      { label: "Initiatives", href: "/initiatives" },
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

// Mirrors the modal menu — only LinkedIn and Instagram are live for BPI
// right now. Sanity siteSettings.menuSocialLinks overrides these defaults.
const DEFAULT_SOCIAL: SocialLink[] = [
  { name: "LinkedIn", href: "#" },
  { name: "X", href: "#" },
  { name: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
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
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zM9 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9.5z" />
        </svg>
      );
    case "X":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.78-6.26L4.8 22H2l7.02-8.03L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.69L7.23 4H5.45l10.4 16z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.75 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
  }
}

function PartnerMark({ partner }: { partner: Partner }) {
  // Image partners — uploaded via Sanity. We pin a consistent HEIGHT and
  // let WIDTH adapt to each logo's natural aspect ratio, so a wide
  // wordmark renders wider than a square icon while both share the same
  // baseline. `brightness-0 invert opacity-70` tints any source colour
  // to white over the dark footer so brand logos read uniformly.
  if (partner.logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.logoSrc}
        alt={partner.name}
        className="shrink-0 h-9 md:h-10 lg:h-11 w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
      />
    );
  }
  // Text fallback for the hardcoded defaults that have no upload.
  return (
    <span className="shrink-0 whitespace-nowrap text-sm md:text-base lg:text-lg font-semibold tracking-tight text-white/40">
      {partner.name}
    </span>
  );
}

export default function Footer({
  navGroups = DEFAULT_NAV_GROUPS,
  legalLinks = DEFAULT_LEGAL,
  socialLinks = DEFAULT_SOCIAL,
  partners = DEFAULT_PARTNERS,
  showPartners = false,
  tagline = "Building the architecture of care.",
  rightsLabel = "All rights reserved.",
  partnersLabel = "Partners",
  className,
}: Props) {
  // Sanity returns `null` (not `undefined`) for unset fields, and default
  // parameters only apply to `undefined` — so coalesce null → defaults here
  // to keep the `.map` calls below safe when the CMS fields are empty.
  navGroups = navGroups ?? DEFAULT_NAV_GROUPS;
  legalLinks = legalLinks ?? DEFAULT_LEGAL;
  socialLinks = socialLinks ?? DEFAULT_SOCIAL;
  partners = partners ?? DEFAULT_PARTNERS;
  tagline = tagline ?? "Building the architecture of care.";

  const year = new Date().getFullYear();

  // The marquee duplicates the list to make the loop seamless. If the
  // editor only uploaded one or two logos, that 2× duplicate looks like
  // a tiny ping-pong. Repeat the source array enough times that each
  // half of the loop is at least 8 items wide; the visible viewport
  // never shows the "wrap" point as a result.
  const minPerHalf = 8;
  const repeats = Math.max(
    1,
    Math.ceil(minPerHalf / Math.max(partners.length, 1)),
  );
  const partnerSeq = Array.from({ length: repeats }, () => partners).flat();
  const loopedPartners = [...partnerSeq, ...partnerSeq];

  return (
    <footer
      data-nav-theme="dark"
      className={`relative text-white overflow-hidden ${className ?? ""}`}
      // Defaults to the brand teal; a page can override it by setting the
      // `--footer-bg` custom property (e.g. the initiative detail page recolors
      // the footer to match its chosen page colour).
      style={{ backgroundColor: "var(--footer-bg, #042D2B)" }}
    >
      {/* Animated icon watermark — replays its "construction" build each
          time the footer scrolls into view (see FooterWatermark). */}
      <FooterWatermark />

      {/* Newsletter row — spans the full footer width with just a
          gutter, so the logo sits flush to the left edge and the form
          stretches across the entire row, matching the reference. */}
      <Stagger className="relative z-10 px-6 md:px-10 lg:px-14 pt-12 sm:pt-16 md:pt-36 lg:pt-44">
        <StaggerItem className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <span aria-label="BPI" className="shrink-0">
            <Logo
              size={220}
              className="text-white w-36 sm:w-44 md:w-52 lg:w-56 h-auto"
            />
          </span>
          <NewsletterForm />
        </StaggerItem>
      </Stagger>

      {/* Centered content — title, columns, partners — stays capped at
          the 7xl page width so it sits in a comfortable reading band. */}
      <div className="relative z-10 px-6 md:px-10 lg:px-14 pb-12 md:pb-20 lg:pb-28">
        {/* Title on the left, nav columns on the right — they sit side
            by side from the lg breakpoint and stack on smaller screens. */}
        <div className="mt-16 md:mt-28 lg:mt-40 flex flex-col lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          {/* Title block */}
          <div className="lg:flex-[1.15] lg:min-w-0">
            <h2
              className="font-display text-display-md md:text-display-xl lg:text-display-2xl font-bold leading-[1.02] tracking-[-0.02em]"
              style={{ color: "var(--brand-accent, #38fe9c)" }}
            >
              Barbados <br /> Pharmaceutical Inc.
            </h2>
            <p
              className="font-display text-display-md md:text-display-xl lg:text-display-2xl leading-[1.02] tracking-[-0.02em]"
              style={{ color: "var(--brand-accent, #38fe9c)", opacity: 0.65 }}
            >
              {tagline}
            </p>
          </div>

          {/* Nav columns */}
          <div className="mt-12 lg:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8 md:gap-y-10 lg:gap-x-12 lg:flex-1">
            {navGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="text-xs md:text-sm font-bold tracking-[0.18em] text-white uppercase">
                  {group.title}
                </h3>
                <ul className="mt-4 md:mt-5 border-t border-white/15">
                  {(group.links ?? []).map((link) => (
                    <li key={link.href} className="border-b border-white/15">
                      <CtaLink
                        href={link.href}
                        className="block py-3 md:py-3.5 font-display font-light text-[14.65px] leading-[22.69px] tracking-normal align-middle text-white transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </CtaLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Partners row — label on the left, infinite marquee on the
            right. The marquee track contains the partner list twice
            and translates -50 % over a linear 28 s loop, so the second
            copy seamlessly replaces the first. Edges are softly faded
            with a gradient mask so partners appear/disappear smoothly.
            The whole row is hidden when `showPartners` is false or no
            partners are present. */}
        {showPartners && partners.length > 0 ? (
          <div className="mt-12 md:mt-20 lg:mt-28 flex flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10">
            <span className="shrink-0 text-[11px] md:text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
              {partnersLabel}
            </span>
            <div
              className="relative overflow-hidden flex-1 max-w-3xl"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
              }}
            >
              <div
                className="flex w-max items-center gap-x-6 md:gap-x-10 lg:gap-x-14 motion-reduce:animate-none"
                style={{
                  animation: "partners-marquee 28s linear infinite",
                }}
              >
                {loopedPartners.map((p, idx) => (
                  // Partner logos render as non-clickable marks while the
                  // site is under construction.
                  <PartnerMark key={`${p.name}-${idx}`} partner={p} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom legal row — sits outside the inner max-w-7xl wrapper so
          it spans the full footer width edge-to-edge (just a small
          horizontal gutter), separating the legal/social strip
          visually from the centred content above. */}
      <div className="relative z-10 px-6 md:px-10 lg:px-14 pb-12 md:pb-16 lg:pb-20">
        <div className="mt-16 md:mt-24 lg:mt-32 pt-6 md:pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between font-display font-normal text-[11.1px] leading-[15.6px] tracking-normal align-middle text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-7">
            <span>
              © {year} Barbados Pharmaceutical Inc. {rightsLabel}
            </span>
            <ul className="flex flex-wrap items-center gap-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <CtaLink
                    href={link.href}
                    className="transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </CtaLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:gap-9">
            <ul className="flex items-center gap-5 text-white/60">
              {socialLinks.map((s) => {
                // Skip empty / placeholder hrefs — nothing to click.
                const hasHref = !!s.href && s.href !== "#";
                const external = hasHref && /^https?:/i.test(s.href);
                if (!hasHref) {
                  return (
                    <li key={s.name}>
                      <span
                        aria-label={s.name}
                        className="inline-flex items-center justify-center cursor-default select-none"
                      >
                        <SocialIcon name={s.name} />
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      aria-label={s.name}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center justify-center transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      <SocialIcon name={s.name} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <span>
              © {year} Barbados Pharmaceutical Inc. {rightsLabel}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
