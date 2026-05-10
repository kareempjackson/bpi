import Image from "next/image";
import ArrowRight from "./ArrowRight";
import Button from "./Button";
import BlogPostShape from "./shapes/BlogPostShape";

type Pillar = "Alliance" | "Sovereignty" | "Dignity";

type Post = {
  pillar: Pillar;
  title: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  heading?: string;
  viewAllHref?: string;
  posts?: Post[];
};

const DEFAULT_POSTS: Post[] = [
  {
    pillar: "Alliance",
    title:
      "First pharmaceutical cargo between Africa and the Caribbean departs Kaduna for Bridgetown",
    href: "/news/first-cargo-kaduna-bridgetown",
    imageAlt: "Cargo truck departing manufacturing facility at sunrise",
  },
  {
    pillar: "Sovereignty",
    title: "BMPRA regulatory framework moves to next phase in partnership with WHO",
    href: "/news/bmpra-who-partnership",
    imageAlt: "United Nations emblem",
  },
  {
    pillar: "Dignity",
    title:
      "Queen Elizabeth Hospital receives first shipment from the AMA IV fluids corridor",
    href: "/news/qeh-ama-iv-fluids",
    imageAlt: "Queen Elizabeth Hospital exterior",
  },
];

export default function BlogSection({
  heading = "Latest from BPI",
  viewAllHref = "/news",
  posts = DEFAULT_POSTS,
}: Props) {
  return (
    <section data-nav-theme="light" className="bg-error-25 px-8 md:px-16 lg:px-28 py-10 md:py-14 lg:py-20">
      <div className="mx-auto max-w-page rounded-lg bg-warning-50 px-4 md:px-6 lg:px-8 py-5 md:py-6 lg:py-8">
        <div data-reveal-stagger className="flex items-center justify-between gap-4 mb-5 md:mb-7">
          <h2 className="font-display text-xl md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1]">
            {heading}
          </h2>
          <a
            href={viewAllHref}
            className="flex items-center gap-2 text-primary-500 hover:opacity-70 transition-opacity"
          >
            <span className="text-xs font-semibold">View all</span>
            <Button
              variant="tertiary"
              iconOnly="sm"
              aria-label="View all news"
              tabIndex={-1}
            >
              <ArrowRight />
            </Button>
          </a>
        </div>

        <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {posts.map((post) => (
            <BlogCard key={post.href} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: Post }) {
  return (
    <a href={post.href} className="block group">
      <BlogPostShape size={280} fill="#ffffff">
        <div className="absolute inset-0">
          <div className="px-4 md:px-5 pt-5 md:pt-6 pr-6">
            <div className="text-[10px] font-bold tracking-[0.12em] text-primary-500 uppercase">
              {post.pillar}
            </div>
            <h3 className="mt-2 text-xs md:text-sm text-primary-500 leading-[1.35] group-hover:opacity-80 transition-opacity">
              {post.title}
            </h3>
          </div>

          <div className="absolute left-[5%] bottom-[5%] w-[42%] aspect-square rounded-sm overflow-hidden bg-warning-100">
            {post.imageSrc ? (
              <Image
                src={post.imageSrc}
                alt={post.imageAlt ?? ""}
                fill
                sizes="(min-width: 768px) 18vw, 42vw"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="absolute right-[4%] bottom-[4%]">
            <Button
              variant="tertiary-light"
              iconOnly="sm"
              aria-label={`Read: ${post.title}`}
              tabIndex={-1}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      </BlogPostShape>
    </a>
  );
}
