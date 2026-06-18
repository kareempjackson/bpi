import type { Metadata } from "next";

import PageSections from "@/app/components/PageSections";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveMedia } from "@/sanity/lib/image";
import {
  ALL_BLOG_POSTS_QUERY,
  ALL_TAGS_QUERY,
  BLOG_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  BlogPage,
  BlogPost,
  ResolvedMedia,
  TagRef,
} from "@/sanity/lib/types";
import BlogBrowser from "./BlogBrowser";
import type { BlogFeatured, BlogMedia, BlogPostCard } from "./types";

// Time-based backstop; on-demand revalidation comes from the publish webhook
// (TAG.post / TAG.tag / TAG.blogPage).
export const revalidate = 3600;

function cardMedia(
  cover: ResolvedMedia | null,
  contentType: BlogPost["contentType"],
): BlogMedia | null {
  if (cover) {
    if (cover.kind === "image") {
      return { kind: "image", src: cover.src, alt: cover.alt };
    }
    if (cover.kind === "video") {
      return { kind: "video", src: cover.src, poster: cover.poster, alt: cover.alt };
    }
    return { kind: "audio", src: cover.src, poster: cover.poster, alt: cover.alt };
  }
  // Resources/reports without a cover get the document tile.
  if (contentType === "resource" || contentType === "report") {
    return { kind: "file", label: "PDF" };
  }
  return null;
}

const mapTags = (tags?: TagRef[] | null) =>
  (tags ?? []).map((t) => ({ title: t.title, slug: t.slug, color: t.color }));

function toCard(p: BlogPost): BlogPostCard {
  return {
    id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    contentType: p.contentType,
    tags: mapTags(p.tags),
    media: cardMedia(resolveMedia(p.coverImage, { width: 900 }), p.contentType),
    externalLink: p.externalLink ?? null,
    wide: p.wideTile ?? false,
  };
}

function toFeatured(p: BlogPost): BlogFeatured {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    contentType: p.contentType,
    tags: mapTags(p.tags),
    media: cardMedia(resolveMedia(p.coverImage, { width: 1600 }), p.contentType),
    externalLink: p.externalLink ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await loadQuery<BlogPage | null>(BLOG_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.blogPage],
    stega: false,
  });
  return {
    title: page?.seoTitle ?? "Blog — BPI",
    description:
      page?.seoDescription ??
      "Articles, news, resources, and reports from Barbados Pharmaceutical Inc.",
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [page, allPosts, tags] = await Promise.all([
    loadQuery<BlogPage | null>(BLOG_PAGE_QUERY, {
      params: { lang },
      tags: [TAG.blogPage],
    }),
    loadQuery<BlogPost[] | null>(ALL_BLOG_POSTS_QUERY, {
      params: { lang },
      tags: [TAG.post],
    }),
    loadQuery<TagRef[] | null>(ALL_TAGS_QUERY, {
      params: { lang },
      tags: [TAG.tag],
    }),
  ]);

  const posts = allPosts ?? [];
  // Editor-chosen featured post, falling back to the most recent one.
  const featured = page?.featuredPost ?? posts[0] ?? null;
  // Don't repeat the featured post in the grid below.
  const gridPosts = featured
    ? posts.filter((p) => p._id !== featured._id)
    : posts;

  return (
    <main data-nav-theme="light" className="relative bg-error-25">
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-page">
          <h1 className="sr-only">Blog</h1>
          <BlogBrowser
            heading={page?.heading ?? "Gems for BPI"}
            intro={page?.intro ?? undefined}
            featured={featured ? toFeatured(featured) : null}
            posts={gridPosts.map(toCard)}
            tags={mapTags(tags)}
          />
        </div>
      </section>
      <PageSections sections={page?.pageSections} />
    </main>
  );
}
