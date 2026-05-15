import Image from "next/image";
import LazyVideo from "./LazyVideo";

type SocialKind = "Website" | "LinkedIn" | "X" | "Instagram" | "YouTube";
type SocialLink = { kind: SocialKind; href: string; label?: string };

type Props = {
  quote?: string;
  body?: string;
  name?: string;
  title?: string;
  org?: string;
  quoteImageSrc?: string;
  quoteVideoSrc?: string;
  quoteImageAlt?: string;
  portraitImageSrc?: string;
  portraitVideoSrc?: string;
  portraitImageAlt?: string;
  socials?: SocialLink[];
};

const DEFAULT_QUOTE = `We are building the vehicle that protects our citizens and re-writes what we believe about ourselves.`;
const DEFAULT_BODY =
  "Barbados Pharmaceutical Inc. is building the gateway that connects Caribbean demand with global pharmaceutical expertise.";

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "#", label: "Website" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "#" },
];

export default function LeaderSection({
  quote = DEFAULT_QUOTE,
  body = DEFAULT_BODY,
  name = "Dr Cindi A. Lewis",
  title = "Deputy Chief Executive Officer",
  org = "Barbados Pharmaceutical Inc.",
  quoteImageSrc,
  quoteVideoSrc,
  quoteImageAlt = "",
  portraitImageSrc,
  portraitVideoSrc,
  portraitImageAlt = "",
  socials = DEFAULT_SOCIALS,
}: Props) {
  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-6 md:px-28 lg:px-52 pt-16 md:pt-32 lg:pt-44 pb-8 md:pb-16 lg:pb-20"
    >
      {/* TOP: large quote (left) + small body text (right) — no cards */}
      <div
        data-reveal-stagger
        className="mx-auto max-w-page mb-8 md:mb-14 lg:mb-16 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-y-4 gap-x-8"
      >
        <blockquote className="lg:w-[58%] font-display text-display-xs md:text-display-sm lg:text-display-md font-normal text-primary-500 leading-[1.2] tracking-tight">
          &quot;{quote}&quot;
        </blockquote>
        <p className="lg:w-[30%] text-sm md:text-base lg:text-lg text-primary-500 leading-relaxed">
          {body}
        </p>
      </div>

      {/* BOTTOM: primary image (left) + right column (yellow name card + portrait) */}
      <div
        data-reveal-stagger
        className="mx-auto max-w-page flex flex-col gap-y-4 lg:flex-row lg:gap-x-4 lg:items-stretch"
      >
        {/* Left: primary image */}
        <div
          data-reveal="scale"
          className="lg:w-[52%] relative aspect-5/4 rounded-[36px] overflow-hidden shrink-0"
        >
          <div className="absolute inset-0">
            {quoteVideoSrc ? (
              <LazyVideo
                src={quoteVideoSrc}
                poster={quoteImageSrc}
                ariaLabel={quoteImageAlt || undefined}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            ) : quoteImageSrc ? (
              <Image
                src={quoteImageSrc}
                alt={quoteImageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 90vw"
                className="object-cover"
                style={{ objectPosition: "center top" }}
              />
            ) : null}
          </div>
        </div>

        {/* Right column: yellow name card on top + portrait below */}
        <div className="lg:flex-1 flex flex-col gap-4">
          {/* Yellow name card */}
          <div
            data-reveal
            className="rounded-3xl p-4 md:p-5 lg:p-6"
            style={{ backgroundColor: "#dde885" }}
          >
            <h3 className="font-display text-sm md:text-base lg:text-lg font-bold text-primary-500 leading-tight">
              {name}
            </h3>
            <h4 className="mt-0.5 font-display text-xs md:text-sm lg:text-base font-semibold text-primary-500 leading-tight">
              {title}
            </h4>
            <p className="mt-0.5 text-[11px] md:text-xs lg:text-sm text-primary-500/75">
              {org}
            </p>
            <div className="mt-3 md:mt-4 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.kind}
                  href={s.href}
                  aria-label={s.label ?? s.kind}
                  className="inline-flex items-center justify-center size-7 rounded-full border border-dashed border-primary-500/45 text-primary-500/80 hover:border-primary-500/75 hover:text-primary-500 transition-colors"
                >
                  <SocialIcon kind={s.kind} />
                </a>
              ))}
            </div>
          </div>

          {/* Portrait — pushed to the bottom of the column and nudged
              left of the right edge for breathing room between it and
              the page margin. Treated cinematically: subtle contrast +
              de-saturation filter on the media, a slow Ken Burns drift,
              a soft top-corner glow, and a graded bottom scrim that
              reads as filmic depth without obscuring the face. */}
          <div
            data-reveal="scale"
            className="group/portrait relative w-full sm:w-[65%] aspect-square rounded-[36px] overflow-hidden lg:mt-auto lg:self-start isolate"
          >
            <div className="absolute inset-0 leader-portrait-drift">
              {portraitVideoSrc ? (
                <video
                  src={portraitVideoSrc}
                  poster={portraitImageSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disableRemotePlayback
                  disablePictureInPicture
                  aria-label={portraitImageAlt || undefined}
                  className="absolute inset-0 w-full h-full object-cover rounded-[36px]"
                />
              ) : portraitImageSrc ? (
                <Image
                  src={portraitImageSrc}
                  alt={portraitImageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover rounded-[36px]"
                />
              ) : null}
            </div>

            {/* Navy cool-cast — straight alpha overlay that nudges the
                shadows toward brand navy. `mix-blend-mode` removed
                because Safari fails to clip mix-blend children to the
                parent's border-radius; plain alpha overlays clip fine
                on every browser. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[36px] opacity-30"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 54, 0.18) 0%, rgba(8, 50, 90, 0.28) 100%)",
              }}
            />

            {/* Split-tone wash — cool teal upper-left into warm amber
                lower-right. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[36px] opacity-45"
              style={{
                background:
                  "linear-gradient(135deg, rgba(8, 112, 173, 0.55) 0%, rgba(0, 0, 54, 0) 45%, rgba(221, 232, 133, 0.45) 100%)",
              }}
            />

            {/* Top-corner light bloom — subtle directional highlight,
                reads as window light catching the subject. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[36px]"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 22% 12%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 60%)",
              }}
            />

            {/* Full-frame vignette — soft edge darkening that draws
                the eye centre without making the corners feel heavy. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[36px]"
              style={{
                background:
                  "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 30, 0.28) 100%)",
              }}
            />

            {/* Bottom scrim — graded shadow that anchors the frame
                and gives the face air. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 rounded-b-[36px] bg-linear-to-t from-black/55 via-black/15 to-transparent"
            />

            {/* Inner edge — barely-there ring that defines the frame
                without darkening the centre. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[36px] ring-1 ring-inset ring-black/18"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ kind }: { kind: SocialKind }) {
  switch (kind) {
    case "Website":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="w-4 h-4"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zM9 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9.5z" />
        </svg>
      );
    case "X":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.78-6.26L4.8 22H2l7.02-8.03L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.69L7.23 4H5.45l10.4 16z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "YouTube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.75 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
  }
}
