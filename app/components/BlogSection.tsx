import Image from "next/image";

import CtaLink from "./CtaLink";

/** A post as consumed by the home "Latest from BPI" bento. Shaped by the
 *  homepage from the Sanity LATEST_POSTS_QUERY result. */
export type BlogSectionPost = {
  title: string;
  excerpt?: string;
  href: string;
  publishedAt?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Tag titles, rendered as pills. */
  tags?: string[];
  /** Content-type label shown as the eyebrow on feature tiles (e.g. "News"). */
  category?: string;
};

type Card = {
  /** Stable position in the source list — used for React keys after reorder. */
  idx: number;
  title: string;
  /** Overlay label shown on the large feature cards (the content type). */
  category?: string;
  tags: string[];
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Feature cards span two columns and use the dark image-overlay style. */
  featured: boolean;
};

type Props = {
  heading?: string;
  viewAllHref?: string;
  posts?: BlogSectionPost[];
  /** Colour band. "blue" matches the initiative/sector pages (whose Careers
      closer is already blue); absent keeps the site's default mint. */
  tone?: "mint" | "blue";
};

export default function BlogSection({
  heading = "Latest from BPI",
  viewAllHref = "/blog",
  posts = [],
  tone = "mint",
}: Props) {
  if (posts.length === 0) return null;

  const isBlue = tone === "blue";
  const sectionBg = isBlue ? "bg-[#E7F9FF]" : "bg-[#EAFBF1]";
  const cardBg = isBlue ? "bg-[#CAF1FF]" : "bg-[#D2F4DA]";

  // Bento layout: every third tile is a wide feature (spans two columns), so
  // each row reads as feature + two small cards (2 + 1 + 1 across the 4-col
  // grid). Tiles cleanly for the typical 3- or 6-post counts.
  const cards: Card[] = posts.map((p, idx) => ({
    idx,
    title: p.title,
    category: p.category,
    tags: p.tags ?? [],
    href: p.href,
    imageSrc: p.imageSrc,
    imageAlt: p.imageAlt,
    featured: idx % 3 === 0,
  }));

  // Split into rows of three (feature + two small) and alternate the layout so
  // the bento zig-zags: row 1 leads with the feature tile on the left (feature
  // + small + small → 2 + 1 + 1), while row 2 centers the feature between the
  // two small cards (small + feature + small → 1 + 2 + 1). Both arrangements
  // span the full 4-column grid with no explicit placement.
  const orderedCards: Card[] = Array.from(
    { length: Math.ceil(cards.length / 3) },
    (_, row) => cards.slice(row * 3, row * 3 + 3),
  ).flatMap((group, row) =>
    row % 2 === 1 && group.length === 3
      ? [group[1], group[0], group[2]]
      : group,
  );

  return (
    <section
      data-nav-theme="light"
      className={`${sectionBg} px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24 lg:py-28`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 md:mb-12">
        <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-bold text-primary-500 leading-[1.05] tracking-[-0.02em]">
          {heading}
        </h2>
        <CtaLink
          href={viewAllHref}
          className="group inline-flex items-center gap-3 text-sm md:text-base font-medium text-primary-500"
        >
          View all
          <span className="inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-primary-500">
            <Arrow className="h-4 w-4" />
          </span>
        </CtaLink>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-auto md:auto-rows-[32rem] lg:auto-rows-[42rem]">
        {orderedCards.map((card) =>
          card.featured ? (
            <FeatureCard key={card.idx} card={card} />
          ) : (
            <SmallCard key={card.idx} card={card} cardBg={cardBg} />
          )
        )}
      </div>
    </section>
  );
}

function FeatureCard({ card }: { card: Card }) {
  return (
    <CtaLink
      href={card.href}
      className="group relative block overflow-hidden rounded-2xl md:rounded-3xl bg-primary-500 md:col-span-2 row-span-1 aspect-4/3 md:aspect-auto md:h-full focus-visible:outline-none"
    >
      {card.imageSrc ? (
        <Image
          src={card.imageSrc}
          alt={card.imageAlt ?? ""}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-black/25" />
      <div className="relative flex h-full flex-col justify-between p-5 md:p-6 lg:p-7">
        <div className="flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <Tag key={t} label={t} dark />
          ))}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-md">
            {card.category ? (
              <div className="text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-white">
                {card.category}
              </div>
            ) : null}
            <h3 className="mt-2 text-base md:text-lg lg:text-xl font-semibold text-white leading-snug">
              {card.title}
            </h3>
          </div>
          <ArrowCircle />
        </div>
      </div>
    </CtaLink>
  );
}

function SmallCard({ card, cardBg }: { card: Card; cardBg: string }) {
  return (
    <CtaLink
      href={card.href}
      className={`group flex h-full flex-col rounded-3xl ${cardBg} p-5 md:p-6 focus-visible:outline-none`}
    >
      <div className="flex flex-wrap gap-2">
        {card.tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>
      <div className="relative mt-5 md:mt-6 aspect-square overflow-hidden rounded-2xl bg-primary-500/5">
        {card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt={card.imageAlt ?? ""}
            fill
            sizes="(min-width: 768px) 25vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="mt-auto pt-6 md:pt-8 flex items-end justify-between gap-3">
        <h3 className="text-lg md:text-xl font-medium text-primary-500 leading-snug">
          {card.title}
        </h3>
        <ArrowCircle />
      </div>
    </CtaLink>
  );
}

function Tag({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 tracking-wide ${
        dark ? "border-white/50 text-white" : "border-primary-500/40 text-primary-500"
      }`}
    >
      {label}
    </span>
  );
}

function ArrowCircle({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center rounded-full bg-white text-primary-500 shadow-sm ${
        small ? "h-9 w-9" : "h-11 w-11 md:h-12 md:w-12"
      }`}
    >
      <Arrow className={small ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
