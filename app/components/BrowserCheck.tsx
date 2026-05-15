"use client";

import { useEffect, useState } from "react";
import Button from "./Button";

const STORAGE_KEY = "bpi-browser-check-dismissed";

function isChrome(): boolean {
  if (typeof navigator === "undefined") return true;

  type UABrand = { brand: string; version: string };
  type UAData = { brands?: UABrand[] };
  const uaData = (navigator as Navigator & { userAgentData?: UAData })
    .userAgentData;

  if (uaData?.brands?.length) {
    const brands = uaData.brands.map((b) => b.brand);
    if (brands.some((b) => b === "Microsoft Edge")) return false;
    if (brands.some((b) => b === "Opera")) return false;
    return brands.some((b) => b === "Google Chrome");
  }

  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return false;
  if (/OPR\//.test(ua)) return false;
  if (/SamsungBrowser/.test(ua)) return false;
  if (/Firefox\//.test(ua)) return false;
  // Chrome on iOS reports CriOS; desktop/Android Chrome reports Chrome/ + Safari/
  if (/CriOS\//.test(ua)) return true;
  return /Chrome\//.test(ua) && /Safari\//.test(ua);
}

export default function BrowserCheck() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    if (!isChrome()) setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="browser-check-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-500/60 backdrop-blur-sm px-6"
    >
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-[0_24px_64px_-16px_rgba(0,0,54,0.35)]">
        <h2
          id="browser-check-title"
          className="font-display text-display-xs text-primary-500"
        >
          Best viewed in Google Chrome
        </h2>
        <p className="mt-3 text-md text-gray-600">
          For the smoothest experience on this site, we recommend opening it in
          Google Chrome. Some animations and interactions may behave differently
          in your current browser.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              window.open("https://www.google.com/chrome/", "_blank");
            }}
          >
            Get Chrome
          </Button>
          <Button variant="tertiary" onClick={dismiss}>
            Continue anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
