import type { BlockSurface, BlockWidth } from "@/sanity/lib/blockCatalog";

/**
 * The auto-styling wrapper the rhythm engine puts around every framed block.
 * It owns the three things an editor never has to think about:
 *   • vertical rhythm — one consistent responsive section padding everywhere,
 *   • surface — the resolved background/ink tone (sequenced by the Zone),
 *   • width — full-bleed vs the page container vs a narrow measure.
 * Blocks that paint their own band (CTAs, heroes) are rendered without this
 * frame (see registry `selfFramed`).
 */

const SURFACE_CLASS: Record<BlockSurface, string> = {
  // brand surfaces are painted by the block itself; treat as transparent here.
  brand: "",
  light: "bg-error-25 text-primary-500",
  white: "bg-base-white text-primary-500",
  dark: "bg-error-950 text-base-white",
};

function widthClass(width: BlockWidth): string {
  switch (width) {
    case "full":
      return "w-full";
    case "narrow":
      return "mx-auto w-full max-w-3xl px-gutter";
    case "contained":
    default:
      return "mx-auto w-full max-w-page px-gutter";
  }
}

export default function SectionFrame({
  surface,
  width,
  contained = false,
  children,
}: {
  surface: BlockSurface;
  width: BlockWidth;
  /** When the host page already provides the container, don't add another. */
  contained?: boolean;
  children: React.ReactNode;
}) {
  const inner = contained && width !== "full" ? "w-full" : widthClass(width);
  return (
    <section
      data-surface={surface}
      // One rhythm for every framed section → intentional vertical cadence.
      className={`w-full py-20 md:py-28 lg:py-32 ${SURFACE_CLASS[surface]}`}
    >
      <div className={inner}>{children}</div>
    </section>
  );
}
