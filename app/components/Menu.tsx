"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MenuMedia =
  | { type: "video"; src: string }
  | { type: "image"; src: string; alt?: string };

type SubMenuLink = {
  label: string;
  href: string;
  media?: MenuMedia;
};

type MenuLink = {
  label: string;
  href: string;
  subItems?: SubMenuLink[];
  media?: MenuMedia;
};
type SocialLink = { name: "LinkedIn" | "X" | "Instagram" | "YouTube"; href: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  links?: MenuLink[];
  legalLinks?: MenuLink[];
  socialLinks?: SocialLink[];
  videoSrc?: string;
};

const MENU_SHAPE_PATH =
  "M227.301 0C234.434 2.70128e-07 241.275 2.50032 246.318 6.9502C251.327 11.3691 254.155 17.351 254.194 23.5967V39.9258C254.194 57.5989 268.521 71.9258 286.194 71.9258H423.105L423.773 71.9326C430.665 72.0834 437.238 74.5651 442.124 78.876C447.168 83.3258 450.001 89.3614 450.001 95.6543V868.497C450.001 895.007 428.511 916.497 402.001 916.497H0V0H227.301Z";

const DEFAULT_VIDEO_SRC = "/videos/Procur%20%20Motion%20animation%20V3%20SD.mp4";

const DEFAULT_LINKS: MenuLink[] = [
  { label: "Home", href: "/" },
  {
    label: "About BPI",
    href: "/about",
    media: {
      type: "image",
      src: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
      alt: "BPI team",
    },
  },
  {
    label: "Our Story",
    href: "/our-story",
    media: {
      type: "image",
      src: "/images/top.png",
      alt: "BPI story",
    },
  },
  {
    label: "Ecosystem",
    href: "/ecosystem",
    subItems: [
      {
        label: "Manufacturing",
        href: "/ecosystem/manufacturing",
        media: {
          type: "image",
          src: "/images/top.png",
          alt: "Manufacturing facility",
        },
      },
      {
        label: "Regulatory",
        href: "/ecosystem/regulatory",
        media: {
          type: "image",
          src: "/images/top2.png",
          alt: "Regulatory affairs",
        },
      },
      {
        label: "Supply chain",
        href: "/ecosystem/supply-chain",
        media: {
          type: "image",
          src: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
          alt: "Supply chain",
        },
      },
      {
        label: "Research",
        href: "/ecosystem/research",
        media: {
          type: "image",
          src: "/images/top.png",
          alt: "Research and development",
        },
      },
    ],
    media: {
      type: "image",
      src: "/images/top2.png",
      alt: "BPI ecosystem",
    },
  },
  {
    label: "Initiatives",
    href: "/initiatives",
    subItems: [
      {
        label: "Dignity",
        href: "/initiatives/dignity",
        media: {
          type: "image",
          src: "/images/top.png",
          alt: "Dignity initiative",
        },
      },
      {
        label: "Sovereignty",
        href: "/initiatives/sovereignty",
        media: {
          type: "image",
          src: "/images/top2.png",
          alt: "Sovereignty initiative",
        },
      },
      {
        label: "Alliance",
        href: "/initiatives/alliance",
        media: {
          type: "image",
          src: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
          alt: "Alliance initiative",
        },
      },
    ],
    media: {
      type: "image",
      src: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
      alt: "BPI initiatives",
    },
  },
  {
    label: "News & Media",
    href: "/news",
    media: {
      type: "image",
      src: "/images/top.png",
      alt: "BPI news and media",
    },
  },
  {
    label: "Resources",
    href: "/resources",
    media: {
      type: "image",
      src: "/images/top2.png",
      alt: "BPI resources",
    },
  },
  {
    label: "Contact",
    href: "/contact",
    media: {
      type: "image",
      src: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
      alt: "Contact BPI",
    },
  },
];

const DEFAULT_LEGAL: MenuLink[] = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Media Assets", href: "/media-assets" },
];

const DEFAULT_SOCIAL: SocialLink[] = [
  { name: "LinkedIn", href: "#" },
  { name: "X", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "YouTube", href: "#" },
];

function SocialIcon({ name }: { name: SocialLink["name"] }) {
  switch (name) {
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zM9 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9.5z" />
        </svg>
      );
    case "X":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M18.244 2H21l-6.55 7.49L22 22h-6.83l-4.78-6.26L4.8 22H2l7.02-8.03L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.69L7.23 4H5.45l10.4 16z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
          <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.4.1 12 .1 12s0 3.6.4 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-5.5.4-5.5s0-3.6-.4-5.5zM9.75 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
  }
}

