import Image from "next/image";

import CtaLink from "./CtaLink";
import BlogPostShape from "./shapes/BlogPostShape";

export type BlogSectionPost = {
  title: string;
  excerpt: string;
  href: string;
  publishedAt?: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Eyebrow tag rendered above the title (e.g. "Alliance"). */
  pillar?: string;
  /**
   * When the post has no uploaded thumbnail, render one of the inline
   * abstract shapes (1-3, cycles thereafter) tinted with brand colours.
   */
  thumbVariant?: 1 | 2 | 3;
};

/**
 * Editorial placeholders shown when Sanity has no posts yet (or fewer
 * than 3 to fill the row). Thumbnails are inline abstract SVG shapes —
 * no asset dependency, scale cleanly, on-brand.
 */
const DEFAULT_POSTS: BlogSectionPost[] = [
  {
    pillar: "Diplomacy",
    title: "Barbados Pharmaceutical Inc. Meets WHO and WTO Directors General in Geneva",
    excerpt:
      "A small island. A big agenda. Barbados Pharmaceutical Inc. held high level meetings in Geneva with Dr. Tedros Adhanom Ghebreyesus, Director General of the World Health Organization, and Dr. Ngozi Okonjo-Iweala, Director General of the World Trade Organization. These were not courtesy meetings. BPI came with a case and the world's top multilateral leaders heard it.",
    href: "/about",
    thumbVariant: 1,
  },
  {
    pillar: "Manufacturing",
    title:
      "The Caribbean Is Getting Its First IV Fluids Manufacturing Facility — and It's Being Built in Barbados",
    excerpt:
      "The Caribbean imports almost every IV fluid it uses. That changes with the construction of a $31.3 million pharmaceutical manufacturing facility at the Grantley Adams Industrial Estate. A joint venture between Barbados Pharmaceutical Inc. and Nigeria's AMA Medical Manufacturing, with capacity for 12 million units a year. The first of its kind in the region.",
    href: "/initiatives",
    thumbVariant: 3,
  },
  {
    pillar: "Partnership",
    title: "Barbados and Nigeria Sign Landmark Pharmaceutical MOU",
    excerpt:
      "Barbados Pharmaceutical Inc. and Nigeria's Presidential Initiative for Unlocking the Healthcare Value Chain have signed a Memorandum of Understanding. The first pharmaceutical manufacturing partnership of its kind between Africa and the Caribbean.",
    href: "/initiatives",
    thumbVariant: 2,
  },
];

type Props = {
  heading?: string;
  posts?: BlogSectionPost[];
};

