import type { CSSProperties } from "react";
import Image from "next/image";
import Button from "./Button";

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

const DEFAULT_QUOTE = `"2–3 sentences. Structural and grounded. Should carry the DNA of the narrative without sounding like a brochure."`;
const DEFAULT_BODY =
  "Barbados Pharmaceutical Inc. is building the pharmaceutical infrastructure Barbados and its region deserve and proving that small states can shape the systems they depend on.";

const DEFAULT_SOCIALS: SocialLink[] = [
  { kind: "Website", href: "#", label: "Website" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "#" },
];

export default function LeaderSection({
  quote = DEFAULT_QUOTE,
  body = DEFAULT_BODY,
  name = "[Name]",
  title = "[Title]",
  org = "Barbados Pharmaceutical Inc.",
  quoteImageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  quoteImageAlt = "Leader speaking at podium",
  portraitImageSrc = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
  portraitImageAlt = "Leader portrait",
  socials = DEFAULT_SOCIALS,
}: Props) {
  return (
    <section data-nav-theme="light" className="bg-error-25 px-8 md:px-16 lg:px-28 py-12 md:py-16 lg:py-24">
      <div data-reveal-stagger className="mx-auto max-w-page flex flex-col gap-y-6 lg:flex-row lg:justify-between mb-9 lg:mb-12">
        <div className="lg:w-[42%]">
          <p className="font-display text-display-xs md:text-display-sm font-semibold text-primary-500 leading-tight">
            {quote}
          </p>
        </div>
        <div className="lg:w-[32%]">
          <p className="text-sm lg:text-md text-primary-500 leading-relaxed">
            {body}
          </p>
        </div>
      </div>

      <div data-reveal-stagger className="mx-auto max-w-page flex flex-col gap-y-6 lg:flex-row lg:gap-x-5 lg:items-stretch">
        <div data-reveal="scale" className="lg:w-[55%] relative aspect-4/3 rounded-lg overflow-hidden">
          <div
            data-parallax="0.10"
            className="absolute inset-0"
            style={{ "--parallax-scale": "1.12" } as CSSProperties}
          >
            <Image
              src={quoteImageSrc}
              alt={quoteImageAlt}
              fill
              sizes="(min-width: 1024px) 55vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:flex-1 flex flex-col gap-5 lg:gap-6">
          <div
            className="rounded-lg p-6 lg:p-8"
            style={{ backgroundColor: "#dde885" }}
          >
            <h3 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.2]">
              {name}, {title}
            </h3>
            <p className="mt-2 text-sm lg:text-md text-primary-500/80">
              {org}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.kind}
                  href={s.href}
                  aria-label={s.label ?? s.kind}
                >
                  <Button
                    variant="tertiary-light"
                    iconOnly="sm"
                    aria-hidden
                    tabIndex={-1}
                  >
                    <SocialIcon kind={s.kind} />
                  </Button>
                </a>
              ))}
            </div>
          </div>

          <div data-reveal="scale" className="relative aspect-4/5 w-full lg:w-[55%] rounded-lg overflow-hidden">
            <div
              data-parallax="0.14"
              className="absolute inset-0"
              style={{ "--parallax-scale": "1.14" } as CSSProperties}
            >
              <Image
                src={portraitImageSrc}
                alt={portraitImageAlt}
                fill
                sizes="(min-width: 1024px) 22vw, 90vw"
                className="object-cover"
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
