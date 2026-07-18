import Image from "next/image";

import CtaLink from "./CtaLink";
import { Reveal, Stagger, StaggerItem } from "./motion";

type Props = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  body?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** "mint" (default) or "blue" — recolors the section + primary button. */
  tone?: "mint" | "blue";
  /** When true, adopt the priority page's gutter + max-w-page container and a
   *  continuation (top-padding-dropped) rhythm so this block lines up with the
   *  sections above it. Default keeps the standalone full-bleed styling. */
  contained?: boolean;
};

export default function CareersSection({
  eyebrow = "What We Are Building",
  heading = "Careers",
  lead = "Our approach to innovation and growth is guided by clear priorities that shape impact and direction. Built to strengthen systems, people, and long-term success.",
  body = "It was then that, in 2010, inspired by a vision, the first directional signs for natural areas appeared, marking the genesis of Floema.",
  imageSrc,
  videoSrc,
  imageAlt = "",
  primaryLabel = "View Jobs",
  primaryHref = "/careers",
  secondaryLabel = "Our initiatives",
  secondaryHref = "/initiatives",
  tone = "mint",
  contained = false,
}: Props) {
  const isBlue = tone === "blue";
  const primaryBtnClass = isBlue
    ? "rounded-round bg-primary-500 px-5 py-2 text-sm font-semibold text-white text-center transition hover:bg-primary-600"
    : "rounded-round bg-error-600 px-5 py-2 text-sm font-semibold text-white text-center transition hover:bg-error-700";
  return (
    <section
      data-nav-theme="light"
      className={`${isBlue ? "bg-[#E7F9FF]" : "bg-[#EAFBF1]"} ${
        contained
          ? "px-6 md:px-10 lg:px-14 pb-16 md:pb-24 lg:pb-28"
          : "px-6 md:px-10 lg:px-14 pt-16 md:pt-24 lg:pt-32 pb-4 lg:pb-8"
      }`}
    >
      <div className={contained ? "mx-auto max-w-page" : ""}>
      {/* Heading block */}
      <Stagger className="flex flex-col gap-3 md:gap-4">
        <StaggerItem
          as="p"
          className="text-xs md:text-sm font-semibold tracking-[0.18em] text-primary-500/70 uppercase"
        >
          {eyebrow}
        </StaggerItem>
        <StaggerItem
          as="h2"
          className="font-display text-4xl md:text-5xl lg:text-display-lg font-bold text-primary-500 leading-[1.02] tracking-[-0.02em]"
        >
          {heading}
        </StaggerItem>
      </Stagger>

      {/* Image left, copy right */}
      <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal
          preset="scale"
          className="relative aspect-4/3 overflow-hidden rounded-3xl bg-primary-500/5"
        >
          {videoSrc ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={imageSrc}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={videoSrc} />
            </video>
          ) : imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </Reveal>

        <Stagger className="flex flex-col gap-6 lg:gap-8">
          <StaggerItem
            as="h3"
            className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-[1.15] tracking-[-0.01em]"
          >
            {lead}
          </StaggerItem>
          <StaggerItem
            as="p"
            className="text-base md:text-lg text-primary-500/70 leading-relaxed max-w-xl"
          >
            {body}
          </StaggerItem>
          <StaggerItem className="flex flex-wrap gap-3 pt-2">
            <CtaLink href={primaryHref} className={primaryBtnClass}>
              {primaryLabel}
            </CtaLink>
            <CtaLink
              href={secondaryHref}
              className="rounded-round border border-primary-500 px-5 py-2 text-sm font-semibold text-primary-500 text-center transition hover:bg-primary-500/5"
            >
              {secondaryLabel}
            </CtaLink>
          </StaggerItem>
        </Stagger>
      </div>
      </div>
    </section>
  );
}
