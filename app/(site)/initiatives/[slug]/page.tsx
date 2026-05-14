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
  RELATED_INITIATIVES_QUERY,
} from "../../../../sanity/lib/queries";
import type {
  Initiative,
  InitiativeDetail,
} from "../../../../sanity/lib/types";

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

async function getRelated(slug: string): Promise<Initiative[]> {
  const data = await client.fetch<Initiative[] | null>(
    RELATED_INITIATIVES_QUERY,
    { slug },
  );
  return data ?? [];
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
 * Render rules for the initiative body's Portable Text content. Maps to
 * clean Tailwind styles that match the brand voice across the site.
 */
const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base lg:text-lg text-primary-500/85 leading-[1.7]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em] mt-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl md:text-2xl font-bold text-primary-500 leading-snug tracking-[-0.01em] mt-3">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500/40 pl-6 italic text-primary-500/90 text-lg lg:text-xl leading-[1.55]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2 list-disc list-outside pl-6 marker:text-primary-500 text-base lg:text-lg text-primary-500/85 leading-[1.7]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2 list-decimal list-outside pl-6 marker:text-primary-500 marker:font-semibold text-base lg:text-lg text-primary-500/85 leading-[1.7]">
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
          className="underline decoration-primary-500/30 underline-offset-4 hover:decoration-primary-500 text-primary-500"
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
      // Portable Text image refs render via resolveImage's same helper.
      const img = resolveImage(
        { asset: v.asset, alt: v.alt ?? "" } as Parameters<
          typeof resolveImage
        >[0],
        { width: 1400 },
      );
      if (!img) return null;
      return (
        <figure className="my-4 lg:my-6">
          <div className="relative aspect-16/9 rounded-2xl lg:rounded-3xl overflow-hidden">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      );
    },
  },
};

export default async function InitiativeDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const initiative = await getInitiative(slug);
  if (!initiative) notFound();

  const related = await getRelated(slug);
  const cover = resolveImage(initiative.coverImage, { width: 1800 });
  const publishedDate = initiative.publishedAt
    ? new Date(initiative.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="bg-error-25">
      {/* Hero */}
      <section className="px-5 md:px-20 lg:px-32 pt-20 md:pt-28 lg:pt-32 pb-10 md:pb-14 lg:pb-16">
        <div className="mx-auto max-w-page">
          {/* Back link */}
          <Link
            href="/initiatives"
            className="group/back inline-flex items-center gap-3 text-sm lg:text-base text-primary-500 transition-opacity duration-300 hover:opacity-80"
          >
            <ArrowCircle
              size={40}
              direction="prev"
              className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/back:-translate-x-1 motion-reduce:transform-none"
            />
            <span>All initiatives</span>
          </Link>

          {/* Title block */}
          <div className="mt-8 lg:mt-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm font-medium tracking-[0.04em] text-primary-500/65 uppercase">
              <span>Initiative</span>
              {publishedDate ? (
                <>
                  <span aria-hidden className="text-primary-500/35">
                    ·
                  </span>
                  <span>{publishedDate}</span>
                </>
              ) : null}
              {initiative.featured ? (
                <>
                  <span aria-hidden className="text-primary-500/35">
                    ·
                  </span>
                  <span className="text-primary-500">Featured</span>
                </>
              ) : null}
            </div>
            <h1 className="mt-4 lg:mt-5 font-display text-display-md md:text-display-lg lg:text-display-xl font-semibold text-primary-500 leading-[1.05] tracking-[-0.02em]">
              {initiative.title}
            </h1>
            {initiative.subtitle ? (
              <p className="mt-4 lg:mt-5 font-display text-xl md:text-2xl font-medium text-primary-500/70 leading-snug">
                {initiative.subtitle}
              </p>
            ) : null}
            <p className="mt-6 lg:mt-7 text-base lg:text-lg text-primary-500/80 leading-[1.7] max-w-3xl">
              {initiative.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {cover ? (
        <section className="px-5 md:px-20 lg:px-32 pb-10 md:pb-14 lg:pb-16">
          <div
            data-reveal="scale"
            className="mx-auto max-w-page relative aspect-16/9 lg:aspect-2/1 rounded-2xl lg:rounded-3xl overflow-hidden"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>
      ) : null}

      {/* Body */}
      {initiative.body && initiative.body.length > 0 ? (
        <section className="px-5 md:px-20 lg:px-32 pb-14 md:pb-20 lg:pb-24">
          <div
            data-reveal-stagger
            className="mx-auto max-w-3xl flex flex-col gap-5 lg:gap-6"
          >
            <PortableText
              value={initiative.body}
              components={bodyComponents}
            />
          </div>
        </section>
      ) : null}

      {/* Related initiatives */}
      {related.length > 0 ? (
        <section className="px-5 md:px-20 lg:px-32 pb-20 md:pb-28 lg:pb-32">
          <div className="mx-auto max-w-page">
            <div
              data-reveal-stagger
              className="flex items-end justify-between gap-4 mb-6 lg:mb-8"
            >
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
                More initiatives
              </h2>
              <Link
                href="/initiatives"
                className="group/all inline-flex items-center gap-3 text-sm lg:text-base font-medium text-primary-500 hover:opacity-80 transition-opacity"
              >
                <span className="hidden md:inline transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/all:-translate-x-0.5 motion-reduce:transform-none">
                  View all
                </span>
                <ArrowCircle
                  size={44}
                  className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/all:translate-x-1 group-hover/all:rotate-[8deg] motion-reduce:transform-none"
                />
              </Link>
            </div>

            <ul
              data-reveal-stagger
              className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
            >
              {related.map((item) => (
                <RelatedCard key={item._id} initiative={item} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function RelatedCard({ initiative }: { initiative: Initiative }) {
  const img = resolveImage(initiative.coverImage, { width: 700 });
  const href =
    initiative.externalLink ?? `/initiatives/${initiative.slug}`;
  const external = !!initiative.externalLink;
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex flex-col rounded-2xl lg:rounded-3xl bg-white overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
      >
        <div className="relative aspect-4/3 bg-warning-100">
          {img ? (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transform-none"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-2 p-5 lg:p-6">
          {initiative.featured ? (
            <div className="text-[11px] font-bold tracking-[0.12em] text-primary-500 uppercase">
              Featured
            </div>
          ) : null}
          <h3 className="font-display text-base lg:text-lg font-bold text-primary-500 leading-snug tracking-[-0.01em]">
            {initiative.title}
          </h3>
          <p className="text-sm text-primary-500/70 leading-relaxed line-clamp-3">
            {initiative.excerpt}
          </p>
        </div>
      </a>
    </li>
  );
}
