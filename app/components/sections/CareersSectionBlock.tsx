import { resolveMedia } from "@/sanity/lib/image";
import type { PortableTextBlock } from "@/sanity/lib/types";

import CareersSection from "../CareersSection";
import type { SectionComponentProps } from "./registry";

type Cta = { label?: string; href?: string } | null | undefined;

/**
 * Page-builder renderer for the `careersSection` block. Adapts the
 * GROQ-projected block to the existing CareersSection band. Self-framed.
 */
export default function CareersSectionBlock({ block }: SectionComponentProps) {
  const media = resolveMedia(
    block.media as Parameters<typeof resolveMedia>[0],
    { width: 1600 },
  );
  const primary = block.primaryCta as Cta;
  const secondary = block.secondaryCta as Cta;

  return (
    <CareersSection
      eyebrow={(block.eyebrow as string) ?? undefined}
      heading={(block.heading as string) ?? undefined}
      lead={(block.lead as string) ?? undefined}
      body={(block.body as PortableTextBlock[] | string | null) ?? undefined}
      imageSrc={media?.kind === "image" ? media.src : media?.poster}
      videoSrc={media?.kind === "video" ? media.src : undefined}
      imageAlt={media?.alt}
      primaryLabel={primary?.label}
      primaryHref={primary?.href}
      secondaryLabel={secondary?.label}
      secondaryHref={secondary?.href}
      tone={block.tone === "blue" ? "blue" : "mint"}
    />
  );
}
