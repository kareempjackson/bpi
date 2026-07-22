"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import type { MenuConfig } from "./Menu";

// Defer the search modal bundle (portal + live-search logic) until the user
// first opens it — it ships out of the initial nav chunk this way.
const SearchModal = dynamic(() => import("./SearchModal"), { ssr: false });
// The site menu is hosted here (a stable sibling of the modal) rather than
// inside SearchModal, so opening it from the modal's menu button doesn't get
// unmounted when the search overlay animates itself closed.
const Menu = dynamic(() => import("./Menu"), { ssr: false });

const preloadModal = () => {
  void import("./SearchModal");
};
const preloadMenu = () => {
  void import("./Menu");
};

type Props = {
  className?: string;
  // Lets the modal's top bar host the real site menu button. The overlay lives
  // here so it survives the search overlay closing.
  menuConfig?: MenuConfig;
};

export default function SearchLauncher({ className, menuConfig }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Once opened, keep <SearchModal> mounted so it can play its exit animation.
  const [hasOpened, setHasOpened] = useState(false);
  // Bumped on each open so the modal remounts with fresh state (cleared query +
  // results) while still letting the previous instance animate out on close.
  const [openCount, setOpenCount] = useState(0);
  // Site-menu state (opened from the modal's menu button).
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const pathname = usePathname();

  const open = () => {
    setHasOpened(true);
    setIsOpen(true);
    setOpenCount((n) => n + 1);
  };

  // Close the search and open the site menu in its place.
  const openMenu = () => {
    setIsOpen(false);
    setMenuMounted(true);
    setMenuOpen(true);
  };

  // Close both overlays on route change — same external-system sync the menu
  // uses on its own.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
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
        className={`group/search items-center justify-center font-sans text-[12px] font-semibold uppercase leading-[16.8px] tracking-[-0.24px] text-center align-middle transition-all duration-300 ease-[var(--ease-premium)] hover:opacity-70 hover:scale-110 active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:opacity-100 ${
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
          onOpenMenu={menuConfig ? openMenu : undefined}
          onMenuHover={preloadMenu}
        />
      ) : null}
      {menuMounted ? (
        <Menu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          {...menuConfig}
        />
      ) : null}
    </>
  );
}