export default function BlogSection({
  heading = "Latest from BPI",
  posts,
}: Props) {
  // Default to the editorial placeholders when no Sanity posts are
  // supplied. When some posts arrive but fewer than 3 (the grid expects
  // a row of three) we top-up from the defaults — but only as a fill,
  // never overriding real posts.
  const resolved: BlogSectionPost[] =
    posts && posts.length > 0
      ? posts.length >= 3
        ? posts
        : [...posts, ...DEFAULT_POSTS.slice(posts.length, 3)]
      : DEFAULT_POSTS;
  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-5 md:px-20 lg:px-32 py-8 md:py-14 lg:py-20"
    >
      <div
        className="mx-auto max-w-page rounded-lg px-6 md:px-10 lg:px-14 py-8 md:py-12 lg:py-14"
        style={{ backgroundColor: "#ABE8FE" }}
      >
        {/* Section header — stronger typographic hierarchy, plus a
            "View all" affordance with the brand arrow circle on the
            right so the section feels like a curated index rather than
            a one-off panel. */}
        <div
          data-reveal-stagger
          className="flex items-end justify-between gap-4 mb-8 md:mb-12 lg:mb-14"
        >
          <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.05] tracking-[-0.02em]">
            {heading}
          </h2>
        </div>

        <div
          data-reveal-stagger
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6"
        >
          {resolved.map((post, idx) => (
            <PostCard key={post.href + idx} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: BlogSectionPost }) {
  // Eyebrow falls back to a formatted date if no `pillar` is set on the
  // post — keeps a small piece of metadata above the title in every case.
  const eyebrow = post.pillar
    ? post.pillar
    : post.publishedAt
      ? formatDate(post.publishedAt)
      : "";
  return (
    <CtaLink
      href={post.href}
      className="block group transition-transform duration-300 ease-[var(--ease-premium)] hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline-none"
    >
      {/* `BlogPostShape` is the white card with a notched bottom-right
          corner. Content (eyebrow + title up top, square thumbnail at
          bottom-left, arrow circle in the notch) is layered on top via
          `children`. */}
      <BlogPostShape size={360} fill="#ffffff" className="w-full h-auto">
        <div className="px-5 md:px-6 pt-6 md:pt-7 pr-7">
          {eyebrow ? (
            <div className="text-[11px] font-bold tracking-[0.12em] text-primary-500 uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h3 className="mt-2 text-sm md:text-base font-bold text-primary-500 leading-tight group-hover:opacity-80 transition-opacity">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-2 text-xs md:text-[13px] text-primary-500/70 leading-[1.45]">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="absolute left-[5%] bottom-[5%] w-[42%] aspect-square rounded-sm overflow-hidden bg-warning-100">
          {post.imageSrc ? (
            <Image
              src={post.imageSrc}
              alt={post.imageAlt ?? ""}
              fill
              sizes="(min-width: 768px) 18vw, 42vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.06] motion-reduce:transform-none"
            />
          ) : (
            <AbstractThumb variant={post.thumbVariant ?? 1} />
          )}
        </div>
      </BlogPostShape>
    </CtaLink>
  );
}

/**
 * Three minimal abstract thumbnails for posts without an uploaded
 * image. Each one fills a square frame and tilts/scales subtly on
 * card hover so the row still reads as alive. Stroke + fill use the
 * brand palette so the shapes feel native to the page rather than
 * generic placeholders.
 */
function AbstractThumb({ variant }: { variant: 1 | 2 | 3 }) {
  const common =
    "absolute inset-0 w-full h-full transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.06] motion-reduce:transform-none";
  if (variant === 1) {
    // Concentric orbits — a quiet nod to the BPI molecule mark
    return (
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={common}
        style={{ backgroundColor: "#cdffe6" }}
      >
        <g fill="none" stroke="#000036" strokeWidth="1.2">
          <circle cx="50" cy="50" r="38" opacity="0.18" />
          <circle cx="50" cy="50" r="28" opacity="0.32" />
          <circle cx="50" cy="50" r="18" opacity="0.55" />
        </g>
        <circle cx="50" cy="50" r="7" fill="#06fe83" />
        <circle cx="78" cy="32" r="2.4" fill="#000036" />
        <circle cx="22" cy="68" r="1.8" fill="#000036" opacity="0.6" />
      </svg>
    );
  }
  if (variant === 2) {
    // Layered diagonal bands — kinetic, suggests motion / corridor
    return (
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={common}
        style={{ backgroundColor: "#000036" }}
        preserveAspectRatio="xMidYMid slice"
      >
        <g>
          <path
            d="M-20 70 L60 -10 L90 -10 L10 70 Z"
            fill="#06fe83"
            opacity="0.18"
          />
          <path
            d="M-10 90 L70 10 L100 10 L20 90 Z"
            fill="#06fe83"
            opacity="0.32"
          />
          <path
            d="M0 110 L80 30 L110 30 L30 110 Z"
            fill="#06fe83"
            opacity="0.6"
          />
        </g>
        <circle cx="78" cy="22" r="3" fill="#ffffff" opacity="0.85" />
      </svg>
    );
  }
  // Variant 3 — grid of bars that read as data / measurement
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={common}
      style={{ backgroundColor: "#ABE8FE" }}
    >
      <g fill="#000036">
        <rect x="12" y="60" width="10" height="28" rx="1.5" opacity="0.32" />
        <rect x="28" y="46" width="10" height="42" rx="1.5" opacity="0.55" />
        <rect x="44" y="34" width="10" height="54" rx="1.5" opacity="0.8" />
        <rect x="60" y="22" width="10" height="66" rx="1.5" />
        <rect
          x="76"
          y="12"
          width="10"
          height="76"
          rx="1.5"
          fill="#06fe83"
        />
      </g>
      <line
        x1="8"
        y1="92"
        x2="92"
        y2="92"
        stroke="#000036"
        strokeWidth="1.2"
        opacity="0.5"
      />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
