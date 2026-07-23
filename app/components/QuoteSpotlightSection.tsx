import type {
  PortableTextBlock,
  ResolvedMedia,
  SocialLink,
} from "@/sanity/lib/types";

import { localizedHref } from "@/app/lib/locale";
import CtaLink from "./CtaLink";
import MediaImage from "./MediaImage";
import PortableTextBody from "./PortableTextBody";
import SocialIcon from "./SocialIcon";
import { Stagger, StaggerItem } from "./motion";

type CtaValue = { label?: string | null; href?: string | null } | null | undefined;

type Props = {
  eyebrow?: string;
  heading?: string;
  /** Lead paragraph shown above the rule. */
  lead?: PortableTextBlock[] | string | null;
  /** Optional button shown below the lead, above the rule. */
  primaryCta?: CtaValue;
  /** Pull-quote shown below the rule (rendered italic, in quotes). */
  quote?: PortableTextBlock[] | string | null;
  /** Attribution name + role. */
  name?: string;
  role?: string;
  portrait?: ResolvedMedia | null;
  socials?: SocialLink[];
  /** Section canvas colour behind the navy card. Defaults to the pale blue. */
  bg?: string;
  /** The card colour. Defaults to a deep navy; pass the page colour to theme. */
  cardBg?: string;
  /** Locale for the CTA href (only needed when primaryCta is set). */
  lang?: string;
};

/**
 * A spotlight quote on a deep-navy card: eyebrow + heading on the left, a lead
 * paragraph, pull-quote, and attribution (portrait, name, role, socials) on the
 * right. The dark cousin of the /impact "Why This Matters" block.
 */
export default function QuoteSpotlightSection({
  eyebrow,
  heading,
  lead,
  primaryCta,
  quote,
  name,
  role,
  portrait,
  socials,
  bg = "#E7F9FF",
  cardBg = "#122A56",
  lang = "en",
}: Props) {
  return (
    <section
      data-nav-theme="light"
      style={{ backgroundColor: bg }}
      className="px-6 md:px-10 lg:px-14 pb-16 md:pb-24 lg:pb-28"
    >
      <div
        data-nav-theme="dark"
        style={{ backgroundColor: cardBg }}
        className="mx-auto max-w-page rounded-xl px-7 py-14 md:px-12 md:py-16 lg:px-16 lg:py-20"
      >
        <Stagger className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — eyebrow + heading. */}
          <StaggerItem>
            {eyebrow ? (
              <p className="text-sm font-medium tracking-[0.14em] text-white/55">
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-[-0.02em]">
                {heading}
              </h2>
            ) : null}
          </StaggerItem>

          {/* Right — lead, rule, quote, attribution. */}
          <StaggerItem className="flex flex-col">
            {lead ? (
              <PortableTextBody
                value={lead}
                paragraphClassName="whitespace-pre-line text-base md:text-lg text-white/90 leading-relaxed"
              />
            ) : null}

            {primaryCta?.label ? (
              <div className="mt-7">
                <CtaLink
                  href={localizedHref(lang, primaryCta.href)}
                  className="inline-flex items-center justify-center rounded-round bg-[#ABE8FE] px-6 py-2.5 text-sm font-semibold text-[#0B2F64] transition hover:bg-[#ABE8FE]/90"
                >
                  {primaryCta.label}
                </CtaLink>
              </div>
            ) : null}

            {quote ? (
              <>
                {lead ? (
                  <hr className="my-8 md:my-10 border-t border-white/15" />
                ) : null}
                <blockquote className="text-base md:text-lg italic text-white/65 leading-relaxed">
                  &ldquo;
                  <PortableTextBody
                    value={quote}
                    compact
                    className="inline"
                    paragraphClassName="inline"
                  />
                  &rdquo;
                </blockquote>
              </>
            ) : null}

            {name || portrait ? (
              <div className="mt-8 flex items-center gap-5">
                {portrait ? (
                  <div className="relative size-16 md:size-20 shrink-0 overflow-hidden rounded-full bg-white/5">
                    <MediaImage
                      media={portrait}
                      sizes="80px"
                      objectPositionStyle="center top"
                    />
                  </div>
                ) : null}
                <div>
                  {name ? (
                    <p className="font-display text-base md:text-lg font-bold text-white/85 leading-tight">
                      {name}
                    </p>
                  ) : null}
                  {role ? (
                    <p className="mt-1 text-sm md:text-base text-white/45">
                      {role}
                    </p>
                  ) : null}
                  {socials && socials.length > 0 ? (
                    <div className="mt-4 flex items-center gap-2.5">
                      {socials.map((s) => (
                        <a
                          key={s.kind}
                          href={s.href}
                          aria-label={s.label ?? s.kind}
                          className="inline-flex size-9 items-center justify-center rounded-full border border-dashed border-white/25 text-white/55 transition-colors hover:border-white/55 hover:text-white/85"
                        >
                          <SocialIcon kind={s.kind} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
