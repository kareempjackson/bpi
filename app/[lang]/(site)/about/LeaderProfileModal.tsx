"use client";

import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import SocialsIcon from "@/app/components/icons/Socials";
import Logo from "@/app/components/Logo";
import type { PortableTextBlock } from "@/sanity/lib/types";

/**
 * Common HTML entities that show up in Sanity rich-text exports / pasted
 * content. We decode these in-place so the bio reads cleanly instead of
 * showing literal `&#39;` etc.
 */
function decodeEntities(input: string): string {
  return input
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

/**
 * Normalise a long bio string for rendering:
 *   1. Decode common HTML entities (`&#39;` → `'`, etc.)
 *   2. Split into paragraphs on blank lines (1+ blank line separator)
 *   3. Within each paragraph, collapse stray hard line breaks (e.g. from
 *      a CSV / pasted text wrapped at 70 chars) into single spaces so
 *      lines flow naturally.
 */
function toParagraphs(raw: string): string[] {
  const decoded = decodeEntities(raw);
  // Split on two-or-more newlines first to preserve real paragraph breaks.
  return decoded
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  role: string;
  /** Plain string (legacy) or Portable Text array (rich-text). */
  bio?: PortableTextBlock[] | string | null;
  linkedin?: string | null;
  imageSrc: string;
  imageAlt: string;
};

const bioPortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => (
      <h3 className="font-display text-lg md:text-xl lg:text-2xl font-bold text-primary-500 leading-snug tracking-tight">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-500/40 pl-5 italic text-primary-500/90">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-5 flex flex-col gap-2 marker:text-primary-500">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 flex flex-col gap-2 marker:text-primary-500">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-primary-500">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="underline decoration-primary-500/30 underline-offset-4 hover:decoration-primary-500 text-primary-500"
        >
          {children}
        </a>
      );
    },
  },
};

const PILL_MINT = "#cdffe6"; // matches the `error-25` mint used elsewhere

// LinkedIn glyph bounds inside the SocialsIcon SVG (viewBox 150 × 78):
//   translate(106.785, 21.0222), width 18, height 19.5
// Expanded slightly so the click target reads at touch-friendly sizes.
const LINKEDIN_HIT = {
  leftPct: 68.5,
  topPct: 23,
  widthPct: 19,
  heightPct: 32,
};

