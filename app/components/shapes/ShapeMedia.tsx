/**
 * Renders either an SVG `<image>` or an `<foreignObject>` containing a
 * looping muted `<video>`, both clipped to a parent `<clipPath>`. Used
 * inside the shape components so any "image" upload can be swapped for a
 * video upload without each shape having to re-implement the branching.
 *
 * The component returns SVG elements; mount it inside a `<defs>`-paired
 * `<svg>` that defines `clipPath` `id={clipId}`.
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
    // Clip the wrapping `<g>` rather than the `<foreignObject>` itself —
    // Safari and Firefox both render `clipPath` unreliably when set
    // directly on a foreignObject. Applying it to the parent group
    // produces the same visual clip and works everywhere.
    return (
      <g clipPath={`url(#${clipId})`}>
        <foreignObject x={x} y={y} width={width} height={height}>
          <video
            src={videoSrc}
            poster={imageSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disableRemotePlayback
            disablePictureInPicture
            aria-label={imageAlt || undefined}
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
  return (
    <image
      href={imageSrc}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio={imagePosition}
      clipPath={`url(#${clipId})`}
    />
  );
}
