import Image from "next/image";

import ArrowCircle from "./ArrowCircle";
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
};

type Props = {
  heading?: string;
  viewAllHref?: string;
  posts?: BlogSectionPost[];
};

/**
 * Placeholder cards shown when no `post` documents exist yet in Sanity.
 * As soon as the editor publishes a real post, the live list takes over.
 * Keeping these here means the section never renders as an empty/placeholder
 * panel during the bootstrap phase of the site.
 */
const DEMO_POSTS: BlogSectionPost[] = [
  {
    title: "Barbados and Nigeria Sign Landmark Pharmaceutical MOU",
    excerpt:
      "Barbados Pharmaceutical Inc. and Nigeria's Presidential Initiative for Unlocking the Healthcare Value Chain have signed a Memorandum of Understanding. The first pharmaceutical manufacturing partnership of its kind between Africa and the Caribbean.",
    href: "#",
    imageSrc: "/images/A6701522.jpg",
    imageAlt: "BPI and Nigerian officials at MOU signing ceremony",
  },
  {
    title:
      "The Caribbean Is Getting Its First IV Fluids Manufacturing Facility — and It's Being Built in Barbados",
    excerpt:
      "The Caribbean imports almost every IV fluid it uses. That changes with the construction of a $31.3 million pharmaceutical manufacturing facility at the Grantley Adams Industrial Estate. A joint venture between Barbados Pharmaceutical Inc. and Nigeria's AMA Medical Manufacturing, with capacity for 12 million units a year. The first of its kind in the region.",
    href: "#",
    imageSrc: "/images/A6701488.jpg",
    imageAlt:
      "Pharmaceutical manufacturing line at Grantley Adams Industrial Estate",
  },
  {
    title:
      "Barbados Pharmaceutical Inc. Meets WHO and WTO Directors General in Geneva",
    excerpt:
      "A small island. A big agenda. Barbados Pharmaceutical Inc. held high level meetings in Geneva with Dr. Tedros Adhanom Ghebreyesus, Director General of the World Health Organization, and Dr. Ngozi Okonjo-Iweala, Director General of the World Trade Organization. These were not courtesy meetings. BPI came with a case and the world's top multilateral leaders heard it.",
    href: "#",
    imageSrc: "/images/DSC03249.jpg",
    imageAlt: "BPI leadership at WHO/WTO meetings in Geneva",
  },
];

export default function BlogSection({
  heading = "Latest from BPI",
  viewAllHref = "/blog",
  posts,
}: Props) {
  // Fall back to placeholder cards while no published posts exist yet, so
  // the section never renders as an empty "No news yet" panel during
  // bootstrap. Once a real post lands, the editor's list takes over.
  const resolved = posts && posts.length > 0 ? posts : DEMO_POSTS;
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
      className="block group transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline-none"
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
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] motion-reduce:transform-none"
            />
          ) : null}
        </div>
      </BlogPostShape>
    </CtaLink>
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
