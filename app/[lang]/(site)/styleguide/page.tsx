import type { Metadata } from "next";

import {
  BLOCKS,
  CATEGORY_ORDER,
  CATEGORY_TITLES,
  type CatalogBlock,
} from "@/sanity/lib/blockCatalog";
import { COLOR_ROLES, TYPE_STYLES } from "@/sanity/lib/brandTokens";
import Zone from "@/app/components/sections/Zone";
import { SECTION_REGISTRY, type RenderedBlock } from "@/app/components/sections/registry";
import { sampleBlock } from "./samples";

// Internal reference page — never index it.
export const metadata: Metadata = {
  title: "Design library — BPI",
  robots: { index: false, follow: false },
};

/** The class name for a brand type style, derived from its CSS-var prefix. */
function typeClass(cssPrefix: string): string {
  return cssPrefix.replace("--brand-", "type-");
}

function Foundations() {
  return (
    <section
      data-block="foundations"
      className="mx-auto max-w-page px-gutter py-16"
    >
      <h2 className="type-h1 mb-8 text-primary-500">Foundations</h2>

      {/* Palette */}
      <h3 className="type-h3 mb-4 text-primary-500">Colours</h3>
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {COLOR_ROLES.map((role) => (
          <div key={role.key} data-block={`foundations-color-${role.key}`}>
            <div
              className="mb-2 h-24 w-full rounded-lg border border-primary-500/10"
              style={{ background: `var(${role.cssVar}, ${role.default})` }}
            />
            <div className="type-label text-primary-500">{role.label}</div>
            <div className="type-caption text-primary-500/60">
              {role.default}
            </div>
          </div>
        ))}
      </div>

      {/* Type scale */}
      <h3 className="type-h3 mb-4 text-primary-500">Typography</h3>
      <div className="flex flex-col gap-6">
        {TYPE_STYLES.map((style) => (
          <div
            key={style.key}
            data-block={`foundations-type-${style.key}`}
            className="border-b border-primary-500/10 pb-6"
          >
            <div className="type-caption mb-1 text-primary-500/60">
              {style.label}
            </div>
            <div className={`${typeClass(style.cssPrefix)} text-primary-500`}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockEntry({ block, lang }: { block: CatalogBlock; lang: string }) {
  const built = block.available && SECTION_REGISTRY[block.type];

  if (built) {
    // Render each variant (or the single form) as its own screenshot target.
    const variants = block.variants?.length
      ? block.variants
      : [{ value: "", title: block.title }];
    return (
      <>
        {variants.map((v) => {
          const sample = sampleBlock(block.type, v.value) as RenderedBlock;
          return (
            <div
              key={`${block.type}-${v.value}`}
              data-block={`${block.type}${v.value ? `-${v.value}` : ""}`}
            >
              <Zone blocks={[sample]} lang={lang} />
            </div>
          );
        })}
      </>
    );
  }

  // Not built yet — a catalogue placeholder so the roadmap is visible.
  return (
    <div
      data-block={block.type}
      className="rounded-lg border border-dashed border-primary-500/20 p-5"
    >
      <div className="type-card-heading text-primary-500">{block.title}</div>
      <p className="type-body-sm mt-1 text-primary-500/70">
        {block.description}
      </p>
      {block.variants?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {block.variants.map((v) => (
            <span
              key={v.value}
              className="type-caption rounded-full bg-primary-500/5 px-2.5 py-1 text-primary-500/70"
            >
              {v.title}
            </span>
          ))}
        </div>
      ) : null}
      <div className="type-caption mt-3 text-primary-500/40">Coming soon</div>
    </div>
  );
}

export default async function StyleguidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <main className="bg-error-25">
      <div className="mx-auto max-w-page px-gutter pt-24 pb-8">
        <h1 className="type-display text-primary-500">Design library</h1>
        <p className="type-lead mt-2 text-primary-500/70">
          Every brand foundation and section block, in one place.
        </p>
      </div>

      <Foundations />

      {CATEGORY_ORDER.map((cat) => {
        const blocks = BLOCKS.filter((b) => b.category === cat);
        if (!blocks.length) return null;
        const built = blocks.filter(
          (b) => b.available && SECTION_REGISTRY[b.type],
        );
        const pending = blocks.filter(
          (b) => !(b.available && SECTION_REGISTRY[b.type]),
        );
        return (
          <section key={cat} className="py-10">
            <h2 className="type-h2 mx-auto mb-6 max-w-page px-gutter text-primary-500">
              {CATEGORY_TITLES[cat]}
            </h2>
            {/* Built blocks render full-width (each variant stacked). */}
            {built.map((block) => (
              <div key={block.type} className="mb-10">
                <BlockEntry block={block} lang={lang} />
              </div>
            ))}
            {/* Not-yet-built blocks show as catalogue placeholders. */}
            {pending.length ? (
              <div className="mx-auto grid max-w-page grid-cols-1 gap-5 px-gutter sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((block) => (
                  <BlockEntry key={block.type} block={block} lang={lang} />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </main>
  );
}
