import type { BlockSurface, BlockWidth } from "@/sanity/lib/blockCatalog";

import CardGridBlock from "./CardGridBlock";
import CareersSectionBlock from "./CareersSectionBlock";
import CarouselBlock from "./CarouselBlock";
import ContactRowsBlock from "./ContactRowsBlock";
import CtaSectionBlock from "./CtaSectionBlock";
import HeaderBlock from "./HeaderBlock";
import ListBlock from "./ListBlock";
import MediaBlock from "./MediaBlock";
import QuoteBlock from "./QuoteBlock";
import RichTextBlock from "./RichTextBlock";
import StatementSplitBlock from "./StatementSplitBlock";
import StatsBlock from "./StatsBlock";
import TabsBlock from "./TabsBlock";
import TeamBlock from "./TeamBlock";
import TimelineBlock from "./TimelineBlock";

/**
 * A block as projected by GROQ for the page-builder: always carries `_type`
 * and `_key`; the rest of the fields depend on the block type. Renderer
 * components narrow this to their own shape.
 */
export type RenderedBlock = {
  _type: string;
  _key: string;
  enabled?: boolean | null;
  /** Optional per-instance surface override resolved in GROQ from a brand colour. */
  surface?: BlockSurface | null;
  [field: string]: unknown;
};

export type SectionComponentProps = {
  block: RenderedBlock;
  index: number;
  /** Active route locale — for blocks that build localized links. */
  lang: string;
};

export type SectionComponent = (
  props: SectionComponentProps,
) => React.ReactNode;

export type RegistryEntry = {
  component: SectionComponent;
  /**
   * True when the block paints its own full-bleed band (own background +
   * padding) — the Zone renders it directly rather than wrapping it in a
   * SectionFrame. Content blocks that rely on the frame leave this false.
   */
  selfFramed?: boolean;
  /** Overrides the catalog defaults for this block's frame, when framed. */
  surface?: BlockSurface;
  width?: BlockWidth;
};

/**
 * `_type` → renderer registry for the page-builder. Generalises the old
 * two-type PageSections switch. Blocks are registered here as they are built
 * (Phase 3+); the Zone renders a block only if its `_type` is present.
 *
 * Keep this the one place a block's `_type` maps to a component so the Zone,
 * the styleguide, and any future consumer stay consistent.
 */
export const SECTION_REGISTRY: Record<string, RegistryEntry> = {
  // Heroes & Headers — reuse the SectorHeader (self-framed dark band).
  headerBlock: { component: HeaderBlock, selfFramed: true },
  // Content & Text — framed by the Zone's SectionFrame.
  richTextBlock: { component: RichTextBlock },
  statementSplitBlock: { component: StatementSplitBlock },
  // Stats & Metrics — framed.
  statsBlock: { component: StatsBlock },
  // Cards & Grids — framed.
  cardGridBlock: { component: CardGridBlock },
  // Lists & Tables — framed.
  listBlock: { component: ListBlock },
  contactRowsBlock: { component: ContactRowsBlock },
  // People & Team — framed.
  teamBlock: { component: TeamBlock },
  // Interactive — framed client (or server) components.
  timelineBlock: { component: TimelineBlock },
  tabsBlock: { component: TabsBlock },
  carouselBlock: { component: CarouselBlock },
  // Quotes — paints its own colour band (self-framed).
  quoteBlock: { component: QuoteBlock, selfFramed: true },
  // Media — full-bleed band (self-framed).
  mediaBlock: { component: MediaBlock, selfFramed: true },
  // Calls to Action — reuse the existing band components (self-framed).
  ctaSection: { component: CtaSectionBlock, selfFramed: true },
  careersSection: { component: CareersSectionBlock, selfFramed: true },
  // More blocks registered here as each category is built.
};
