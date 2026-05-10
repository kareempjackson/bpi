import type { CSSProperties } from "react";
import Image from "next/image";
import ArrowRight from "./ArrowRight";
import Button from "./Button";

type Pillar = "Dignity" | "Sovereignty" | "Alliance";

type Item = {
  pillar: Pillar;
  title: string;
  href: string;
  imageSrc: string;
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
    pillar: "Dignity",
    title:
      "Queen Elizabeth Hospital receives first shipment from the AMA IV fluids corridor",
    href: "/news/qeh-ama-iv-fluids",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Queen Elizabeth Hospital exterior",
    color: "#cee2ef",
  },
  {
    pillar: "Sovereignty",
    title:
      "BMPRA regulatory framework moves to next phase in partnership with WHO",
    href: "/news/bmpra-who-partnership",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "United Nations emblem",
    color: "#dde885",
  },
  {
    pillar: "Alliance",
    title:
      "First pharmaceutical cargo between Africa and the Caribbean departs Kaduna for Bridgetown",
    href: "/news/first-cargo-kaduna-bridgetown",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Cargo truck departing manufacturing facility at sunrise",
    color: "#38fe9c",
  },
  {
    pillar: "Sovereignty",
    title:
      "BMPRA regulatory framework moves to next phase in partnership with WHO",
    href: "/news/bmpra-who-partnership-2",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Queen Elizabeth Hospital exterior",
    color: "#b5d4e6",
  },
];

export default function ArchitectureOfCareSection({
  heading = "The Architecture of Care",
  description = "The structure through which a small state and a region care for their own. Built deliberately. Piece by piece. With the people it is for.",
  items = DEFAULT_ITEMS,
}: Props) {
  return (
    <section data-nav-theme="light" className="bg-error-25 px-8 md:px-16 lg:px-28 py-10 md:py-14 lg:py-20">
      <div className="mx-auto max-w-page rounded-lg bg-white px-5 md:px-8 lg:px-10 py-7 md:py-10 lg:py-12">
        <div data-reveal-stagger className="mb-7 md:mb-10 max-w-2xl">
          <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.05] tracking-[-0.02em]">
            {heading}
          </h2>
          <p className="mt-3 text-sm text-primary-500 leading-relaxed">
            {description}
          </p>
        </div>

        <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-2 gap-x-5 lg:gap-x-8 gap-y-5 lg:gap-y-6">
          {items.map((item, idx) => (
            <PairCard key={`${item.href}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PairCard({ item }: { item: Item }) {
  return (
    <a
      href={item.href}
      className="grid grid-cols-2 gap-3 lg:gap-4 group items-stretch"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <div
          data-parallax="0.10"
          className="absolute inset-0"
          style={{ "--parallax-scale": "1.12" } as CSSProperties}
        >
          <Image
            src={item.imageSrc}
            alt={item.imageAlt ?? ""}
            fill
            sizes="(min-width: 768px) 22vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>

      <div
        className="relative aspect-square rounded-lg p-5 md:p-6 flex flex-col"
        style={{ backgroundColor: item.color }}
      >
        <div className="text-[11px] font-bold tracking-[0.12em] text-primary-500 uppercase">
          {item.pillar}
        </div>
        <h3 className="mt-3 text-sm md:text-md text-primary-500 leading-[1.35] group-hover:opacity-80 transition-opacity pr-2">
          {item.title}
        </h3>

        <div className="mt-auto flex justify-end">
          <Button
            variant="tertiary-light"
            iconOnly="sm"
            aria-label={`Read: ${item.title}`}
            tabIndex={-1}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </a>
  );
}
