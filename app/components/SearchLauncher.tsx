"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Defer the search modal bundle (portal + live-search logic) until the user
// first opens it — it ships out of the initial nav chunk this way.
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });

const preloadModal = () => {
  void import("./SearchModal");
};

type Props = {
  className?: string;
};

export default function SearchLauncher({ className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Once opened, keep <SearchModal> mounted so it can play its exit animation.
  const [hasOpened, setHasOpened] = useState(false);
  // Bumped on each open so the modal remounts with fresh state (cleared query +
  // results) while still letting the previous instance animate out on close.
  const [openCount, setOpenCount] = useState(0);
  const pathname = usePathname();

  const open = () => {
    setHasOpened(true);
    setIsOpen(true);
    setOpenCount((n) => n + 1);
  };

  // Close on route change — same external-system sync the menu uses.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // `/` opens search from anywhere (unless typing in a field). A common,
  // discoverable shortcut for site search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-expanded={isOpen}
        onClick={open}
        onMouseEnter={preloadModal}
        onFocus={preloadModal}
        className={`group/search items-center justify-center transition-all duration-300 ease-[var(--ease-premium)] hover:opacity-70 hover:scale-110 active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:opacity-100 ${
          className ?? ""
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4.25 h-4.25"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      {hasOpened ? (
        <SearchModal
          key={openCount}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
