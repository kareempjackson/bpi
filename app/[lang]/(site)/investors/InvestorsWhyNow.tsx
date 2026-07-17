import CtaLink from "@/app/components/CtaLink";
import MediaImage from "@/app/components/MediaImage";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { Cta, ResolvedMedia } from "@/sanity/lib/types";

/**
 * "Why Now" — a colour band: heading left, body + two buttons right, closing on
 * a wide image. On the bright-green band the dark ink stays legible, so all
 * copy is `text-primary-500`.
 */
export default function InvestorsWhyNow({
  heading,
  body,
  primaryCta,
  secondaryCta,
  media,
  bg,
  lang,
}: {
  heading?: string | null;
  body?: string | null;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  media: ResolvedMedia | null;
  bg?: string | null;
  lang: string;
}) {
  return (
    <section
      data-nav-theme="light"
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: bg || "#06FE83" }}
    >
      <div className="mx-auto w-full max-w-page">
        <Stagger className="grid grid-cols-1 lg:grid-cols-[0.3fr_0.7fr] gap-8 lg:gap-16 items-start">
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}

          <div className="flex flex-col gap-8">
            {body ? (
              <StaggerItem
                as="p"
                className="text-sm md:text-base text-primary-500/85 leading-relaxed"
              >
                {body}
              </StaggerItem>
            ) : null}
            {primaryCta?.label || secondaryCta?.label ? (
              <StaggerItem className="flex flex-wrap items-center gap-3">
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
                    className="inline-flex items-center rounded-round border border-primary-500/40 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-primary-500/5"
                  >
                    {secondaryCta.label}
                  </CtaLink>
                ) : null}
              </StaggerItem>
            ) : null}
          </div>
        </Stagger>

        {media ? (
          <Reveal
            preset="scale"
            className="relative mt-12 md:mt-16 w-full aspect-4/3 sm:aspect-video lg:aspect-21/9 overflow-hidden rounded-2xl bg-primary-500/10"
          >
            <MediaImage media={media} sizes="100vw" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
