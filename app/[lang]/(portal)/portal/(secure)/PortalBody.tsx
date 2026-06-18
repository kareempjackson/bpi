import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import { resolveMedia } from "@/sanity/lib/image";
import type { PortableTextBlock, SanityImage } from "@/sanity/lib/types";

type StatCardValue = {
  label?: string;
  value?: string;
  delta?: string;
  note?: string;
};

type MetricsTableValue = {
  caption?: string;
  columns?: string[];
  rows?: { cells?: string[] }[];
};

function deltaTone(delta: string | undefined): string {
  if (!delta) return "text-primary-500/50";
  if (delta.trim().startsWith("+")) return "text-error-700";
  if (delta.trim().startsWith("-")) return "text-red-600";
  return "text-primary-500/50";
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-[1.7] text-primary-500/85">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 font-display text-2xl font-semibold tracking-[-0.01em] text-primary-500">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-display text-xl font-semibold text-primary-500">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-error-500 pl-4 font-display text-lg italic text-primary-500">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 text-primary-500/85 marker:text-primary-500/40">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 text-primary-500/85 marker:text-primary-500/40">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-primary-500">{children}</strong>
    ),
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="hov-underline text-warning-500 underline underline-offset-4"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    statCard: ({ value }) => {
      const v = value as StatCardValue;
      return (
        <div className="my-2 inline-flex min-w-45 flex-col rounded-lg border border-primary-500/10 bg-error-25 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-primary-500/50">
            {v.label}
          </span>
          <span className="mt-1 font-display text-2xl font-semibold text-primary-500">
            {v.value}
          </span>
          {v.delta ? (
            <span className={`mt-0.5 text-sm font-medium ${deltaTone(v.delta)}`}>
              {v.delta}
            </span>
          ) : null}
          {v.note ? (
            <span className="mt-1 text-xs text-primary-500/50">{v.note}</span>
          ) : null}
        </div>
      );
    },
    metricsTable: ({ value }) => {
      const v = value as MetricsTableValue;
      const columns = v.columns ?? [];
      const rows = v.rows ?? [];
      return (
        <figure className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-primary-500/20 text-left">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 font-semibold text-primary-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-primary-500/10">
                  {(row.cells ?? []).map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-primary-500/80">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {v.caption ? (
            <figcaption className="mt-2 text-xs text-primary-500/50">
              {v.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    imageWithAlt: ({ value }) => {
      const media = resolveMedia(value as SanityImage, { width: 1200 });
      if (!media) return null;
      if (media.kind === "video") {
        return (
          <video
            src={media.src}
            poster={media.poster}
            controls
            playsInline
            className="my-4 w-full rounded-xl bg-black"
          />
        );
      }
      if (media.kind === "audio") {
        return <audio src={media.src} controls className="my-4 w-full" />;
      }
      return (
        // Plain <img>: portal images are gated and not perf-critical, so we skip
        // next/image remote-pattern config here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={media.alt}
          className="my-4 w-full rounded-xl"
        />
      );
    },
  },
};

export default function PortalBody({
  value,
}: {
  value: PortableTextBlock[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <PortableText value={value} components={components} />
    </div>
  );
}
