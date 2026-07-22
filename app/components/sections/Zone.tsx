import {
  getBlock,
  type BlockSurface,
  type BlockWidth,
} from "@/sanity/lib/blockCatalog";

import SectionFrame from "./SectionFrame";
import { SECTION_REGISTRY, type RenderedBlock } from "./registry";

/**
 * The premium rhythm engine. Renders an insertion zone's blocks so that any
 * combination reads as intentional, without the editor setting spacing,
 * background, or width:
 *   • dispatches each block to its registered renderer,
 *   • frames content blocks in <SectionFrame> (consistent rhythm + width),
 *   • sequences surfaces so two identical light bands never sit adjacent
 *     (auto-alternates light ↔ white).
 * Self-framed blocks (CTAs, heroes) paint their own band and are rendered
 * directly. Unknown/unbuilt block types are skipped (a dev-only note in
 * development) so an in-progress catalog never crashes a page.
 */

/** Resolve a block's base surface: explicit per-instance → catalog default. */
function baseSurface(block: RenderedBlock): BlockSurface {
  if (
    block.surface === "light" ||
    block.surface === "white" ||
    block.surface === "dark" ||
    block.surface === "brand"
  ) {
    return block.surface;
  }
  return getBlock(block._type)?.surface ?? "light";
}

type PlanItem =
  | { kind: "unknown"; block: RenderedBlock; index: number }
  | { kind: "self"; block: RenderedBlock; index: number }
  | {
      kind: "framed";
      block: RenderedBlock;
      index: number;
      surface: BlockSurface;
      width: BlockWidth;
    };

/**
 * Pure pre-pass: resolve each block's render mode and sequence framed
 * surfaces (kept out of the JSX so nothing is reassigned during render).
 */
function planZone(blocks: RenderedBlock[]): PlanItem[] {
  const plan: PlanItem[] = [];
  let prevFramedSurface: BlockSurface | null = null;

  blocks.forEach((block, index) => {
    const entry = SECTION_REGISTRY[block._type];
    if (!entry) {
      plan.push({ kind: "unknown", block, index });
      return;
    }
    if (entry.selfFramed) {
      prevFramedSurface = null;
      plan.push({ kind: "self", block, index });
      return;
    }

    let surface = entry.surface ?? baseSurface(block);
    if (
      (surface === "light" || surface === "white") &&
      surface === prevFramedSurface
    ) {
      surface = surface === "light" ? "white" : "light";
    }
    prevFramedSurface = surface;

    const width = entry.width ?? getBlock(block._type)?.width ?? "contained";
    plan.push({ kind: "framed", block, index, surface, width });
  });

  return plan;
}

export default function Zone({
  blocks,
  lang = "en",
  contained = false,
}: {
  blocks?: RenderedBlock[] | null;
  /** Active route locale, threaded to blocks that build localized links. */
  lang?: string;
  /** Host page already provides the gutter/container (detail templates). */
  contained?: boolean;
}) {
  const visible = blocks?.filter((b) => b && b.enabled !== false);
  if (!visible?.length) return null;

  const plan = planZone(visible);

  return (
    <>
      {plan.map((item) => {
        if (item.kind === "unknown") {
          if (process.env.NODE_ENV === "development") {
            return (
              <div
                key={item.block._key}
                className="mx-auto max-w-page px-gutter py-6 text-sm text-primary-500/60"
              >
                {`⚠ Block "${item.block._type}" is catalogued but not yet built — skipped.`}
              </div>
            );
          }
          return null;
        }

        const Component = SECTION_REGISTRY[item.block._type].component;

        if (item.kind === "self") {
          return (
            <Component
              key={item.block._key}
              block={item.block}
              index={item.index}
              lang={lang}
            />
          );
        }

        return (
          <SectionFrame
            key={item.block._key}
            surface={item.surface}
            width={item.width}
            contained={contained}
          >
            <Component block={item.block} index={item.index} lang={lang} />
          </SectionFrame>
        );
      })}
    </>
  );
}
