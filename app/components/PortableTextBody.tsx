import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";

import { resolveImage } from "@/sanity/lib/image";
import type { PortableTextBlock } from "@/sanity/lib/types";

/**
 * The one shared Portable Text renderer for every rich-text body on the site
 * (article copy, section bodies, card bodies, quotes). Consolidates the maps
 * that used to be duplicated across blog/events/careers/leader/portal, and
 * styles through the brand `.type-*` classes so a Studio typography edit flows
 * into rendered prose too.
 *
 * Pass `compact` for single-paragraph contexts (card bodies, quotes) so rich
 * text doesn't introduce heading margins or big block gaps.
 */

function ImageBlock({ value }: { value: unknown }) {
  const v = value as { asset?: { _ref?: string }; alt?: string } | undefined;
  if (!v?.asset) return null;
  const img = resolveImage(
    { asset: v.asset, alt: v.alt ?? "" } as Parameters<typeof resolveImage>[0],
    { width: 1600 },
  );
  if (!img) return null;
  return (
    <figure className="my-8 lg:my-12">
      <div className="relative aspect-16/9 overflow-hidden rounded-2xl lg:rounded-3xl">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
        />
      </div>
      {img.alt ? (
        <figcaption className="type-caption mt-3 text-primary-500/60">
          {img.alt}
        </figcaption>
      ) : null}
    </figure>
  );
}

const marks: PortableTextComponents["marks"] = {
  strong: ({ children }) => (
    <strong className="font-semibold text-primary-500">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  underline: ({ children }) => <span className="underline">{children}</span>,
  link: ({ children, value }) => {
    const href = (value as { href?: string } | undefined)?.href ?? "#";
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="hov-underline text-primary-500 underline decoration-primary-500/30 underline-offset-[6px]"
      >
        {children}
      </a>
    );
  },
};

/** Full editorial rhythm — headings, lists, quotes, images. */
const fullComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="type-body text-primary-500/85">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="type-h2 balance-text mt-8 mb-1 text-primary-500 lg:mt-12">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="type-h3 balance-text mt-6 mb-0.5 text-primary-500 lg:mt-8">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="type-quote balance-text my-4 border-l-2 border-primary-500/30 pl-6 text-primary-500 lg:my-6 lg:pl-8">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="type-body flex list-disc list-outside flex-col gap-2.5 pl-6 text-primary-500/85 marker:text-primary-500/50">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="type-body flex list-decimal list-outside flex-col gap-2.5 pl-6 text-primary-500/85 marker:font-semibold marker:text-primary-500/50">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks,
  types: { image: ImageBlock },
};

/** Tight rendering for card bodies / quotes — paragraphs only, minimal gaps. */
const compactComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <p className="font-semibold">{children}</p>,
    h3: ({ children }) => <p className="font-semibold">{children}</p>,
    blockquote: ({ children }) => <p className="italic">{children}</p>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-5">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-5">{children}</ol>
    ),
  },
  marks,
  types: { image: ImageBlock },
};

/** Default paragraph treatment for the full (non-compact) renderer. */
const DEFAULT_PARAGRAPH_CLASS = "type-body text-primary-500/85";

/**
 * Render a legacy plain string as one or more paragraphs. Splits on blank
 * lines (`\n\n`) and converts the legacy `**bold**` convention to `<strong>`.
 * Lets this renderer stay order-independent: a page can route a field through
 * it whether or not the stored data has been migrated to Portable Text yet.
 */
function renderInlineBold(segment: string): ReactNode[] {
  return segment.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) {
      return (
        <strong key={i} className="font-semibold">
          {bold[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function renderPlainString(
  text: string,
  paragraphClass: string,
  paragraphStyle?: CSSProperties,
): ReactNode {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;
  return paragraphs.map((p, i) => (
    <p key={i} className={paragraphClass} style={paragraphStyle}>
      {renderInlineBold(p)}
    </p>
  ));
}

/** Clone a components map, overriding the `normal` paragraph classes/style. */
function withParagraphClass(
  base: PortableTextComponents,
  paragraphClass?: string,
  paragraphStyle?: CSSProperties,
): PortableTextComponents {
  if (!paragraphClass && !paragraphStyle) return base;
  return {
    ...base,
    block: {
      ...(base.block as Record<string, unknown>),
      normal: ({ children }: { children?: ReactNode }) => (
        <p className={paragraphClass} style={paragraphStyle}>
          {children}
        </p>
      ),
    },
  } as PortableTextComponents;
}

export default function PortableTextBody({
  value,
  compact = false,
  className,
  paragraphClassName,
  paragraphStyle,
}: {
  /**
   * Portable Text blocks (post-migration) OR a legacy plain string
   * (pre-migration / hardcoded fallback). Strings render as paragraphs.
   */
  value?: PortableTextBlock[] | string | null;
  compact?: boolean;
  /** Extra classes on the wrapper (e.g. a `.type-*` size for compact bodies). */
  className?: string;
  /**
   * Override the `normal` paragraph classes (both string + block paths). Use to
   * preserve a field's existing colour/size/leading when it doesn't match the
   * default body treatment (e.g. white hero copy on a dark band).
   */
  paragraphClassName?: string;
  /**
   * Inline style applied to each `normal` paragraph (both string + block
   * paths). Use for dynamic per-instance colour that can't live in a class
   * (e.g. a scroll-animated text colour).
   */
  paragraphStyle?: CSSProperties;
}) {
  const spacing = compact ? "space-y-2" : "space-y-4 lg:space-y-6";
  const wrapperClass = `${spacing}${className ? ` ${className}` : ""}`;

  // Legacy string path — render paragraphs directly, no Portable Text needed.
  if (typeof value === "string") {
    const paragraphClass =
      paragraphClassName ?? (compact ? "" : DEFAULT_PARAGRAPH_CLASS);
    const body = renderPlainString(value, paragraphClass, paragraphStyle);
    if (!body) return null;
    return <div className={wrapperClass}>{body}</div>;
  }

  if (!value?.length) return null;
  const components = withParagraphClass(
    compact ? compactComponents : fullComponents,
    paragraphClassName,
    paragraphStyle,
  );
  return (
    <div className={wrapperClass}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}
