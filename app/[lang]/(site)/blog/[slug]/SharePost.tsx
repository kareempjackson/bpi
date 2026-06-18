"use client";

import { useState } from "react";

/**
 * "Share post" widget — green card with LinkedIn / X / Facebook share links
 * plus a copy-link button. Reads the canonical URL from the browser at click
 * time so it works on any locale path.
 */
export default function SharePost({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function currentUrl(): string {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  function openShare(kind: "linkedin" | "x" | "facebook") {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(title);
    const map: Record<typeof kind, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    window.open(map[kind], "_blank", "noopener,noreferrer,width=600,height=600");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <div className="inline-flex flex-col gap-2 rounded-2xl bg-error-300/95 p-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,54,0.4)] backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <ShareButton label="Share on LinkedIn" onClick={() => openShare("linkedin")}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zM9 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9.5z" />
          </svg>
        </ShareButton>
        <ShareButton label="Share on X" onClick={() => openShare("x")}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.78-6.26L4.8 22H2l7.02-8.03L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.69L7.23 4H5.45l10.4 16z" />
          </svg>
        </ShareButton>
        <ShareButton label="Share on Facebook" onClick={() => openShare("facebook")}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.18H7.6V13h2.69v8h3.21z" />
          </svg>
        </ShareButton>
        <ShareButton label={copied ? "Link copied" : "Copy link"} onClick={copyLink}>
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
          )}
        </ShareButton>
      </div>
      <span className="px-1 text-sm font-medium text-primary-500">
        {copied ? "Link copied" : "Share post"}
      </span>
    </div>
  );
}

function ShareButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg bg-white/70 text-primary-500 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
    >
      {children}
    </button>
  );
}
