"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import type { MenuConfig } from "./Menu";

// Defer the menu bundle until the launcher is first clicked. The menu
// is a ~500-line modal with its own video stage; without this it ships
// in the initial HeroSection client chunk even though it's invisible
// until the user opens it.
const Menu = dynamic(() => import("./Menu"), { ssr: false });

export type { MenuConfig };

type Props = {
  size?: number;
  menuConfig?: MenuConfig;
};

// Warm the menu chunk so the first open doesn't flash while the bundle loads.
const preloadMenu = () => {
  void import("./Menu");
};

export default function MenuLauncher({ size = 120, menuConfig }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Once opened, keep <Menu> mounted so it can play its exit animation
  // (and so the chunk stays warm) instead of unmounting on close.
  const [hasOpened, setHasOpened] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever the route changes. Synchronises menu state
  // (React) with the router (an external system) — the canonical
  // Next.js pattern for this. Defends against the route changing for
  // any reason: link clicks, browser back/forward, programmatic nav.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Close the menu when the page is restored from bfcache. Without
  // this, leaving the site with the menu open and returning via
  // browser Back restores `isOpen: true` together with the rest of
  // React state, and the full-screen menu portal sits on top of the
  // site covering everything — the user has to refresh to recover.
  // Pathname doesn't change on bfcache restore, so the route-change
  // effect above can't catch it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setIsOpen(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <>
      {/* Always mounted + tagged `data-page-header` so it fades out smoothly
          with the rest of the header chrome when the menu opens, instead of
          vanishing abruptly. Hidden from AT / tab order while open. */}
      <HamburgerMenu
        size={size}
        data-page-header
        aria-expanded={isOpen}
        aria-hidden={isOpen || undefined}
        tabIndex={isOpen ? -1 : undefined}
        onClick={() => {
          setHasOpened(true);
          setIsOpen(true);
        }}
        onMouseEnter={preloadMenu}
        onFocus={preloadMenu}
      />
      {/* Mounted lazily on first open (defers ~500 lines + the video stage),
          then kept mounted so the overlay can animate its exit. */}
      {hasOpened ? (
        <Menu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          {...menuConfig}
        />
      ) : null}
    </>
  );
}
