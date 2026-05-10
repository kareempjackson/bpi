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
      <div className="rounded-t-[3rem] lg:rounded-t-[5rem] bg-error-200 overflow-hidden px-4 md:px-6 lg:px-10 pt-10 md:pt-16 lg:pt-20 pb-10 md:pb-16 lg:pb-20">
        <div data-reveal-stagger className="relative mx-auto max-w-350">
          <FooterImageShape
            size={1245}
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            className="w-full h-auto"
          />

          {/* Headline + intro in the right-side negative space */}
          <div className="absolute right-[4%] top-[39%] w-[42%]">
            <h2 className="font-display text-base md:text-2xl lg:text-4xl font-bold text-primary-500 leading-[1.05]">
              Building the architecture of care.
            </h2>
            <p className="mt-2 lg:mt-3 text-[10px] md:text-xs lg:text-sm text-primary-500 leading-relaxed max-w-md">
              Deliberately. Piece by piece. With the people it is for. If you
              are a partner, investor, or government — we would like to build
              with you.
            </p>
          </div>

          {/* CTA buttons in the bottom-left cutout */}
          <div className="absolute left-[1.5%] bottom-0 flex flex-col items-stretch gap-2.5 lg:gap-3 w-[18%] min-w-56">
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
