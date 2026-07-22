"use client";

import {
  BLOCKS,
  CATEGORY_ORDER,
  CATEGORY_TITLES,
  thumbnailPath,
  type CatalogBlock,
} from "../lib/blockCatalog";
import { COLOR_ROLES, TYPE_STYLES, FONT_VAR } from "../lib/brandTokens";

/**
 * "Design library" — a browsable, in-Studio gallery of the whole design
 * language so non-technical editors can SEE every brand foundation and section
 * block (with thumbnails, descriptions, and variants) before building a page.
 * Registered as a Studio tool in sanity.config.ts.
 *
 * Reads the same single sources of truth as everything else — blockCatalog.ts
 * and brandTokens.ts — so it never drifts from what's actually insertable.
 * Styled with plain inline styles + Studio CSS variables (no @sanity/ui
 * dependency), matching the existing custom input components.
 */

const FONT_LABEL: Record<string, string> = {
  display: "Albert Sans",
  sans: "Metropolis",
};

function Swatch({
  label,
  hex,
}: {
  label: string;
  hex: string;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          height: 72,
          borderRadius: 8,
          background: hex,
          border: "1px solid var(--card-border-color, #e6e8eb)",
        }}
      />
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "ui-monospace, Menlo, monospace",
          color: "var(--card-muted-fg-color, #6b7280)",
        }}
      >
        {hex}
      </div>
    </div>
  );
}

function BlockCard({ block }: { block: CatalogBlock }) {
  return (
    <div
      style={{
        border: "1px solid var(--card-border-color, #e6e8eb)",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--card-bg-color, #fff)",
        opacity: block.available ? 1 : 0.6,
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: "var(--card-muted-bg-color, #f2f4f7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailPath(block.type)}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: "var(--card-muted-fg-color, #98a2b3)",
          }}
        >
          {block.type}
        </span>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{block.title}</span>
          {!block.available ? (
            <span
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "2px 6px",
                borderRadius: 999,
                background: "var(--card-muted-bg-color, #f2f4f7)",
                color: "var(--card-muted-fg-color, #6b7280)",
              }}
            >
              Coming soon
            </span>
          ) : null}
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "var(--card-muted-fg-color, #475467)",
          }}
        >
          {block.description}
        </p>
        {block.variants?.length ? (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {block.variants.map((v) => (
              <span
                key={v.value}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--card-muted-bg-color, #f2f4f7)",
                  color: "var(--card-muted-fg-color, #475467)",
                }}
              >
                {v.title}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DesignLibraryTool() {
  return (
    <div
      style={{
        padding: 32,
        maxWidth: 1200,
        margin: "0 auto",
        color: "var(--card-fg-color, inherit)",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
        Design library
      </h1>
      <p
        style={{
          margin: "0 0 32px",
          color: "var(--card-muted-fg-color, #475467)",
        }}
      >
        Every brand foundation and section block in one place. Add these to any
        page from the page&#8209;sections field.
      </p>

      {/* Foundations — colours */}
      <Section title="Colours">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 16,
          }}
        >
          {COLOR_ROLES.map((role) => (
            <Swatch key={role.key} label={role.label} hex={role.default} />
          ))}
        </div>
      </Section>

      {/* Foundations — typography */}
      <Section title="Typography">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TYPE_STYLES.map((s) => (
            <div
              key={s.key}
              style={{
                borderBottom: "1px solid var(--card-border-color, #eaecf0)",
                paddingBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--card-muted-fg-color, #6b7280)",
                  marginBottom: 4,
                }}
              >
                {s.label} · {FONT_LABEL[s.default.font]} · {s.default.size} ·{" "}
                {s.default.weight}
              </div>
              <div
                style={{
                  fontFamily: FONT_VAR[s.default.font],
                  fontSize: s.default.size,
                  fontWeight: Number(s.default.weight),
                  letterSpacing: s.default.letterSpacing,
                  lineHeight: s.default.lineHeight,
                  textTransform: s.default.transform,
                  fontStyle: s.default.italic ? "italic" : "normal",
                }}
              >
                The quick brown fox
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Blocks by category */}
      {CATEGORY_ORDER.map((cat) => {
        const blocks = BLOCKS.filter((b) => b.category === cat);
        if (!blocks.length) return null;
        return (
          <Section key={cat} title={CATEGORY_TITLES[cat]}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {blocks.map((block) => (
                <BlockCard key={block.type} block={block} />
              ))}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

export default DesignLibraryTool;
