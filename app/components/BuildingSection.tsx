import FooterImageShape from "./shapes/FooterImageShape";

type Props = {
  imageSrc?: string;
  imageAlt?: string;
  primaryHref?: string;
  secondaryHref?: string;
};

export default function BuildingSection({
  imageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  imageAlt = "Barbados Pharmaceutical team",
  primaryHref = "/contact",
  secondaryHref = "/initiatives",
}: Props) {
  return (
    <section data-nav-theme="light" className="pt-3 lg:pt-4">
      <div className="rounded-t-4xl md:rounded-t-[3rem] lg:rounded-t-[5rem] bg-error-200 overflow-hidden px-4 md:px-6 lg:px-10 pt-10 md:pt-16 lg:pt-20 pb-10 md:pb-16 lg:pb-20">
        {/* Mobile / tablet layout — stacked, with the notched FooterImageShape kept intact */}
        <div className="lg:hidden mx-auto max-w-2xl flex flex-col gap-6 md:gap-8">
          <div data-reveal="scale">
            <FooterImageShape
              size={1245}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>

          <div data-reveal-stagger className="flex flex-col gap-3">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-[1.1]">
              <span className="block">The gateway is open.</span>
              <span className="block">Ready to build with us?</span>
            </h2>
          </div>

          <div data-reveal-stagger className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href={primaryHref}
              className="flex-1 rounded-round border border-dashed border-primary-500/40 bg-error-500 px-6 py-3 text-sm md:text-base font-semibold text-primary-500 text-center transition hover:bg-error-400"
            >
              Get in touch
            </a>
            <a
              href={secondaryHref}
              className="flex-1 rounded-round border border-dashed border-primary-500/40 bg-transparent px-6 py-3 text-sm md:text-base font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              Our initiatives
            </a>
          </div>
        </div>

        {/* Desktop layout — original notched shape with absolute overlays */}
        <div className="hidden lg:block relative mx-auto max-w-350">
          <div data-reveal="scale">
            <FooterImageShape
              size={1245}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              className="w-full h-auto"
            />
          </div>

          {/* Headline in the right-side negative space — nudged just above center */}
          <div
            data-reveal-stagger
            className="absolute right-[4%] top-[46%] -translate-y-1/2 w-[42%]"
          >
            <h2 className="font-display text-2xl lg:text-4xl font-bold text-primary-500 leading-[1.05]">
              <span className="block">The gateway is open.</span>
              <span className="block">Ready to build with us?</span>
            </h2>
          </div>

          {/* CTA buttons in the bottom-left cutout */}
          <div
            data-reveal-stagger
            className="absolute left-[1.5%] bottom-0 flex flex-col items-stretch gap-2.5 lg:gap-3 w-[18%] min-w-56"
          >
            <a
              href={primaryHref}
              className="rounded-round border border-dashed border-primary-500/40 bg-error-500 px-6 lg:px-8 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 text-center transition hover:bg-error-400"
            >
              Get in touch
            </a>
            <a
              href={secondaryHref}
              className="rounded-round border border-dashed border-primary-500/40 bg-transparent px-6 lg:px-8 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              Our initiatives
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
