import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { resolveMedia } from "@/sanity/lib/image";
import type { Leader, PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `teamBlock`. Framed by the Zone. A responsive
 * grid of leader portrait cards (image + name + role, with an optional short
 * bio). Static by design — reuses the shared `leader` model; the about-page
 * bio modal is page-coupled and intentionally not reused here.
 */
export default function TeamBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const members = (block.members as Leader[] | null) ?? [];

  if (!members.length && !heading) return null;

  return (
    <div className="mx-auto max-w-page">
      {heading ? (
        <Reveal className="mb-10 max-w-2xl lg:mb-14">
          <h2 className="type-h2 balance-text text-primary-500">{heading}</h2>
        </Reveal>
      ) : null}

      {members.length ? (
        <Stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {members.map((member, i) => {
            const portrait = resolveMedia(member.image, { width: 800 });
            const bio = Array.isArray(member.bio)
              ? (member.bio as PortableTextBlock[])
              : null;
            return (
              <StaggerItem
                key={`${member.name ?? "member"}-${i}`}
                preset="scale"
                className="flex flex-col gap-4"
              >
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-primary-500/5">
                  {portrait ? (
                    <MediaImage
                      media={portrait}
                      sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  {member.name ? (
                    <h3 className="type-card-heading text-primary-500">
                      {member.name}
                    </h3>
                  ) : null}
                  {member.role ? (
                    <p className="type-body-sm text-primary-500/60">
                      {member.role}
                    </p>
                  ) : null}
                </div>
                {bio ? (
                  <PortableTextBody
                    value={bio}
                    compact
                    className="type-body-sm text-primary-500/70"
                  />
                ) : null}
              </StaggerItem>
            );
          })}
        </Stagger>
      ) : null}
    </div>
  );
}