export default function LeaderProfileModal({
  open,
  onClose,
  name,
  role,
  bio,
  linkedin,
  imageSrc,
  imageAlt,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Two bio shapes are supported:
  //   - rich text (Portable Text array) → render via <PortableText>
  //   - plain string (legacy) → decode entities + reflow into paragraphs
  const isRichBio = Array.isArray(bio);
  const bioParagraphs = useMemo(
    () =>
      !isRichBio && typeof bio === "string" && bio.length > 0
        ? toParagraphs(bio)
        : [],
    [bio, isRichBio],
  );
  const hasBio = isRichBio
    ? (bio as PortableTextBlock[]).length > 0
    : bioParagraphs.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      lastFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-3 md:p-6 lg:p-8 transition-opacity duration-300 ease-out ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="Close profile"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className="absolute inset-0 bg-primary-500/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leader-profile-name"
        className={`relative w-full max-w-7xl h-[96vh] md:h-auto md:max-h-[94vh] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] rounded-2xl md:rounded-3xl px-3 pt-14 pb-5 sm:px-4 sm:pt-16 md:px-8 md:pt-20 md:pb-8 lg:px-14 lg:pt-20 lg:pb-14 transition-all duration-400 ease-(--ease-premium) ${
          open ? "scale-100 translate-y-0" : "scale-[0.97] translate-y-2"
        }`}
        style={{ backgroundColor: "#01331a" }}
      >
        {/* Logo watermark layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 text-white/8 overflow-hidden"
        >
          <Logo iconOnly size={96} className="absolute top-8 left-10" />
          <Logo iconOnly size={70} className="absolute top-28 left-[26%] rotate-18" />
          <Logo iconOnly size={130} className="absolute top-14 right-[18%] -rotate-12" />
          <Logo iconOnly size={80} className="absolute bottom-12 left-[12%] -rotate-6" />
          <Logo iconOnly size={110} className="absolute bottom-8 left-[44%] rotate-10" />
          <Logo iconOnly size={90} className="absolute bottom-20 right-[8%] rotate-22" />
          <Logo iconOnly size={64} className="absolute top-[44%] left-4 rotate-[-14deg]" />
          <Logo iconOnly size={72} className="absolute top-[40%] right-6 rotate-6" />
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="group/close absolute top-6 right-6 md:top-7 md:right-8 lg:top-8 lg:right-10 z-10 inline-flex items-center gap-2.5 text-sm lg:text-base font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-error-900 rounded-full"
        >
          <span className="hidden sm:inline">Close</span>
          <span className="relative inline-flex size-9 items-center justify-center">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="relative w-3.5 h-3.5 transition-transform duration-300 ease-[var(--ease-premium)] group-hover/close:rotate-90"
              aria-hidden
            >
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </span>
        </button>

        <div
          className="relative rounded-2xl p-3 sm:p-4 md:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-[30%_1fr] lg:grid-cols-[28%_1fr] gap-4 sm:gap-6 lg:gap-12 items-start"
          style={{ backgroundColor: PILL_MINT }}
        >
          {/* Image column — on mobile, capped by max-height so it never
              dominates the viewport (otherwise users land on the photo
              with no visible cue that there's bio content below). On
              md+ it returns to the 3:4 portrait crop and sticks to the
              top of the dialog while the bio scrolls past it. */}
          <div className="md:sticky md:top-4">
            <div className="relative aspect-4/3 sm:aspect-3/2 md:aspect-3/4 max-h-[42vh] md:max-h-none rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={imageSrc}
                alt={imageAlt || name}
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 30vw, 100vw"
                className="object-cover object-[center_25%]"
              />

              {linkedin ? <FollowMePill linkedin={linkedin} name={name} /> : null}
            </div>
          </div>

          <div className="flex flex-col py-1 md:py-2 lg:py-4">
            <h2
              id="leader-profile-name"
              className="font-display text-2xl md:text-3xl lg:text-display-md font-bold text-primary-500 leading-tight tracking-tight"
            >
              {name}
            </h2>
            <p className="mt-1.5 md:mt-2 lg:mt-3 text-sm md:text-base lg:text-lg font-semibold text-primary-500">
              {role}
            </p>

            {hasBio ? (
              <div className="mt-4 md:mt-6 lg:mt-8 flex flex-col gap-4 md:gap-6 lg:gap-8 text-sm sm:text-base md:text-[17px] lg:text-lg text-primary-500/85 leading-[1.65] md:leading-[1.7]">
                {isRichBio ? (
                  <PortableText
                    value={bio as PortableTextBlock[]}
                    components={bioPortableTextComponents}
                  />
                ) : (
                  bioParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Mint "Follow me" pill — the SVG bakes in the shape, "Follow me" text,
 * and the LinkedIn glyph. We overlay an invisible link positioned over
 * the LinkedIn glyph so it acts as the click target. Additional socials
 * can be wired up by adding more overlay anchors with the matching glyph
 * bounds.
 */
function FollowMePill({ linkedin, name }: { linkedin: string; name: string }) {
  return (
    <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 w-[52%] max-w-52">
      <div className="relative aspect-150/78">
        <SocialsIcon
          aria-hidden
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
        />

        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} on LinkedIn`}
          className="absolute rounded-sm transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          style={{
            left: `${LINKEDIN_HIT.leftPct}%`,
            top: `${LINKEDIN_HIT.topPct}%`,
            width: `${LINKEDIN_HIT.widthPct}%`,
            height: `${LINKEDIN_HIT.heightPct}%`,
          }}
        >
          <span className="sr-only">LinkedIn</span>
        </a>
      </div>
    </div>
  );
}
