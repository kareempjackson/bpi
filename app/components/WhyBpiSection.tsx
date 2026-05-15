import ArrowRight from "./ArrowRight";
import Button from "./Button";
import CtaLink from "./CtaLink";
import WhyShape from "./shapes/WhyShape";

type Props = {
  quote?: string;
  attribution?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
};

const DEFAULT_QUOTE = `"Perhaps the biggest game changer since we have come to office is addressing the issue of pharmaceutical equity and creating a platform for jobs, investment and earnings for a pharmaceutical industry in Barbados for the first time."`;
const DEFAULT_BODY = `BPI is the institution built to deliver on that mandate, reducing pharmaceutical import dependency and building health sovereignty across the Caribbean.`;

const DEFAULT_ATTRIBUTION = "Rt. Hon. Mia Amor Mottley, Prime Minister of Barbados";

export default function WhyBpiSection({
  quote = DEFAULT_QUOTE,
  attribution = DEFAULT_ATTRIBUTION,
  body = DEFAULT_BODY,
  ctaLabel = "Why BPI?",
  ctaHref = "/why-bpi",
  imageSrc,
  videoSrc,
  imageAlt = "",
}: Props) {
  return (
    <section data-nav-theme="light" className="bg-error-25 px-5 md:px-20 lg:px-32 py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-page rounded-lg bg-error-500 px-6 md:px-10 lg:px-14 py-7 md:py-10 lg:py-14">
        <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-8 lg:gap-12 items-center">
          <div className="md:col-span-7 flex flex-col justify-center gap-6 md:gap-8">
            <div className="flex flex-col gap-10 md:gap-12">
              <div className="flex flex-col gap-3 md:gap-4">
                <p className="font-display text-2xl md:text-display-xs lg:text-display-sm font-medium text-primary-500 leading-tight tracking-[-0.015em]">
                  {quote}
                </p>
                <p className="text-xs md:text-sm font-semibold tracking-[0.04em] text-primary-500/80">
                  {attribution}
                </p>
              </div>
              <p className="text-sm md:text-base text-primary-500/75 leading-relaxed max-w-lg">
                {body}
              </p>
            </div>
            {/* Desktop CTA — inline in the text column. On mobile this
                hides and the button re-appears as an overlay in the
                shape's top-left notch (see below). */}
            <CtaLink href={ctaHref} className="hidden md:inline-flex">
              <Button variant="tertiary" size="sm">
                {ctaLabel}
                <ArrowRight />
              </Button>
            </CtaLink>
          </div>

          <div
            data-reveal="scale"
            className="md:col-span-5 relative md:flex md:justify-end"
          >
            <WhyShape
              size={480}
              imageSrc={imageSrc}
              videoSrc={videoSrc}
              imageAlt={imageAlt}
              imagePosition="xMidYMin slice"
              className="w-full h-auto md:max-w-none"
            />
            {/* Mobile-only CTA — centered inside the notch carved out
                of the WhyShape's top-left corner. The notch geometry
                from the SVG path is ~30.5% wide × ~20% tall, so anchor
                the button at (15.25%, 10%) of the container and offset
                back by half its size to sit in the dead-centre of that
                empty area. */}
            <CtaLink
              href={ctaHref}
              className="md:hidden absolute top-[10%] left-[15.25%] -translate-x-1/2 -translate-y-1/2 inline-flex"
            >
              <Button variant="tertiary" size="sm">
                {ctaLabel}
                <ArrowRight />
              </Button>
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
