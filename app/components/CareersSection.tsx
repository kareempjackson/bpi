import CtaLink from "./CtaLink";

type Props = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  body?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export default function CareersSection({
  eyebrow = "What We Are Building",
  heading = "Careers",
  lead = "Our approach to innovation and growth is guided by clear priorities that shape impact and direction. Built to strengthen systems, people, and long-term success.",
  body = "It was then that, in 2010, inspired by a vision, the first directional signs for natural areas appeared, marking the genesis of Floema.",
  imageSrc,
  imageAlt = "",
  primaryLabel = "View Jobs",
  primaryHref = "/careers",
  secondaryLabel = "Our initiatives",
  secondaryHref = "/initiatives",
}: Props) {
  return (
    <section
      data-nav-theme="light"
      className="bg-[#EAFBF1] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28 pt-16 md:pt-24 lg:pt-32 pb-4 lg:pb-8"
    >
      {/* Heading block */}
      <div data-reveal-stagger className="flex flex-col gap-3 md:gap-4">
        <p className="text-xs md:text-sm font-semibold tracking-[0.18em] text-primary-500/70 uppercase">
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-display-lg font-bold text-primary-500 leading-[1.02] tracking-[-0.02em]">
          {heading}
        </h2>
      </div>

      {/* Image left, copy right */}
      <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div
          data-reveal="scale"
          className="relative aspect-4/3 overflow-hidden rounded-3xl bg-primary-500/5"
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div data-reveal-stagger className="flex flex-col gap-6 lg:gap-8">
          <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-[1.15] tracking-[-0.01em]">
            {lead}
          </h3>
          <p className="text-base md:text-lg text-primary-500/70 leading-relaxed max-w-xl">
            {body}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <CtaLink
              href={primaryHref}
              className="rounded-round bg-error-600 px-5 py-2 text-sm font-semibold text-white text-center transition hover:bg-error-700"
            >
              {primaryLabel}
            </CtaLink>
            <CtaLink
              href={secondaryHref}
              className="rounded-round border border-primary-500 px-5 py-2 text-sm font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              {secondaryLabel}
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
