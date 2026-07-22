import { localizedHref } from "@/app/lib/locale";
import type { AnnouncementBand } from "@/sanity/lib/types";

import CtaLink from "./CtaLink";

/**
 * The site-wide announcement bar, rendered once at the very top of the (site)
 * layout. Authored on `siteSettings.announcement` and gated on `enabled`, so
 * it ships hidden and adds no chrome until an editor turns it on.
 */
const TONE_CLASSES: Record<string, string> = {
  // Colour names are the code's inverted ramp: primary = navy, error = mint.
  dark: "bg-primary-500 text-white",
  green: "bg-error-500 text-primary-500",
  blue: "bg-warning-25 text-primary-500",
};

export default function AnnouncementBar({
  announcement,
  lang,
}: {
  announcement: AnnouncementBand;
  lang: string;
}) {
  const text = announcement.text?.trim();
  if (!text) return null;

  const toneClass = TONE_CLASSES[announcement.tone ?? "dark"] ?? TONE_CLASSES.dark;
  const link = announcement.link;
  const href = link?.href ? localizedHref(lang, link.href) : undefined;

  return (
    <div className={`${toneClass} w-full`}>
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2.5 text-center text-sm md:px-10 lg:px-14">
        <span className="font-medium">{text}</span>
        {link?.label && href ? (
          <CtaLink
            href={href}
            className="inline-flex items-center font-semibold underline underline-offset-2"
          >
            {link.label}
          </CtaLink>
        ) : null}
      </div>
    </div>
  );
}
