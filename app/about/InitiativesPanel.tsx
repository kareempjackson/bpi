"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
  const [imageTop, setImageTop] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);
  const active = activeIndex !== null ? initiatives[activeIndex] : null;

  useLayoutEffect(() => {
    if (activeIndex === null) return;
    const row = rowRefs.current[activeIndex];
    const list = listRef.current;
    if (!row || !list) return;
    const rowRect = row.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setImageTop(rowRect.top - listRect.top + rowRect.height / 2);
  }, [activeIndex]);

  return (
    <div
      className="relative"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <ul ref={listRef} data-reveal-stagger className="flex flex-col">
        {initiatives.map((item, idx) => {
          const isActive = idx === activeIndex;
          const showTopBorder =
            idx > 0 && activeIndex !== idx && activeIndex !== idx - 1;
          return (
            <li
              key={item.title}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              onBlur={() => setActiveIndex(null)}
              tabIndex={0}
              className={`grid grid-cols-12 gap-4 lg:gap-6 items-start px-4 lg:px-6 py-8 lg:py-9 cursor-pointer outline-none transition-colors ${
                isActive ? "rounded-md" : showTopBorder ? "border-t border-primary-500/10" : ""
              }`}
              style={isActive ? { backgroundColor: "#CAF1FF" } : undefined}
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

      <div
        aria-hidden={!active}
        className={`hidden md:block absolute right-0 lg:right-4 w-52 lg:w-64 aspect-4/5 rounded-lg overflow-hidden shadow-xl pointer-events-none transition-[top,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: imageTop, transform: "translateY(-50%)" }}
      >
        {active ? (
          <Image
            key={active.imageSrc}
            src={active.imageSrc}
            alt={active.imageAlt}
            fill
            sizes="(min-width: 1024px) 16rem, 13rem"
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
