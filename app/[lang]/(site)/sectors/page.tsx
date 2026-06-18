import type { Metadata } from "next";
import Image from "next/image";

import BuildingSection from "@/app/components/BuildingSection";
import CtaLink from "@/app/components/CtaLink";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage, resolveMedia } from "@/sanity/lib/image";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";
import type {
  HomePage,
  ResolvedMedia,
  SectorNode,
} from "@/sanity/lib/types";

export const revalidate = 3600;

// Poster/still for a resolved media object (image src, or a video's poster).
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

// The six sectors are authored on the Home page document (molecule diagram).
// Reuse that data here so the two stay in sync.
async function getHomePage(lang: string): Promise<HomePage | null> {
  return loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.homePage],
  });
}

// Still image for a sector node — the uploaded image, or a video's poster.
function sectorStill(node: SectorNode): { src: string; alt: string } | null {
  const poster =
    node.media?.kind === "video" ? node.media.videoPoster : node.media?.image;
  const img = resolveImage(poster ?? null, { width: 800 });
  return img ? { src: img.src, alt: img.alt || node.title } : null;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sectors — BPI",
    description:
      "The six sectors BPI is building across — each a structural component of the Caribbean's pharmaceutical future.",
  };
}

export default async function SectorsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const data = await getHomePage(lang);
  const nodes = data?.sectorsNodes ?? [];
  const buildingMedia = resolveMedia(data?.buildingImage, { width: 1600 });

  return (
    <main className="bg-error-25">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-28 md:pt-32 lg:pt-36 pb-10 md:pb-14 lg:pb-16">
        <div data-reveal-stagger className="mx-auto max-w-page">
          <p className="text-xs md:text-sm font-semibold tracking-[0.18em] text-primary-500/65 uppercase">
            Our Sectors
          </p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-md lg:text-display-lg font-bold text-primary-500 leading-[1.04] tracking-[-0.02em] max-w-4xl">
            {data?.sectorsHeading ?? "Building across six sectors"}
          </h1>
          {data?.sectorsBody ? (
            <p className="mt-5 text-base md:text-lg text-primary-500/70 leading-relaxed max-w-2xl">
              {data.sectorsBody}
            </p>
          ) : null}
        </div>
      </section>

      {/* Sector grid */}
      {nodes.length > 0 ? (
        <section className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24 lg:pb-32">
          <div
            data-reveal-stagger
            className="mx-auto grid max-w-page grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-7"
          >
            {nodes.map((node) => (
              <SectorCard key={node.nodeId} node={node} />
            ))}
          </div>
        </section>
      ) : (
        <section className="px-6 md:px-12 lg:px-20 xl:px-28 pb-20">
          <div className="mx-auto max-w-page text-primary-500/60">
            Sectors haven&rsquo;t been configured yet. Add them on the Home page
            document (Sectors group) in Sanity.
          </div>
        </section>
      )}

      {/* Footer CTA — reused from the Home page. */}
      <BuildingSection
        imageSrc={mediaImageSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        headlineLine1={data?.buildingHeadlineLine1}
        headlineLine2={data?.buildingHeadlineLine2}
        primaryLabel={data?.buildingPrimaryCta?.label ?? undefined}
        primaryHref={data?.buildingPrimaryCta?.href ?? undefined}
        secondaryLabel={data?.buildingSecondaryCta?.label ?? undefined}
        secondaryHref={data?.buildingSecondaryCta?.href ?? undefined}
      />
    </main>
  );
}

function SectorCard({ node }: { node: SectorNode }) {
  const still = sectorStill(node);
  // Link out only when the editor set an explicit destination; otherwise the
  // card is display-only (there are no per-sector detail pages yet).
  const href = node.href ?? undefined;

  const inner = (
    <>
      {still ? (
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl lg:rounded-2xl bg-primary-500/5">
          <Image
            src={still.src}
            alt={still.alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover/sector:scale-[1.03] motion-reduce:transform-none"
          />
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.14em] text-primary-500/55 uppercase">
          {node.num}
        </span>
        <h2 className="font-display text-xl lg:text-2xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
          {node.title}
        </h2>
        {node.description ? (
          <p className="text-sm lg:text-base text-primary-500/75 leading-relaxed">
            {node.description}
          </p>
        ) : null}
      </div>
    </>
  );

  const cls =
    "group/sector block rounded-2xl lg:rounded-3xl bg-white p-5 lg:p-6 transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(0,0,54,0.25)]";

  return href ? (
    <CtaLink
      href={href}
      className={`${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30`}
    >
      {inner}
    </CtaLink>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
