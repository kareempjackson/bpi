import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowCircle from "@/app/components/ArrowCircle";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import { ALL_POST_SLUGS_QUERY, POST_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { BlogPostDetail } from "@/sanity/lib/types";
import { formatPostDate } from "../types";
import SharePost from "./SharePost";

type RouteProps = { params: Promise<{ lang: string; slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_POST_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.post] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getPost(
  lang: string,
  slug: string,
): Promise<BlogPostDetail | null> {
  return loadQuery<BlogPostDetail | null>(POST_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.post],
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPost(lang, slug);
  if (!post) return { title: "Blog — BPI" };
  return { title: `${post.title} — BPI`, description: post.excerpt };
}

/** Portable Text render rules — editorial reading rhythm (mirrors initiatives). */
const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-500 leading-[1.15] tracking-[-0.02em] mt-8 lg:mt-12 mb-1 balance-text">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-500 leading-snug tracking-[-0.015em] mt-6 lg:mt-8 mb-0.5 balance-text">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 lg:my-6 border-l-2 border-primary-500/30 pl-6 lg:pl-8 font-display text-xl md:text-2xl lg:text-3xl text-primary-500 leading-[1.35] italic tracking-[-0.01em] balance-text">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2.5 list-disc list-outside pl-6 marker:text-primary-500/50 text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2.5 list-decimal list-outside pl-6 marker:text-primary-500/50 marker:font-semibold text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-primary-500">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="hov-underline text-primary-500 decoration-primary-500/30 underline underline-offset-[6px]"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const v = value as { asset?: { _ref?: string }; alt?: string } | undefined;
      if (!v) return null;
      const img = resolveImage(
        { asset: v.asset, alt: v.alt ?? "" } as Parameters<typeof resolveImage>[0],
        { width: 1600 },
      );
      if (!img) return null;
      return (
        <figure className="my-8 lg:my-12">
          <div className="relative aspect-16/9 rounded-2xl lg:rounded-3xl overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              className="object-cover"
            />
          </div>
          {img.alt ? (
            <figcaption className="mt-3 text-xs lg:text-sm text-primary-500/60 leading-relaxed">
              {img.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

function formatBytes(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function BlogPostPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const post = await getPost(lang, slug);
  if (!post) notFound();

  const media = resolveMedia(post.coverImage, { width: 2000 });
  const date = formatPostDate(post.publishedAt);
  const hasBody = !!post.body && post.body.length > 0;
  const downloads = (post.attachments ?? []).filter((a) => a.url);
  const showDownloads =
    (post.contentType === "resource" || post.contentType === "report") &&
    downloads.length > 0;

  const heroPoster =
    media?.kind === "image" ? media.src : media?.poster ?? undefined;

  return (
    <main className="bg-error-25">
      {/* Full-bleed image hero — title overlaid bottom-left, share widget
          bottom-right (matches the article hero design). The sticky nav sits
          directly on this header: a fully-transparent `data-nav-bg` (alpha 0)
          tells the nav to drop its frosted backdrop and paint no background, so
          the logo/menu float on the cover image as part of the header. The RGB
          is dark, so the nav keeps white text/icons for legibility. */}
      <section
        data-nav-theme="dark"
        data-nav-bg="rgba(1, 25, 13, 0)"
        className="relative flex min-h-[88vh] w-full flex-col justify-end overflow-hidden bg-primary-500"
      >
        {media?.kind === "video" ? (
          <video
            src={media.src}
            poster={media.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : heroPoster ? (
          <Image
            src={heroPoster}
            alt={media?.alt ?? ""}
            fill
            priority
            sizes="100vw"
            quality={90}
            className="object-cover"
          />
        ) : null}

        {/* Legibility scrim — darker at the bottom for the title. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/40" />

        <div className="relative px-5 md:px-20 lg:px-32 pb-12 md:pb-16 lg:pb-20 pt-32">
          <div className="mx-auto flex max-w-page flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {(post.tags ?? []).length > 0 ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  {(post.tags ?? []).map((t) => (
                    <span
                      key={t.slug}
                      className="inline-flex items-center rounded-round bg-white/20 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      {t.title}
                    </span>
                  ))}
                </div>
              ) : null}

              <h1 className="mt-5 lg:mt-6 font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-white leading-[1.04] tracking-[-0.03em] balance-text">
                {post.title}
              </h1>
            </div>

            <div className="shrink-0">
              <SharePost title={post.title} />
            </div>
          </div>
        </div>
      </section>

      {/* Intro — excerpt lead + published date (and audio player if any). */}
      {post.excerpt || date || media?.kind === "audio" ? (
        <section className="px-5 md:px-20 lg:px-32 pt-12 md:pt-16 lg:pt-20">
          <div className="mx-auto max-w-2xl">
            {post.excerpt ? (
              <p className="text-lg lg:text-xl text-primary-500/85 leading-[1.6]">
                {post.excerpt}
              </p>
            ) : null}
            {date ? (
              <div className="mt-5 flex items-center gap-3 border-t border-primary-500/12 pt-4">
                <span className="text-xs lg:text-sm uppercase tracking-[0.14em] text-primary-500/55">
                  Published
                </span>
                <span className="text-xs lg:text-sm text-primary-500/80">
                  {date}
                </span>
              </div>
            ) : null}
            {media?.kind === "audio" ? (
              <audio src={media.src} controls className="mt-5 w-full" />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Body */}
      {hasBody ? (
        <section className="px-5 md:px-20 lg:px-32 pb-12 md:pb-16 lg:pb-20">
          <article className="mx-auto max-w-2xl flex flex-col gap-5 lg:gap-6">
            <PortableText value={post.body!} components={bodyComponents} />
          </article>
        </section>
      ) : null}

      {/* Downloads — resources & reports */}
      {showDownloads ? (
        <section className="px-5 md:px-20 lg:px-32 pb-20 md:pb-28 lg:pb-32">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-primary-500 tracking-[-0.015em]">
              Documents
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {downloads.map((a, i) => {
                const size = formatBytes(a.size);
                return (
                  <li key={i}>
                    <a
                      href={a.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="group/dl flex items-center gap-4 rounded-xl border border-primary-500/15 bg-white p-4 transition-colors hover:border-primary-500/35"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error-25 text-primary-500">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                          <path
                            d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm md:text-base font-medium text-primary-500">
                          {a.label}
                        </span>
                        <span className="block truncate text-xs text-primary-500/55">
                          {[a.filename, size].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Footer pull */}
      <section className="px-5 md:px-20 lg:px-32 pb-24 md:pb-32 lg:pb-40">
        <div className="mx-auto max-w-page flex justify-center">
          <Link
            href="/blog"
            className="group/all inline-flex items-center gap-4 text-base lg:text-lg text-primary-500 transition-opacity duration-300 hover:opacity-80"
          >
            <ArrowCircle
              size={44}
              direction="prev"
              className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/all:-translate-x-1 motion-reduce:transform-none"
            />
            <span className="font-display tracking-[-0.01em]">Browse all posts</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
