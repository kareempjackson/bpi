import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { Cta, InvestorRole, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Go Deeper" + "Timeline" — one section carrying two blocks that share the
 * same pair of buttons. Go deeper pairs copy with an image; the timeline sets a
 * heading against a bulleted list of engagement steps (name — description).
 */
export default function InvestorsGoDeeper({
  heading,
  body,
  media,
  timelineHeading,
  steps,
  primaryCta,
  secondaryCta,
  lang,
}: {
  heading?: string | null;
  body?: string | null;
  media: ResolvedMedia | null;
  timelineHeading?: string | null;
  steps?: InvestorRole[] | null;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  lang: string;
}) {
  const buttons =
    primaryCta?.label || secondaryCta?.label ? (
      <div className="flex flex-wrap items-center gap-3">
        {primaryCta?.label ? (
          <CtaLink
            href={localizedHref(lang, primaryCta.href)}
            className="inline-flex items-center rounded-round bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-opacity duration-300 ease-(--ease-premium) hover:opacity-90"
          >
            {primaryCta.label}
          </CtaLink>
        ) : null}
        {secondaryCta?.label ? (
          <CtaLink
            href={localizedHref(lang, secondaryCta.href)}
            className="inline-flex items-center rounded-round border border-primary-500/30 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
          >
            {secondaryCta.label}
          </CtaLink>
        ) : null}
      </div>
    ) : null;

  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-page">
        {/* Go deeper — copy + buttons left, image right. */}
        <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="flex flex-col gap-8">
            {heading ? (
              <StaggerItem
                as="h2"
                className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
              >
                {heading}
              </StaggerItem>
            ) : null}
            {body ? (
              <StaggerItem
                as="p"
                className="max-w-md text-sm md:text-base text-primary-500/75 leading-relaxed"
              >
                {body}
              </StaggerItem>
            ) : null}
            {buttons ? <StaggerItem>{buttons}</StaggerItem> : null}
          </div>

          {media ? (
            <StaggerItem
              preset="scale"
              className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-primary-500/5"
            >
              <MediaImage media={media} sizes="(min-width: 1024px) 50vw, 100vw" />
            </StaggerItem>
          ) : null}
        </Stagger>

        {/* Timeline — heading left, numbered steps right, buttons repeated. */}
        {timelineHeading || steps?.length ? (
          <div className="mt-20 md:mt-28 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {timelineHeading ? (
              <Reveal
                as="h2"
                className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em] lg:pl-[14%]"
              >
                {timelineHeading}
              </Reveal>
            ) : null}

            <div className="flex flex-col gap-10">
              {steps?.length ? (
                <Stagger as="ul" className="flex flex-col gap-6">
                  {steps.map((step, i) => (
                    <StaggerItem
                      as="li"
                      key={`${step.label ?? "step"}-${i}`}
                      className="flex gap-3 text-sm md:text-base text-primary-500/75 leading-relaxed"
                    >
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                      <span>
                        <span className="font-bold text-primary-500">
                          {step.label}
                        </span>
                        {step.description ? ` — ${step.description}` : null}
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
              {buttons ? <Reveal>{buttons}</Reveal> : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
