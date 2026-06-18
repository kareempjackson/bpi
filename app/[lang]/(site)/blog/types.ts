// Shared UI types for the blog index. Shaped to mirror the eventual Sanity
// query output (see Phase C — sanity/lib/queries.ts / types.ts) so swapping the
// placeholder fixtures for `loadQuery` results is a drop-in change.

export type ContentType = "article" | "news" | "resource" | "report";

export const CONTENT_TYPES: { key: ContentType; label: string }[] = [
  { key: "article", label: "Articles" },
  { key: "news", label: "News" },
  { key: "resource", label: "Resources" },
  { key: "report", label: "Reports" },
];

export type BlogTag = {
  title: string;
  slug: string;
  /** Optional brand hex (e.g. "#06fe83") used to tint the pill. */
  color?: string | null;
};

/** Card media — resolved to plain URLs by the time it reaches the UI. */
export type BlogMedia =
  | { kind: "image"; src: string; alt?: string }
  | { kind: "video"; src: string; poster?: string; alt?: string }
  | { kind: "audio"; src?: string; poster?: string; alt?: string }
  /** Resource/report with a downloadable file but no visual — render a doc tile. */
  | { kind: "file"; label?: string };

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  contentType: ContentType;
  tags: BlogTag[];
  media?: BlogMedia | null;
  /** When set (typically news), the card links out instead of to /blog/[slug]. */
  externalLink?: string | null;
  /** Renders as a full-width feature tile (image-led) within the grid. */
  wide?: boolean;
};

export type BlogFeatured = {
  title: string;
  slug: string;
  excerpt?: string;
  contentType: ContentType;
  tags: BlogTag[];
  media?: BlogMedia | null;
  externalLink?: string | null;
};

/** Where a card/featured post points: external source wins, else the on-site page. */
export function postHref(post: {
  slug: string;
  externalLink?: string | null;
}): string {
  return post.externalLink ?? `/blog/${post.slug}`;
}

export function formatPostDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
