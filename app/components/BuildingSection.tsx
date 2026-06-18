import Image from "next/image";

import CtaLink from "./CtaLink";

type ImageTile = { src?: string; alt?: string };

type Props = {
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Up to three portrait images shown on the right. Falls back to
   *  `imageSrc` repeated when fewer are supplied. */
  images?: ImageTile[];
  /** Single headline. Falls back to the two legacy headline lines. */
  heading?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** "green" (default) or "blue" — recolors the section + inner panel. */
  tone?: "green" | "blue";
};

export default function BuildingSection({
  imageSrc,
  videoSrc,
  imageAlt = "",
  images,
  heading,
  headlineLine1,
  headlineLine2,
  body = "Deliberately. Piece by piece. With the people it is for. If you are a partner, investor, or government we would like to build with you.",
  primaryLabel = "Get in touch",
  primaryHref = "/contact",
  secondaryLabel = "Our initiatives",
  secondaryHref = "/initiatives",
  tone = "green",
}: Props) {
  const isBlue = tone === "blue";
  const title =
    heading ||
    [headlineLine1, headlineLine2].filter(Boolean).join(" ") ||
    "Building the architecture of care.";

  // Build exactly three image tiles, repeating whatever source(s) we have
  // so the 3-up grid is always filled even when Sanity only supplies one
  // image. Wire `images` to a gallery field for three distinct photos.
  const base: ImageTile[] =
    images && images.length
      ? images
      : imageSrc
        ? [{ src: imageSrc, alt: imageAlt }]
        : [];
  const tiles: ImageTile[] = [0, 1, 2].map((i) =>
    base.length ? base[i % base.length] : { src: undefined, alt: "" }
  );

  return (
    <section data-nav-theme="light" className={`${isBlue ? "bg-[#E7F9FF]" : "bg-[#EAFBF1]"} px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28 pt-12 md:pt-20 lg:pt-28 pb-12 md:pb-20 lg:pb-28`}>
      <div className={`${isBlue ? "bg-warning-25" : "bg-error-500"} rounded-2xl md:rounded-3xl overflow-hidden px-6 md:px-12 lg:px-16 pt-10 md:pt-14 lg:pt-20 pb-8 md:pb-10 lg:pb-14`}>
        <div className="flex flex-col gap-12 md:gap-16 lg:gap-24">
          {/* Top: copy on the left, three images on the right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left — heading, body, CTAs */}
            <div data-reveal-stagger className="flex flex-col gap-6 lg:gap-8 lg:max-w-xl">
              <h2 className="font-display text-3xl md:text-4xl lg:text-display-lg font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
                {title}
              </h2>
              <p className="text-base md:text-lg text-primary-500/80 leading-relaxed max-w-md">
                {body}
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaLink
                  href={primaryHref}
                  className="rounded-round bg-primary-500 px-5 py-2 text-sm font-semibold text-white text-center transition hover:bg-primary-600"
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

            {/* Right — a single video, or three portrait tiles (wider L→R) */}
            {videoSrc ? (
              <div
                data-reveal="scale"
                className="relative h-72 md:h-96 lg:h-112 overflow-hidden rounded-2xl bg-primary-500/5"
              >
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
              </div>
            ) : (
              <div
                data-reveal="scale"
                className="grid grid-cols-[0.7fr_1fr_1.4fr] gap-3 md:gap-4 h-72 md:h-96 lg:h-112"
              >
                {tiles.map((tile, i) => (
                  <div
                    key={i}
                    className="relative h-full overflow-hidden rounded-2xl bg-primary-500/5"
                  >
                    {tile.src ? (
                      <Image
                        src={tile.src}
                        alt={tile.alt ?? ""}
                        fill
                        sizes="(min-width: 768px) 22vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
