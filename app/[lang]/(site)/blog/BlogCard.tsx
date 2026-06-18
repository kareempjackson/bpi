import Image from "next/image";

import CtaLink from "@/app/components/CtaLink";
import { type BlogPostCard, type BlogTag, formatPostDate, postHref } from "./types";

/**
 * Blog card. Two layouts:
 *  - standard: a rounded media tile (tags overlaid top-left) with the title,
 *    excerpt and date stacked below it on the page background — no card box.
 *  - wide: a full-width feature tile where the title + date are overlaid at the
 *    bottom over a dark gradient (image-led, like the home FeatureCard).
 *
 * Media renders by kind: image, video (play badge), audio (audio badge), or
 * file (PDF-style doc tile for resources/reports without a visual).
 */
export default function BlogCard({
  post,
  wide = false,
}: {
  post: BlogPostCard;
  wide?: boolean;
}) {
  return wide ? <WideCard post={post} /> : <StandardCard post={post} />;
}

function StandardCard({ post }: { post: BlogPostCard }) {
  const date = formatPostDate(post.publishedAt);
  return (
    <CtaLink
      href={postHref(post)}
      className="group mb-6 lg:mb-8 flex break-inside-avoid flex-col overflow-hidden rounded-md bg-white transition-shadow duration-300 hover:shadow-[0_6px_22px_-8px_rgba(0,0,54,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
    >
      {/* Image fills the top edge-to-edge; the card's rounded overflow clips the
          top corners. The white text block below carries all the padding. */}
      <div className="relative aspect-4/3 overflow-hidden">
        <Media
          post={post}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <TagOverlay tags={post.tags} />
      </div>

      <div className="flex flex-col p-4 md:p-5">
        <h3 className="text-base md:text-lg font-semibold text-primary-500 leading-snug">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-2.5 text-sm text-primary-500/55 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        {date ? (
          <p className="mt-5 text-xs text-primary-500/45">{date}</p>
        ) : null}
      </div>
    </CtaLink>
  );
}

function WideCard({ post }: { post: BlogPostCard }) {
  const date = formatPostDate(post.publishedAt);
  return (
    <CtaLink
      href={postHref(post)}
      className="group relative block aspect-video lg:aspect-21/9 overflow-hidden rounded-md bg-primary-500 focus-visible:outline-none"
    >
      <Media post={post} sizes="100vw" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />
      <TagOverlay tags={post.tags} dark />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <h3 className="max-w-2xl text-lg md:text-xl lg:text-2xl font-semibold text-white leading-snug">
          {post.title}
        </h3>
        {date ? <p className="mt-2 text-xs text-white/70">{date}</p> : null}
      </div>
    </CtaLink>
  );
}

/** Fills the parent (must be `relative overflow-hidden`). */
function Media({ post, sizes }: { post: BlogPostCard; sizes: string }) {
  const media = post.media;

  if (!media || media.kind === "file") {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-error-200 to-warning-200 flex items-center justify-center">
        <DocBadge label={media?.kind === "file" ? media.label : "FILE"} />
      </div>
    );
  }

  const poster = media.kind === "image" ? media.src : media.poster;

  return (
    <>
      {poster ? (
        <Image
          src={poster}
          alt={media.alt ?? ""}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04] motion-reduce:transform-none"
        />
      ) : (
        <span className="absolute inset-0 bg-primary-500/10" />
      )}
      {media.kind === "video" ? <PlayBadge /> : null}
      {media.kind === "audio" ? <AudioBadge /> : null}
    </>
  );
}

/** Tag pills overlaid on the top-left of the media. */
function TagOverlay({ tags, dark = false }: { tags: BlogTag[]; dark?: boolean }) {
  if (tags.length === 0) return null;
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t.slug}
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium leading-4 backdrop-blur-sm ${
            dark ? "bg-black/35 text-white" : "bg-white/90 text-primary-500"
          }`}
        >
          {t.title}
        </span>
      ))}
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute inset-0 z-[5] flex items-center justify-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-white" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </span>
  );
}

function AudioBadge() {
  return (
    <span className="absolute bottom-3 left-3 z-[5] inline-flex items-center gap-2 rounded-round bg-black/45 px-3 py-1.5 backdrop-blur-sm">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden>
        <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z" />
      </svg>
      <span className="text-[11px] font-medium text-white">Audio</span>
    </span>
  );
}

function DocBadge({ label = "PDF" }: { label?: string }) {
  return (
    <span className="flex flex-col items-center gap-2 text-primary-500">
      <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden>
        <path
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span>
    </span>
  );
}
