import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";

/**
 * "Available Manufacturing Sites" — heading and body on the left, the numbered
 * estate list and its italic note on the right. Numbers are derived from order
 * (01, 02, 03…), so an editor only ever types the site name.
 */
export default function InvestorsSites({
  heading,
  body,
  sites,
  note,
}: {
  heading?: string | null;
  body?: string | null;
  sites?: string[] | null;
  note?: string | null;
}) {
  return (
    <section
      data-nav-theme="light"
      // Nav-aligned gutters (match StickyTopNav's px) so the left content lines
      // up with the logo and the right content lines up with the menu.
      className="px-6 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-page grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left — heading + body. */}
        <Stagger className="flex flex-col gap-5">
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {body ? (
            <StaggerItem
              as="p"
              className="max-w-md text-sm md:text-base text-primary-500/75 leading-relaxed"
            >
              {body}
            </StaggerItem>
          ) : null}
        </Stagger>

        {/* Right — numbered list, then the note. */}
        <div className="flex flex-col gap-10 md:gap-12">
          {sites?.length ? (
            <Stagger className="flex flex-col">
              {sites.map((site, i) => (
                <StaggerItem
                  key={`${site}-${i}`}
                  className="flex items-center justify-between gap-6 border-t border-primary-500/15 py-3.5 last:border-b"
                >
                  <span className="text-xs md:text-sm text-primary-500 leading-snug">
                    {site}
                  </span>
                  <span className="shrink-0 text-xs md:text-sm tabular-nums text-primary-500/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}

          {note ? (
            <Reveal
              as="p"
              // Note per design spec: Avenir (via --font-sans) Book Oblique
              // (italic, 350), 24px / 42px line-height (ratio 1.75), no
              // tracking, middle-aligned.
              className="max-w-2xl align-middle font-sans font-[350] italic text-base md:text-lg lg:text-[20px] text-primary-500/70 leading-[1.75] tracking-normal"
            >
              {note}
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
