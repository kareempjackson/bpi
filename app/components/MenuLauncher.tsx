"use client";

import { useState } from "react";
import HamburgerMenu from "./HamburgerMenu";
import Menu from "./Menu";

type Props = {
  size?: number;
  videoSrc?: string;
};

export default function MenuLauncher({ size = 120, videoSrc }: Props) {
  const [isOpen, setIsOpen] = useState(false);

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
        videoSrc={videoSrc}
      />
    </>
  );
}
