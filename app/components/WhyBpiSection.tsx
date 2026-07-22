import CtaLink from "./CtaLink";
import PortableTextBody from "./PortableTextBody";
import WhyShape from "./shapes/WhyShape";
import { Stagger, StaggerItem } from "./motion";
import type { PortableTextBlock } from "@/sanity/lib/types";

type Props = {
  quote?: PortableTextBlock[] | string | null;
  attribution?: string;
  body?: PortableTextBlock[] | string | null;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
};

const DEFAULT_QUOTE = `"Every piece we build, we build with the people it is for — so that the next generation does not have to wait with its hand out."`;
const DEFAULT_BODY = `Barbados Pharmaceuticals Inc. is building the pharmaceutical infrastructure Barbados and its region deserve — and proving that small states can shape the systems they depend on.`;

export default function WhyBpiSection({
  quote = DEFAULT_QUOTE,
  attribution,
  body = DEFAULT_BODY,
  ctaLabel = "Why BPI?",
  ctaHref = "/why-bpi",
  imageSrc,
  videoSrc,
  imageAlt = "",
}: Props) {
  return (
    <section
      data-nav-theme="light"
      className="bg-error-500 px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-32"
    >
      <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left — quote, body, CTA */}
        <StaggerItem className="flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-4">
            <PortableTextBody
              value={quote}
              compact
              paragraphClassName="font-display text-2xl md:text-3xl lg:text-display-sm font-bold text-primary-500 leading-[1.15] tracking-[-0.02em]"
            />
            {attribution ? (
              <p className="text-xs md:text-sm font-semibold tracking-[0.04em] text-primary-500/80">
                {attribution}
              </p>
            ) : null}
          </div>
          <PortableTextBody
            value={body}
            className="max-w-xl"
            paragraphClassName="text-base md:text-lg text-primary-500/85 leading-relaxed"
          />
          <div>
            <CtaLink
              href={ctaHref}
              className="inline-flex rounded-round border border-primary-500 px-5 py-2 text-sm font-semibold text-primary-500 transition hover:bg-primary-500/5"
            >
              {ctaLabel}
            </CtaLink>
          </div>
        </StaggerItem>

        {/* Right — notched image */}
        <StaggerItem preset="scale" className="relative lg:flex lg:justify-end">
          <WhyShape
            size={520}
            imageSrc={imageSrc}
            videoSrc={videoSrc}
            imageAlt={imageAlt}
            imagePosition="xMidYMin slice"
            className="w-full h-auto"
          />
        </StaggerItem>
      </Stagger>
    </section>
  );
}
