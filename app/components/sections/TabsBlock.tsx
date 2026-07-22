"use client";

import { useRef, useState } from "react";

import PortableTextBody from "@/app/components/PortableTextBody";
import type { PortableTextBlock } from "@/sanity/lib/types";

import type { SectionComponentProps } from "./registry";

type Tab = { title?: string | null; body?: PortableTextBlock[] | null };

/**
 * Page-builder renderer for the `tabsBlock`. Framed by the Zone. A heading over
 * a keyboard-accessible tab strip (WAI-ARIA roving tabindex — arrow keys move
 * between tabs; Home/End jump to the ends) whose active panel renders a rich
 * body through the shared PortableTextBody. Client component: holds the active
 * tab in `useState`.
 */
export default function TabsBlock({ block }: SectionComponentProps) {
  const heading = (block.heading as string) ?? undefined;
  const tabs = (block.tabs as Tab[] | null) ?? [];
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!tabs.length && !heading) return null;

  const current = tabs[Math.min(active, tabs.length - 1)];
  const key = block._key;

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (active + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (active - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = tabs.length - 1;
    }
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div className="mx-auto max-w-page">
      {heading ? (
        <h2 className="type-h2 balance-text mb-8 max-w-2xl text-primary-500 lg:mb-10">
          {heading}
        </h2>
      ) : null}

      {tabs.length ? (
        <div className="mx-auto max-w-3xl">
          <div
            role="tablist"
            aria-label={heading || "Tabs"}
            onKeyDown={onKeyDown}
            className="flex flex-wrap gap-x-6 gap-y-2 border-b border-primary-500/10"
          >
            {tabs.map((tab, i) => {
              const selected = i === active;
              return (
                <button
                  key={`${tab.title ?? "tab"}-${i}`}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${key}-${i}`}
                  aria-selected={selected}
                  aria-controls={`panel-${key}-${i}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`type-label -mb-px cursor-pointer border-b-2 pb-3 transition-colors ${
                    selected
                      ? "border-primary-500 text-primary-500"
                      : "border-transparent text-primary-500/50 hover:text-primary-500/80"
                  }`}
                >
                  {tab.title || `Tab ${i + 1}`}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`panel-${key}-${active}`}
            aria-labelledby={`tab-${key}-${active}`}
            className="pt-8 lg:pt-10"
          >
            <PortableTextBody value={current?.body ?? null} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
