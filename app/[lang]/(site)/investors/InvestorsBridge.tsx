import CtaLink from "@/app/components/CtaLink";
import { Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { Cta } from "@/sanity/lib/types";

/**
 * "A Bridge to European Capital" — a dark band with a split title lockup on the
 * left (second line hung to the right, mirroring the initiative Type 2 header)
 * and the body plus button on the right.
 */
export default function InvestorsBridge({
  eyebrow,
  title,
  titleTail,
  body,
  cta,
  bg,
  lang,
}: {
  eyebrow?: string | null;
  title?: string | null;
  titleTail?: string | null;
  body?: string | null;
  cta?: Cta;
  bg?: string | null;
  lang: string;
}) {
  return (
    <section
      data-nav-theme="dark"
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-14 md:py-20 lg:py-24"
      style={{ backgroundColor: bg || "#13362A" }}
    >
      <Stagger className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left — eyebrow over the split title. */}
        <div className="flex flex-col gap-3 lg:pl-[12%]">
          {eyebrow ? (
            <StaggerItem as="p" className="text-xs md:text-sm text-white/60">
              {eyebrow}
            </StaggerItem>
          ) : null}
          {title || titleTail ? (
            <StaggerItem
              as="h2"
              className="flex flex-col font-display text-xl md:text-2xl font-bold text-white leading-[1.35] tracking-[-0.01em]"
            >
              {title ? <span>{title}</span> : null}
              {titleTail ? <span className="pl-[28%]">{titleTail}</span> : null}
            </StaggerItem>
          ) : null}
        </div>

        {/* Right — body + button. */}
        <div className="flex flex-col gap-8">
          {body ? (
            <StaggerItem
              as="p"
              className="text-xs md:text-sm text-white/75 leading-relaxed"
            >
              {body}
            </StaggerItem>
          ) : null}
          {cta?.label ? (
            <StaggerItem>
              <CtaLink
                href={localizedHref(lang, cta.href)}
                className="inline-flex w-fit items-center rounded-round bg-error-500 px-6 py-2.5 text-sm font-semibold text-primary-500 transition-colors duration-300 ease-(--ease-premium) hover:bg-error-400"
              >
                {cta.label}
              </CtaLink>
            </StaggerItem>
          ) : null}
        </div>
      </Stagger>
    </section>
  );
}
