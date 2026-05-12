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
    <section data-nav-theme="light" className="bg-error-25 px-5 md:px-20 lg:px-32 py-8 md:py-14 lg:py-20">
      <div className="mx-auto max-w-page rounded-lg bg-error-500 px-5 md:px-10 lg:px-12 py-7 md:py-12 lg:py-14">
        <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch">
          <div className="flex flex-col justify-center gap-6 md:gap-12">
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="font-display text-display-xs md:text-display-md lg:text-display-lg font-medium text-primary-500 leading-[1.2] tracking-[-0.02em]">
                {quote}
              </p>
              <p className="text-sm md:text-base text-primary-500/75 leading-relaxed max-w-lg">
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

          <div data-reveal="scale" className="flex justify-end">
            <WhyShape
              size={720}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
