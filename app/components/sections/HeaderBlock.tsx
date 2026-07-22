import SectorHeader, {
  type SectorHeaderLayout,
} from "@/app/[lang]/(site)/sectors/[slug]/SectorHeader";
import { resolveMedia } from "@/sanity/lib/image";

import type { SectionComponentProps } from "./registry";

const LAYOUTS: SectorHeaderLayout[] = [
  "split",
  "centered",
  "sideBySide",
  "overlay",
  "showcase",
  "spotlight",
  "masthead",
];

type Cta = { label?: string; href?: string } | null | undefined;

/**
 * Page-builder renderer for the `headerBlock`. Maps the block's `layout`
 * variant onto the reusable SectorHeader (seven on-brand header layouts) so a
 * hero can be dropped into any zone. Self-framed: it paints its own band.
 */
export default function HeaderBlock({ block, lang }: SectionComponentProps) {
  const layout = LAYOUTS.includes(block.layout as SectorHeaderLayout)
    ? (block.layout as SectorHeaderLayout)
    : "split";
  const media = resolveMedia(
    block.media as Parameters<typeof resolveMedia>[0],
    { width: 2000 },
  );

  return (
    <SectorHeader
      title={(block.title as string) ?? ""}
      subtitle={(block.subtitle as string) ?? undefined}
      primaryCta={block.primaryCta as Cta}
      secondaryCta={block.secondaryCta as Cta}
      heroMedia={media}
      pageColor={(block.pageColor as string) ?? "#01190D"}
      headingColor={(block.headingColor as string) ?? undefined}
      layout={layout}
      lang={lang}
    />
  );
}
