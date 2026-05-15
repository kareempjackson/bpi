import LazyVideo from "../LazyVideo";

/**
 * Renders an SVG `<image>` (still) or `<foreignObject>` (video) clipped
 * to the parent shape's silhouette. Used inside every shape component so
 * any "image" upload can be swapped for a video upload without each
 * shape having to re-implement the branching.
 *
 * Returns SVG elements; mount inside an `<svg>` that defines a
 * `<clipPath id={clipId}>` matching the shape silhouette.
 */
type Props = {
  x?: number | string;
  y?: number | string;
  width: number | string;
  height: number | string;
  clipId: string;
  imageSrc?: string;
  imageAlt?: string;
  videoSrc?: string;
  imagePosition?: string;
  /**
   * Kept for backwards compatibility — was previously used to apply a
   * CSS `clip-path: path()` on the foreignObject contents as a Safari
   * workaround, but that approach distorted the SVG's natural layout.
   * The clip is now handled by the standard `<g clipPath>` wrap which
   * preserves proportions across browsers; the prop is ignored.
   */
  pathD?: string;
};

export default function ShapeMedia({
  x = 0,
  y = 0,
  width,
  height,
  clipId,
  imageSrc,
  imageAlt = "",
  videoSrc,
  imagePosition = "xMidYMid slice",
}: Props) {
  if (videoSrc) {
    // Wrap the foreignObject in a clipped `<g>` so the silhouette
    // applies to the video content. Safari occasionally fails to fire
    // IntersectionObserver inside foreignObject, in which case the
    // <source> never renders and the `poster` image (passed through
    // to LazyVideo) is what shows — still clipped by the `<g>`, so
    // the silhouette is preserved even when the video can't load.
    return (
      <g clipPath={`url(#${clipId})`}>
        <foreignObject x={x} y={y} width={width} height={height}>
          <LazyVideo
            src={videoSrc}
            poster={imageSrc}
            ariaLabel={imageAlt || undefined}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </foreignObject>
      </g>
    );
  }
  if (!imageSrc) return null;
  // Wrap the `<image>` in a `<g clip-path>` rather than putting
  // `clip-path` directly on the `<image>` element. Safari silently
  // drops the reference in some configurations when applied directly,
  // leaving the photo showing as a plain rectangle instead of the
  // silhouette.
  return (
    <g clipPath={`url(#${clipId})`}>
      <image
        href={imageSrc}
        x={x}
        y={y}
        width={width}
        height={height}
        preserveAspectRatio={imagePosition}
      />
    </g>
  );
}
