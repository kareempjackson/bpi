"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import Image from "next/image";
import ArrowCircle from "./ArrowCircle";
import CtaLink from "./CtaLink";

type Item = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  videoSrc?: string;
  imageAlt?: string;
  /** Hex color used as the card fill. */
  color: string;
};

type Props = {
  heading?: string;
  description?: string;
  items?: Item[];
};

const DEFAULT_ITEMS: Item[] = [
  {
    title: "Attract & Facilitate Investment",
    description:
      "Giving global capital a clear pathway into the Caribbean pharmaceutical market.",
    href: "/priorities/investment",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Attract and facilitate investment",
    color: "#CAF1FF",
  },
  {
    title: "Build & Incubate Capacity",
    description: "Moving strategic projects from concept to execution.",
    href: "/priorities/capacity",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Build and incubate capacity",
    color: "#dde885",
  },
  {
    title: "Strengthen Regional Supply Chains",
    description:
      "Building the trade corridors and distribution infrastructure the Caribbean depends on.",
    href: "/priorities/supply-chains",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Strengthen regional supply chains",
    color: "#38fe9c",
  },
  {
    title: "Build the Ecosystem Foundations",
    description:
      "Developing the regulatory, workforce, and research foundations for a permanent sector.",
    href: "/priorities/ecosystem",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Build the ecosystem foundations",
    color: "#b5d4e6",
  },
];

export default function ArchitectureOfCareSection({
  heading = "Four Strategic Priorities",
  description = "Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.",
  items = DEFAULT_ITEMS,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first?.offsetWidth ?? 320;
    const gap = 20;
    el.scrollBy({
      left: (cardWidth + gap) * direction,
      behavior: "smooth",
    });
  };

  return (
    <section
      data-nav-theme="light"
      className="bg-error-25 px-5 md:px-20 lg:px-32 pt-10 md:pt-20 lg:pt-28 pb-8 md:pb-16 lg:pb-24"
    >
      <div className="mx-auto max-w-page rounded-3xl bg-white px-5 md:px-14 lg:px-20 py-10 md:py-20 lg:py-28">
        {/* Header */}
        <div
          data-reveal-stagger
          className="flex items-start justify-between gap-4 md:gap-6 mb-8 md:mb-16"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-display-xs md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.05] tracking-[-0.02em]">
              {heading}
            </h2>
            <p className="mt-2 md:mt-3 text-sm md:text-base text-primary-500 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 lg:hidden">
            <CarouselButton
              onClick={() => scrollByCard(-1)}
              direction="prev"
            />
            <CarouselButton
              onClick={() => scrollByCard(1)}
              direction="next"
            />
          </div>
        </div>

        {/* Cards — horizontal carousel on mobile/tablet, 4-column grid
            on desktop so all four sit side-by-side without scrolling. */}
        <div
          ref={scrollRef}
          data-reveal-stagger
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible"
        >
          {items.map((item, idx) => (
            <PriorityCard key={`${item.href}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  onClick,
  direction,
}: {
  onClick: () => void;
  direction: "prev" | "next";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      className={`group/arrow inline-flex text-primary-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-90 active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40 rounded-full ${
        direction === "prev"
          ? "hover:-translate-x-0.5"
          : "hover:translate-x-0.5"
      }`}
    >
      <ArrowCircle size={48} direction={direction} />
    </button>
  );
}

function PriorityCard({ item }: { item: Item }) {
  return (
    <CtaLink
      href={item.href}
      className="shrink-0 snap-start w-[85%] sm:w-[60%] aspect-4/3 rounded-3xl p-5 md:p-7 flex flex-col group lg:w-auto lg:shrink lg:aspect-auto lg:h-full lg:p-6"
      style={{ backgroundColor: item.color } as CSSProperties}
    >
      <h3 className="font-display text-xs lg:text-[11px] font-bold uppercase tracking-[0.06em] text-primary-500 leading-tight group-hover:opacity-80 transition-opacity">
        {item.title}
      </h3>
      <p className="mt-3 md:mt-4 font-display text-xl md:text-2xl lg:text-base font-light text-primary-500/85 leading-[1.3] tracking-tight max-w-md">
        {item.description}
      </p>

      <div className="mt-auto pt-6 flex items-end justify-between gap-4">
        <div className="relative w-[42%] aspect-square rounded-2xl overflow-hidden">
          {item.videoSrc ? (
            <video
              src={item.videoSrc}
              poster={item.imageSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              disableRemotePlayback
              disablePictureInPicture
              aria-label={item.imageAlt || undefined}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={item.imageSrc}
              alt={item.imageAlt ?? ""}
              fill
              sizes="(min-width: 1024px) 44vw, 45vw"
              className="object-cover"
            />
          )}
        </div>
        <ArrowCircle size={48} className="shrink-0 text-primary-500" />
      </div>
    </CtaLink>
  );
}
