import MediaImage from "@/app/components/MediaImage";
import { Reveal } from "@/app/components/motion";
import { resolveMedia } from "@/sanity/lib/image";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `mediaBlock` — a full-bleed image or banner
 * video with an optional caption. Self-framed: it paints its own full-width
 * band. The variant only picks the band's aspect ratio; MediaImage renders
 * image or video from the resolved media kind.
 */
export default function MediaBlock({ block }: SectionComponentProps) {
  const caption = (block.caption as string) ?? undefined;
  const media = resolveMedia(
    block.media as Parameters<typeof resolveMedia>[0],
    { width: 2400 },
  );
  const banner = block.variant === "bannerVideo";
  const aspect = banner
    ? "aspect-video lg:aspect-[21/9]"
    : "aspect-4/3 sm:aspect-video lg:aspect-[2/1]";

  return (
    <section data-surface="dark" className="w-full bg-error-950">
      <Reveal preset="scale" className={`relative w-full ${aspect} overflow-hidden`}>
        {media ? (
          <MediaImage media={media} sizes="100vw" eager={banner} />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-error-950 text-base-white/30">
            <span className="type-caption">Media</span>
          </div>
        )}
      </Reveal>
      {caption ? (
        <div className="mx-auto max-w-page px-gutter">
          <p className="type-caption py-4 text-base-white/60">{caption}</p>
        </div>
      ) : null}
    </section>
  );
}
