import PortableTextBody from "@/app/components/PortableTextBody";
import type { EngagementSummary, PortableTextBlock } from "@/sanity/lib/types";

import { ACCENTS } from "./mapEvents";

const INTRO_PARAGRAPH_CLASS =
  "text-sm lg:text-base text-primary-500/55 leading-relaxed";

/**
 * The two Sanity-only engagement sections on /events:
 *   • "Events We're Attending Next" — future-dated engagements (always shown,
 *     with an empty state when there are none yet)
 *   • "Where We've Been" — past-dated engagements (hidden when empty)
 *
 * Engagements arrive newest-first (see ENGAGEMENTS_QUERY); we split them by
 * `date` against `todayISO` so an entry crosses from one section to the other
 * on its own once its date passes — no editor re-filing.
 */

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/**
 * Format a "YYYY-MM-DD" string as "THU, JUN 18, 2026" — mirrors the event
 * card's date line. Built from the date parts (anchored at UTC noon for the
 * weekday) so it never shifts across a timezone boundary.
 */
function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return "";
  const [, y, mo, d] = m;
  const month = MONTHS[Number(mo) - 1];
  if (!month) return "";
  const weekday =
    WEEKDAYS[new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12)).getUTCDay()];
  return `${weekday}, ${month} ${Number(d)}, ${y}`;
}

/**
 * Engagement card — the same silhouette as the hosted `EventCard` (gradient
 * poster, pill, date, uppercase title) so all three sections read as one grid.
 * Engagements never carry an image, so the poster is always a gradient accent;
 * the pill shows the location, and `showPurpose` adds the "why we're there"
 * line for the "attending next" variant.
 */
function EngagementCard({
  engagement,
  accent,
  showPurpose,
}: {
  engagement: EngagementSummary;
  /** Tailwind gradient classes for the poster (cycled across the grid). */
  accent: string;
  showPurpose: boolean;
}) {
  const poster = (
    <div
      className={`relative overflow-hidden rounded-2xl aspect-4/3 ${accent}`}
    />
  );

  const heading = (
    <h3 className="font-bold text-primary-500 uppercase leading-snug tracking-[0.01em] text-xs lg:text-[13px]">
      {engagement.name}
    </h3>
  );

  return (
    <article className="group flex flex-col gap-3">
      {engagement.link ? (
        <a
          href={engagement.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={engagement.name}
          className="block"
        >
          {poster}
        </a>
      ) : (
        poster
      )}

      {engagement.location ? (
        <span className="inline-flex w-fit items-center rounded-round bg-error-200 px-3 py-1 text-xs font-semibold text-primary-500">
          {engagement.location}
        </span>
      ) : null}

      <p className="text-primary-500/55 text-xs lg:text-[13px]">
        {formatDate(engagement.date)}
      </p>

      {engagement.link ? (
        <a
          href={engagement.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hov-underline w-fit"
        >
          {heading}
        </a>
      ) : (
        heading
      )}

      {showPurpose && engagement.purpose ? (
        <PortableTextBody
          value={engagement.purpose}
          compact
          paragraphClassName="text-xs lg:text-[13px] text-primary-500/70 leading-relaxed"
        />
      ) : null}
    </article>
  );
}

/** Section copy, resolved from the eventsPage singleton (with fallbacks).
    Headings are plain strings; prose fields are WYSIWYG (Portable Text) with a
    plain-string fallback. */
export type EngagementCopy = {
  attendingHeading: string;
  attendingIntro: PortableTextBlock[] | string;
  attendingEmptyState: PortableTextBlock[] | string;
  pastHeading: string;
  pastIntro: PortableTextBlock[] | string;
};

export default function EngagementSections({
  engagements,
  todayISO,
  copy,
}: {
  engagements: EngagementSummary[];
  /** Today's date as "YYYY-MM-DD" — the split boundary. */
  todayISO: string;
  copy: EngagementCopy;
}) {
  // Future first (soonest first); query already gives us newest-first, so
  // reverse the future slice to get ascending order.
  const upcoming = engagements
    .filter((e) => e.date >= todayISO)
    .slice()
    .reverse();
  const past = engagements.filter((e) => e.date < todayISO);

  return (
    <>
      {/* Events We're Attending Next */}
      <div className="mt-16 md:mt-20 lg:mt-24">
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
            {copy.attendingHeading}
          </h2>
          <PortableTextBody
            value={copy.attendingIntro}
            compact
            paragraphClassName={INTRO_PARAGRAPH_CLASS}
          />
        </div>

        {upcoming.length > 0 ? (
          <div className="mt-8 lg:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 lg:gap-y-10">
            {upcoming.map((e, i) => (
              <EngagementCard
                key={e._id}
                engagement={e}
                accent={ACCENTS[i % ACCENTS.length]}
                showPurpose
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 lg:mt-10 rounded-2xl border border-primary-500/10 bg-primary-500/4 px-6 py-8 lg:px-8 lg:py-10">
            <PortableTextBody
              value={copy.attendingEmptyState}
              compact
              paragraphClassName="text-base lg:text-lg text-primary-500/70 leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Where We've Been — only when there's a recap to show */}
      {past.length > 0 ? (
        <div className="mt-16 md:mt-20 lg:mt-24">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
              {copy.pastHeading}
            </h2>
            <PortableTextBody
              value={copy.pastIntro}
              compact
              paragraphClassName={INTRO_PARAGRAPH_CLASS}
            />
          </div>

          <div className="mt-8 lg:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 lg:gap-y-10">
            {past.map((e, i) => (
              <EngagementCard
                key={e._id}
                engagement={e}
                accent={ACCENTS[i % ACCENTS.length]}
                showPurpose={false}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