export default function Menu({
  isOpen,
  onClose,
  links = DEFAULT_LINKS,
  legalLinks = DEFAULT_LEGAL,
  socialLinks = DEFAULT_SOCIAL,
  videoSrc = DEFAULT_VIDEO_SRC,
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const hoveredItem = hoveredIndex !== null ? links[hoveredIndex] : null;
  const subItems = hoveredItem?.subItems ?? [];
  const showSub = subItems.length > 0;
  const hoveredSubItem =
    hoveredSubIndex !== null ? subItems[hoveredSubIndex] : null;
  const activeMedia: MenuMedia =
    hoveredSubItem?.media ??
    hoveredItem?.media ?? { type: "video", src: videoSrc };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("menu-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setHoveredIndex(null);
      setHoveredSubIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setHoveredSubIndex(null);
  }, [hoveredIndex]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex p-3 lg:p-4 bg-error-25"
    >
      <div className="relative flex-1 rounded-lg overflow-hidden flex min-h-0">
        {/* Combined main + sub-menu region */}
        <div
          className="flex-1 flex"
          onMouseLeave={() => {
            setHoveredIndex(null);
            setHoveredSubIndex(null);
          }}
        >
          {/* Blue menu panel */}
          <div className="flex-1 bg-warning-500 text-white flex flex-col p-8 lg:p-14">
            {/* Spacer to push links down to vertical centerish */}
            <div className="h-12 lg:h-16" />

            {/* Links */}
            <nav className="flex-1 flex flex-col justify-center">
              <ul>
                {links.map((link, i) => {
                  const isActive = hoveredIndex === i;
                  const isLast = i === links.length - 1;
                  return (
                    <li
                      key={link.href}
                      className={`border-white/15 ${i === 0 ? "border-t" : ""} ${isLast ? "" : "border-b"}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                    >
                      <a
                        href={link.href}
                        onClick={onClose}
                        className={`block font-display text-display-sm lg:text-display-md font-bold py-5 lg:py-6 transition-colors ${
                          isActive
                            ? "text-error-500"
                            : "text-white hover:opacity-70"
                        }`}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer: legal links + social */}
            <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={onClose}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="flex items-center gap-5 text-white">
                {socialLinks.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      aria-label={s.name}
                      className="inline-flex items-center justify-center hover:opacity-70 transition-opacity"
                    >
                      <SocialIcon name={s.name} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sub-menu panel — shown when hovered item has subItems */}
          <div
            className={`hidden md:flex flex-col justify-center transition-[width,opacity] duration-300 ${
              showSub
                ? "w-[22%] xl:w-[24%] opacity-100"
                : "w-0 opacity-0 pointer-events-none"
            } overflow-hidden bg-warning-25`}
          >
            <div className="px-8 lg:px-12 py-10 lg:py-14 flex-1 flex flex-col justify-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-primary-500 uppercase mb-8 lg:mb-10">
                {hoveredItem?.label ?? ""}
              </p>
              <ul className="flex flex-col gap-4 lg:gap-5">
                {subItems.map((sub, j) => (
                  <li
                    key={sub.href}
                    onMouseEnter={() => setHoveredSubIndex(j)}
                  >
                    <a
                      href={sub.href}
                      onClick={onClose}
                      className={`font-display text-lg lg:text-xl transition-colors ${
                        hoveredSubIndex === j
                          ? "text-error-700"
                          : "text-primary-500 hover:opacity-60"
                      }`}
                    >
                      {sub.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Video panel — hidden on mobile, clipped to menu.svg shape */}
        <div className="hidden lg:block relative w-[28%] xl:w-[30%]">
          <svg
            viewBox="0 0 450 917"
            preserveAspectRatio="none"
            shapeRendering="geometricPrecision"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            <defs>
              <clipPath id="menu-shape-clip">
                <path d={MENU_SHAPE_PATH} />
              </clipPath>
            </defs>
            <path d={MENU_SHAPE_PATH} fill="#000036" />
            {activeMedia.type === "video" ? (
              <foreignObject
                key={activeMedia.src}
                x="0"
                y="0"
                width="450"
                height="917"
                clipPath="url(#menu-shape-clip)"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  <source src={activeMedia.src} type="video/mp4" />
                </video>
              </foreignObject>
            ) : (
              <image
                key={activeMedia.src}
                href={activeMedia.src}
                x="0"
                y="0"
                width="450"
                height="917"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#menu-shape-clip)"
                aria-label={activeMedia.alt}
              />
            )}
            <path d={MENU_SHAPE_PATH} fill="#000000" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Close button — top-right of the menu overlay. On lg+, sits over
            the video panel's "tab" notch (light bg); on mobile, over the
            blue panel (dark bg). */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-5 right-6 lg:top-7 lg:right-10 z-10 group inline-flex items-center gap-3 text-sm font-semibold text-white lg:text-primary-500 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-90 focus-visible:outline-none"
        >
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 motion-reduce:transform-none">
            Close Menu
          </span>
          <span className="relative inline-flex size-9 items-center justify-center">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              className="absolute inset-0 w-full h-full text-white lg:text-primary-500 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 motion-reduce:transform-none"
              aria-hidden
            >
              <circle
                cx="18"
                cy="18"
                r="17"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="relative w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-active:scale-90 motion-reduce:transform-none"
              aria-hidden
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </span>
        </button>
      </div>
    </div>,
    document.body
  );
}
