"use client";

import { useState } from "react";
import Image from "next/image";

export type Initiative = {
  title: string;
  subtitle?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

type Props = {
  initiatives: Initiative[];
};

export default function InitiativesPanel({ initiatives }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? initiatives[activeIndex] : null;

  return (
    <div
      className="relative"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <ul className="flex flex-col">
        {initiatives.map((item, idx) => {
          const isActive = idx === activeIndex;
          const showTopBorder =
            idx > 0 && activeIndex !== idx && activeIndex !== idx - 1;
          return (
            <li
              key={item.title}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              onBlur={() => setActiveIndex(null)}
              tabIndex={0}
              className={`grid grid-cols-12 gap-4 lg:gap-6 items-start px-4 lg:px-6 py-4 lg:py-5 cursor-pointer outline-none transition-colors ${
                isActive ? "rounded-md" : showTopBorder ? "border-t border-primary-500/10" : ""
              }`}
              style={isActive ? { backgroundColor: "#cee2ef" } : undefined}
            >
              <div className="col-span-12 md:col-span-5 text-sm lg:text-md font-medium text-primary-500 leading-snug">
                {item.title}
                {item.subtitle ? (
                  <>
                    <br />
                    {item.subtitle}
                  </>
                ) : null}
              </div>
              <p className="col-span-12 md:col-span-7 text-xs lg:text-sm text-primary-500/80 leading-relaxed">
                {item.description}
              </p>
            </li>
          );
        })}
      </ul>

      {active ? (
        <div className="hidden md:block absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 w-44 lg:w-56 aspect-4/5 rounded-lg overflow-hidden shadow-xl pointer-events-none">
          <Image
            key={active.imageSrc}
            src={active.imageSrc}
            alt={active.imageAlt}
            fill
            sizes="(min-width: 1024px) 14rem, 11rem"
            className="object-cover transition-opacity duration-300"
          />
        </div>
      ) : null}
    </div>
  );
}
