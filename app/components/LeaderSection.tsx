import Image from "next/image";

type SocialKind = "Website" | "LinkedIn" | "X" | "Instagram";
type SocialLink = { kind: SocialKind; href: string; label?: string };

type Props = {
  quote?: string;
  body?: string;
  name?: string;
  title?: string;
  org?: string;
  quoteImageSrc?: string;
  quoteImageAlt?: string;
  portraitImageSrc?: string;
  portraitImageAlt?: string;
  socials?: SocialLink[];
};

const DEFAULT_QUOTE = `This has been a major achievement for a small state like Barbados, to be able to [position] itself at the centre of the Americas as a location for the development of a pharmaceutical industry.`;
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
  name = "Rt. Hon. Mia Amor Mottley",
  title = "Prime Minister of Barbados",
  org = "Barbados Pharmaceutical Inc.",
  quoteImageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  quoteImageAlt = "Leader speaking at podium",
  portraitImageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  portraitImageAlt = "Leader portrait",
  socials = DEFAULT_SOCIALS,
}: Props) {
  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-12 md:px-20 lg:px-32 pt-20 md:pt-28 lg:pt-36 pb-16 md:pb-20 lg:pb-28"
    >
      {/* TOP: large quote (left) + small body text (right) — no cards */}
      <div
        data-reveal-stagger
        className="mx-auto max-w-page mb-16 md:mb-20 lg:mb-24 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-y-6 gap-x-10"
      >
        <blockquote className="lg:w-[55%] font-display text-display-sm md:text-display-md font-normal text-primary-500 leading-[1.2] tracking-tight">
          &quot;{quote}&quot;
        </blockquote>
        <p className="lg:w-[28%] text-base md:text-lg lg:text-xl text-primary-500 leading-relaxed">
          {body}
        </p>
      </div>

      {/* BOTTOM: primary image (left) + right column (yellow name card + B&W portrait) */}
      <div
        data-reveal-stagger
        className="mx-auto max-w-page flex flex-col gap-y-5 lg:flex-row lg:gap-x-5 lg:items-stretch"
      >
        {/* Left: primary image */}
        <div
          data-reveal="scale"
          className="lg:w-[50%] relative aspect-5/4 rounded-[48px] overflow-hidden shrink-0"
        >
          <div className="absolute inset-0">
            <Image
              src={quoteImageSrc}
              alt={quoteImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Right column: yellow name card on top + B&W portrait below */}
        <div className="lg:flex-1 flex flex-col gap-5">
          {/* Yellow name card */}
          <div
            data-reveal
            className="rounded-4xl p-5 lg:p-6 lg:mt-16"
            style={{ backgroundColor: "#dde885" }}
          >
            <h3 className="font-display text-base lg:text-lg font-bold text-primary-500 leading-tight">
              {name}, {title}
            </h3>
            <p className="mt-0.5 text-xs lg:text-sm text-primary-500/75">
              {org}
            </p>
            <div className="mt-4 flex items-center gap-2">
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

          {/* B&W portrait — pushed to the bottom so it aligns with the primary image's bottom edge */}
          <div
            data-reveal="scale"
            className="relative w-full sm:w-[50%] aspect-square rounded-[36px] overflow-hidden lg:mt-auto"
          >
            <div className="absolute inset-0">
              <Image
                src={portraitImageSrc}
                alt={portraitImageAlt}
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover grayscale"
              />
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
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
