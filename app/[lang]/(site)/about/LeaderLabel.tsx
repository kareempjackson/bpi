"use client";

import { useState } from "react";

import type { PortableTextBlock } from "@/sanity/lib/types";
import LeaderProfileModal from "./LeaderProfileModal";

type Props = {
  name: string;
  role: string;
  /** Plain string (legacy) or Portable Text array (rich-text). */
  bio?: PortableTextBlock[] | string | null;
  linkedin?: string | null;
  imageSrc: string;
  imageAlt: string;
  className: string;
};

export default function LeaderLabel({
  name,
  role,
  bio,
  linkedin,
  imageSrc,
  imageAlt,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`absolute ${className}`}>
        <div className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-1 motion-reduce:transform-none will-change-transform">
          <p className="font-display text-sm md:text-base lg:text-lg font-semibold text-white leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            {name}
          </p>
          <p className="mt-1 text-[11px] md:text-xs lg:text-sm text-white/95 leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            {role}
          </p>
        </div>
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[var(--ease-premium)]">
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center rounded-round border border-dashed border-primary-500/60 bg-error-500 px-4 py-1.5 text-sm font-semibold text-primary-500 opacity-0 translate-y-1 transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-premium)] delay-100 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 hover:bg-error-400 hover:border-primary-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      <LeaderProfileModal
        open={open}
        onClose={() => setOpen(false)}
        name={name}
        role={role}
        bio={bio}
        linkedin={linkedin}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </>
  );
}
