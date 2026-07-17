import MediaImage from "@/app/components/MediaImage";
import { Parallax, Reveal } from "@/app/components/motion";
import type { ResolvedMedia } from "@/sanity/lib/types";

/**
 * Full-width about-page banner. The media sits in a `Parallax` that is
 * oversized ±12% and clipped by the `overflow-hidden` frame, so it drifts as
 * the page scrolls. Renders video or image transparently via `MediaImage`.
 */
export default function AboutBannerVideo({ media }: { media: ResolvedMedia }) {
  return (
    <Reveal
      preset="scale"
      className="relative aspect-4/3 md:aspect-video rounded-lg overflow-hidden"
    >
      <Parallax
        speed={0.06}
        className="absolute inset-x-0 top-[-12%] bottom-[-12%]"
      >
        <MediaImage media={media} sizes="100vw" eager />
      </Parallax>
    </Reveal>
  );
}
