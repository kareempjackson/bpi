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

const DEFAULT_HEADLINE =
  "Barbados Pharmaceuticals Inc. is building the pharmaceutical infrastructure Barbados and its region deserve and proving that small states can shape the systems they depend on.";
const DEFAULT_QUOTE = `We are positioning Barbados as the anchor of regional health security, actively producing what is needed, when it is needed.`;

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "#", label: "Website" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
];

export default function LeaderSection({
  quote = DEFAULT_QUOTE,
  body = DEFAULT_HEADLINE,
  name = "[Name], [Title]",
  title,
  org = "Barbados Pharmaceuticals Inc.",
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
      className="bg-error-25 px-5 md:px-20 lg:px-32 pt-16 md:pt-28 lg:pt-36 pb-16 md:pb-24 lg:pb-28"
    >
      {/* Top: bold lead-in headline */}
      <div
        data-reveal
        className="mx-auto max-w-page mb-10 md:mb-16 lg:mb-20"
      >
        <h2 className="lg:w-[88%] font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-primary-500 leading-[1.15] tracking-tight">
          {body}
        </h2>
      </div>

      {/* Bottom: primary image (left) + quote & attribution (right) */}
      <div
        data-reveal-stagger
        className="mx-auto max-w-page flex flex-col gap-y-10 lg:flex-row lg:gap-x-16 lg:items-center"
      >
        {/* Left: primary video */}
        <div
          data-reveal="scale"
          className="lg:w-[56%] relative aspect-5/4 rounded-2xl overflow-hidden shrink-0"
        >
          <div className="absolute inset-0">
            {portraitVideoSrc ? (
              <LazyVideo
                src={portraitVideoSrc}
                poster={portraitImageSrc}
                ariaLabel={portraitImageAlt || undefined}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            ) : portraitImageSrc ? (
              <Image
                src={portraitImageSrc}
                alt={portraitImageAlt}
                fill
                preload
                sizes="(min-width: 1024px) 56vw, 90vw"
                className="object-cover"
                style={{ objectPosition: "center top" }}
              />
            ) : null}
          </div>
        </div>

        {/* Right: quote + attribution */}
        <div data-reveal className="lg:flex-1 flex flex-col">
          <blockquote className="font-display text-display-xs md:text-display-sm font-normal text-primary-500 leading-tight tracking-tight">
            &quot;{quote}&quot;
          </blockquote>

          <div className="mt-8 md:mt-10 flex items-center gap-5 md:gap-6">
            {/* Circular portrait image */}
            {quoteImageSrc && (
              <div className="relative size-24 md:size-28 rounded-full overflow-hidden shrink-0">
                <Image
                  src={quoteImageSrc}
                  alt={quoteImageAlt}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <p className="font-display text-base md:text-lg font-bold text-primary-500 leading-tight">
                {title ? `${name}, ${title}` : name}
              </p>
              <p className="mt-1 text-sm md:text-base text-primary-500/60">
                {org}
              </p>

              <div className="mt-4 flex items-center gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.kind}
                    href={s.href}
                    aria-label={s.label ?? s.kind}
                    className="inline-flex items-center justify-center size-9 rounded-full border border-primary-500/40 text-primary-500/70 hover:border-primary-500/75 hover:text-primary-500 transition-colors"
                  >
                    <SocialIcon kind={s.kind} />
                  </a>
                ))}
              </div>
            </div>
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
