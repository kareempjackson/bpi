import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal } from "@/app/components/motion";
import type { PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

/**
 * Page-builder renderer for the `richTextBlock` — the content workhorse. Framed
 * by the Zone (SectionFrame paints surface + rhythm + width), so it returns
 * only inner content: an optional heading over the shared PortableTextBody.
 */
export default function RichTextBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const body = (block.body as PortableTextBlock[] | null) ?? null;

  return (
    <Reveal className="mx-auto max-w-3xl">
      {heading ? (
        <h2 className="type-h2 balance-text mb-6 text-primary-500 lg:mb-8">
          {heading}
        </h2>
      ) : null}
      <PortableTextBody value={body} />
    </Reveal>
  );
}
