import Image from "next/image";
import ArrowCircle from "./ArrowCircle";
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
    <section data-nav-theme="light" className="bg-error-25 px-12 md:px-20 lg:px-32 py-10 md:py-14 lg:py-20">
      <div className="mx-auto max-w-page rounded-lg bg-warning-50 px-4 md:px-6 lg:px-8 py-5 md:py-6 lg:py-8">
        <div data-reveal-stagger className="flex items-center justify-between gap-4 mb-5 md:mb-7">
          <h2 className="font-display text-xl md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1]">
            {heading}
          </h2>
          <a
            href={viewAllHref}
            className="group/viewall flex items-center gap-3 text-primary-500 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-80 focus-visible:outline-none focus-visible:opacity-100"
          >
            <span className="text-base lg:text-lg font-normal transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:-translate-x-0.5 motion-reduce:transform-none">
              View all
            </span>
            <ArrowCircle
              size={48}
              className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewall:translate-x-1 group-hover/viewall:rotate-[8deg] motion-reduce:transform-none"
            />
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
    <a
      href={post.href}
      className="block group transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline-none"
    >
      <BlogPostShape size={360} fill="#ffffff">
        <div className="absolute inset-0">
          <div className="px-5 md:px-6 pt-6 md:pt-7 pr-7">
            <div className="text-[11px] font-bold tracking-[0.12em] text-primary-500 uppercase">
              {post.pillar}
            </div>
            <h3 className="mt-2 text-sm md:text-base text-primary-500 leading-[1.35] group-hover:opacity-80 transition-opacity">
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
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] motion-reduce:transform-none"
              />
            ) : null}
          </div>

          <div className="absolute right-[5%] bottom-[5%]">
            <ArrowCircle
              size={44}
              className="text-primary-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:rotate-[8deg] motion-reduce:transform-none"
            />
          </div>
        </div>
      </BlogPostShape>
    </a>
  );
}
