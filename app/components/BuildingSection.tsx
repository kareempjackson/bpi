import CtaLink from "./CtaLink";
import FooterImageShape from "./shapes/FooterImageShape";

type Props = {
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export default function BuildingSection({
  imageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  videoSrc,
  imageAlt = "Barbados Pharmaceutical team",
  headlineLine1 = "The gateway is open.",
  headlineLine2 = "Ready to build with us?",
  primaryLabel = "Get in touch",
  primaryHref = "/contact",
  secondaryLabel = "Our initiatives",
  secondaryHref = "/initiatives",
}: Props) {
  return (
    <section data-nav-theme="light" className="pt-3 lg:pt-4">
      <div className="rounded-t-4xl md:rounded-t-[3rem] lg:rounded-t-[5rem] bg-error-200 overflow-hidden px-4 md:px-6 lg:px-10 pt-10 md:pt-16 lg:pt-20 pb-10 md:pb-16 lg:pb-20">
        {/* Mobile / tablet layout */}
        <div className="lg:hidden mx-auto max-w-2xl flex flex-col gap-6 md:gap-8">
          <div data-reveal="scale">
            <FooterImageShape
              size={1245}
              imageSrc={imageSrc}
              videoSrc={videoSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>

          <div data-reveal-stagger className="flex flex-col gap-3">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-[1.1]">
              <span className="block">{headlineLine1}</span>
              <span className="block">{headlineLine2}</span>
            </h2>
          </div>

          <div
            data-reveal-stagger
            className="flex flex-col sm:flex-row gap-2.5 sm:gap-3"
          >
            <CtaLink
              href={primaryHref}
              className="flex-1 rounded-round border border-dashed border-primary-500/40 bg-error-500 px-6 py-3 text-sm md:text-base font-semibold text-primary-500 text-center transition hover:bg-error-400"
            >
              {primaryLabel}
            </CtaLink>
            <CtaLink
              href={secondaryHref}
              className="flex-1 rounded-round border border-dashed border-primary-500/40 bg-transparent px-6 py-3 text-sm md:text-base font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              {secondaryLabel}
            </CtaLink>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block relative mx-auto max-w-350">
          <div data-reveal="scale">
            <FooterImageShape
              size={1245}
              imageSrc={imageSrc}
              videoSrc={videoSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>

          <div
            data-reveal-stagger
            className="absolute right-[4%] top-[46%] -translate-y-1/2 w-[42%]"
          >
            <h2 className="font-display text-2xl lg:text-4xl font-bold text-primary-500 leading-[1.05]">
              <span className="block">{headlineLine1}</span>
              <span className="block">{headlineLine2}</span>
            </h2>
          </div>

          <div
            data-reveal-stagger
            className="absolute left-[1.5%] bottom-0 flex flex-col items-stretch gap-2.5 lg:gap-3 w-[18%] min-w-56"
          >
            <CtaLink
              href={primaryHref}
              className="rounded-round border border-dashed border-primary-500/40 bg-error-500 px-6 lg:px-8 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 text-center transition hover:bg-error-400"
            >
              {primaryLabel}
            </CtaLink>
            <CtaLink
              href={secondaryHref}
              className="rounded-round border border-dashed border-primary-500/40 bg-transparent px-6 lg:px-8 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              {secondaryLabel}
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
