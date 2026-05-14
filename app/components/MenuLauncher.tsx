"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import Menu, { type MenuConfig } from "./Menu";

type Props = {
  size?: number;
  menuConfig?: MenuConfig;
};

export default function MenuLauncher({ size = 120, menuConfig }: Props) {
  const [isOpen, setIsOpen] = useState(false);
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
      {!isOpen ? (
        <HamburgerMenu
          size={size}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        />
      ) : null}
      <Menu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...menuConfig}
      />
    </>
  );
}
