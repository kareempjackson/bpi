import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArrowCircle from "../../../components/ArrowCircle";
import { client } from "../../../../sanity/lib/client";
import { resolveImage } from "../../../../sanity/lib/image";
import {
  ALL_INITIATIVE_SLUGS_QUERY,
  INITIATIVE_BY_SLUG_QUERY,
} from "../../../../sanity/lib/queries";
import type { InitiativeDetail } from "../../../../sanity/lib/types";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_INITIATIVE_SLUGS_QUERY,
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getInitiative(slug: string): Promise<InitiativeDetail | null> {
  return client.fetch<InitiativeDetail | null>(INITIATIVE_BY_SLUG_QUERY, {
    slug,
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getInitiative(slug);
  if (!data) return { title: "Initiatives — BPI" };
  return {
    title: `${data.title} — BPI Initiatives`,
    description: data.excerpt,
  };
}

/**
 * Portable Text render rules — tuned for editorial reading: longer line
 * heights, generous gaps between blocks, refined heading hierarchy.
 */
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
      const v = value as
        | { asset?: { _ref?: string }; alt?: string }
        | undefined;
      if (!v) return null;
      const img = resolveImage(
        { asset: v.asset, alt: v.alt ?? "" } as Parameters<
          typeof resolveImage
        >[0],
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

export default async function InitiativeDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const initiative = await getInitiative(slug);
  if (!initiative) notFound();
  // Display-only initiatives don't have a detail page. The
  // `generateStaticParams` GROQ already filters these out, but a direct
  // URL hit still lands here — 404 cleanly. (Treat absent `hasDetailPage`
  // as true so legacy data still renders.)
  if (initiative.hasDetailPage === false) notFound();

  const cover = resolveImage(initiative.coverImage, { width: 2000 });
  const publishedDate = initiative.publishedAt
    ? new Date(initiative.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const hasBody = !!initiative.body && initiative.body.length > 0;

  return (
    <main className="bg-error-25">
      {/* Top utility row — sits just under the global sticky nav, anchored
          to the page max-width grid so it aligns with everything below. */}
      <div className="px-5 md:px-20 lg:px-32 pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-page">
          <Link
            href="/initiatives"
            className="group/back inline-flex items-center gap-3 text-sm lg:text-base text-primary-500/80 hover:text-primary-500 transition-colors duration-300"
          >
            <ArrowCircle
              size={36}
              direction="prev"
              className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/back:-translate-x-1 motion-reduce:transform-none"
            />
            <span>All initiatives</span>
          </Link>
        </div>
      </div>

      {/* Editorial hero — a single column at the page max-width, with an
          eyebrow stack on top, a display title balanced across two lines,
          subtitle/lede as a quieter follow-up, and metadata pushed to a
          slim row underneath. No card wrap, no panels — the page reads
          like a long-form article. */}
      <section className="px-5 md:px-20 lg:px-32 pt-10 md:pt-14 lg:pt-16 pb-12 md:pb-16 lg:pb-20">
        <div
          data-reveal-stagger
          className="mx-auto max-w-page flex flex-col gap-6 lg:gap-8"
        >
          {/* Eyebrow + featured chip */}
          <div className="flex items-center gap-3 text-xs lg:text-sm font-medium uppercase tracking-[0.18em] text-primary-500/65">
            <span>Initiative</span>
            {initiative.featured ? (
              <>
                <span aria-hidden className="text-primary-500/25">
                  /
                </span>
                <span className="text-primary-500">Featured</span>
              </>
            ) : null}
          </div>

          {/* Title — display-xl is the headliner; balances onto two lines
              cleanly via the new .balance-text utility (text-wrap: balance). */}
          <h1 className="font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.02] tracking-[-0.03em] max-w-5xl balance-text">
            {initiative.title}
          </h1>

          {/* Subtitle — a quieter restatement, only when set */}
          {initiative.subtitle ? (
            <p className="font-display text-xl md:text-2xl lg:text-[28px] text-primary-500/65 leading-[1.3] tracking-[-0.01em] max-w-3xl balance-text">
              {initiative.subtitle}
            </p>
          ) : null}

          {/* Lede — sits as the first body paragraph would, slightly larger
              than the rest of the body type and at a generous reading width */}
          <p className="text-lg lg:text-xl text-primary-500/85 leading-[1.6] max-w-3xl">
            {initiative.excerpt}
          </p>

          {/* Slim meta row — hairline-bordered, sits just above the cover */}
          {publishedDate ? (
            <div className="mt-2 lg:mt-4 flex items-center gap-3 pt-4 border-t border-primary-500/12">
              <span className="text-xs lg:text-sm uppercase tracking-[0.14em] text-primary-500/55">
                Published
              </span>
              <span className="text-xs lg:text-sm text-primary-500/80">
                {publishedDate}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {/* Cover — full-bleed within the page max-width, taller aspect so it
          carries weight. Uses preload so it acts as the LCP candidate. */}
      {cover ? (
        <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
          <div
            data-reveal="scale"
            className="mx-auto max-w-page relative aspect-4/3 md:aspect-16/9 lg:aspect-21/9 rounded-2xl lg:rounded-3xl overflow-hidden bg-primary-500/5"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
              preload
              quality={90}
            />
            {/* Whisper gradient at the bottom so any caption / scroll cue
                placed over the image stays legible across content variation */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/15 to-transparent"
            />
          </div>
        </section>
      ) : null}

      {/* Body — narrow column for reading comfort. Centered, generous
          vertical rhythm. Each Portable Text block gets its own pacing
          via bodyComponents. */}
      {hasBody ? (
        <section className="px-5 md:px-20 lg:px-32 pb-20 md:pb-28 lg:pb-36">
          <article
            data-reveal-stagger
            className="mx-auto max-w-2xl flex flex-col gap-5 lg:gap-6"
          >
            <PortableText
              value={initiative.body!}
              components={bodyComponents}
            />
          </article>
        </section>
      ) : null}

      {/* Footer pull — a single understated CTA back to the list, with
          enough room above it to act as a breath at the bottom of the
          article. No "More initiatives" grid; the page closes quietly. */}
      <section className="px-5 md:px-20 lg:px-32 pb-24 md:pb-32 lg:pb-40">
        <div
          data-reveal
          className="mx-auto max-w-page flex justify-center"
        >
          <Link
            href="/initiatives"
            className="group/all inline-flex items-center gap-4 text-base lg:text-lg text-primary-500 transition-opacity duration-300 hover:opacity-80"
          >
            <ArrowCircle
              size={44}
              direction="prev"
              className="text-primary-500 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/all:-translate-x-1 motion-reduce:transform-none"
            />
            <span className="font-display tracking-[-0.01em]">
              Browse all initiatives
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
