import CtaLink from "@/app/components/CtaLink";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Stagger, StaggerItem } from "@/app/components/motion";
import { localizedHref } from "@/app/lib/locale";
import type { Cta, PortableTextBlock } from "@/sanity/lib/types";

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
  body?: PortableTextBlock[] | string | null;
  cta?: Cta;
  bg?: string | null;
  lang: string;
}) {
  return (
    <section
      data-nav-theme="dark"
      className="px-6 md:px-10 lg:px-14 py-20 md:py-28 lg:py-36"
      style={{ backgroundColor: bg || "#13362A" }}
    >
      <Stagger className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left — eyebrow over the split title. */}
        <div className="flex flex-col gap-3 lg:pl-[12%]">
          {eyebrow ? (
            <StaggerItem as="p" className="align-middle font-display text-[16px] font-normal leading-none tracking-[1px] text-white/60">
              {eyebrow}
            </StaggerItem>
          ) : null}
          {title || titleTail ? (
            <StaggerItem
              as="h2"
              className="flex flex-col align-middle font-display text-[30px] font-semibold text-white leading-none tracking-[-2.01px]"
            >
              {title ? <span>{title}</span> : null}
              {/* Second line hangs so "to" sits under the "e" of "Bridge". */}
              {titleTail ? <span className="pl-[5.5rem]">{titleTail}</span> : null}
            </StaggerItem>
          ) : null}
        </div>

        {/* Right — body + button. Shifted left as a unit so the button lines
            up with the body's left edge. */}
        <div className="flex flex-col gap-8 lg:-ml-40">
          {body ? (
            <StaggerItem className="max-w-3xl">
              <PortableTextBody
                value={body}
                paragraphClassName="align-middle font-sans text-[18px] font-normal leading-[24px] tracking-[1px] text-white/100"
              />
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
