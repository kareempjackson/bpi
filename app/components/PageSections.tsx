import { resolveMedia } from "@/sanity/lib/image";
import type { PageSection } from "@/sanity/lib/types";
import BuildingSection from "./BuildingSection";
import CareersSection from "./CareersSection";

/**
 * Renders a page's modular `pageSections` list (editor-managed in Sanity).
 * Each block resolves its own media (image OR video) and maps to the matching
 * section component, so a Call-to-action or Careers block can be added to any
 * page and configured independently.
 */
export default function PageSections({
  sections,
  contained = false,
}: {
  sections?: PageSection[] | null;
  /** Align the blocks to the host page's gutter + max-w-page container
   *  (used on priority detail pages). Off by default. */
  contained?: boolean;
}) {
  // A block with `enabled === false` is toggled off in Studio; skip it.
  const visible = sections?.filter((s) => s.enabled !== false);
  if (!visible?.length) return null;

  return (
    <>
      {visible.map((section) => {
        const media = resolveMedia(section.media, { width: 1600 });
        const imageSrc =
          media?.kind === "image" ? media.src : media?.poster;
        const videoSrc = media?.kind === "video" ? media.src : undefined;
        const imageAlt = media?.alt;

        if (section._type === "careersSection") {
          return (
            <CareersSection
              key={section._key}
              eyebrow={section.eyebrow ?? undefined}
              heading={section.heading ?? undefined}
              lead={section.lead ?? undefined}
              body={section.body ?? undefined}
              imageSrc={imageSrc}
              videoSrc={videoSrc}
              imageAlt={imageAlt}
              primaryLabel={section.primaryCta?.label}
              primaryHref={section.primaryCta?.href}
              secondaryLabel={section.secondaryCta?.label}
              secondaryHref={section.secondaryCta?.href}
              tone={section.tone === "blue" ? "blue" : "mint"}
              contained={contained}
            />
          );
        }

        // ctaSection → the BuildingSection layout.
        return (
          <BuildingSection
            key={section._key}
            heading={section.heading ?? undefined}
            body={section.body ?? undefined}
            imageSrc={imageSrc}
            videoSrc={videoSrc}
            imageAlt={imageAlt}
            primaryLabel={section.primaryCta?.label}
            primaryHref={section.primaryCta?.href}
            secondaryLabel={section.secondaryCta?.label}
            secondaryHref={section.secondaryCta?.href}
            tone={section.tone === "blue" ? "blue" : "green"}
            contained={contained}
          />
        );
      })}
    </>
  );
}
