import ArrowRight from "./ArrowRight";
import Button from "./Button";
import WhyShape from "./shapes/WhyShape";

type Props = {
  quote?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
};

const DEFAULT_QUOTE = `"Every piece we build, we build with the people it is for — so that the next generation does not have to wait with it's hand out."`;
const DEFAULT_BODY = `Barbados Pharmaceutical Inc. is building the pharmaceutical infrastructure Barbados and its region deserve — and proving that small states can shape the systems they depend on.`;

export default function WhyBpiSection({
  quote = DEFAULT_QUOTE,
  body = DEFAULT_BODY,
  ctaLabel = "Why BPI?",
  ctaHref = "/why-bpi",
  imageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  imageAlt = "BPI team meeting in Barbados",
}: Props) {
  return (
    <section data-nav-theme="light" className="bg-error-25 px-8 md:px-16 lg:px-28 py-10 md:py-14 lg:py-20">
      <div className="mx-auto max-w-page rounded-lg bg-error-500 px-5 md:px-8 lg:px-10 py-7 md:py-9 lg:py-11">
        <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-5 gap-5 lg:gap-8 items-center">
          <div className="md:col-span-3 flex flex-col justify-between gap-6 md:gap-8">
            <div className="flex flex-col gap-4 md:gap-5">
              <p className="font-display text-display-xs md:text-display-sm lg:text-display-md font-medium text-primary-500 leading-[1.2] tracking-[-0.02em]">
                {quote}
              </p>
              <p className="text-sm text-primary-500/70 leading-relaxed max-w-md">
                {body}
              </p>
            </div>
            <a href={ctaHref} className="inline-flex">
              <Button variant="tertiary" size="sm">
                {ctaLabel}
                <ArrowRight />
              </Button>
            </a>
          </div>

          <div data-reveal="scale" className="md:col-span-2 flex justify-end">
            <WhyShape
              size={500}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              className="w-full max-w-125 h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
