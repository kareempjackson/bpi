import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./components/Footer";
import LenisProvider from "./components/LenisProvider";
import ParallaxController from "./components/ParallaxController";
import RevealController from "./components/RevealController";
import StickyTopNav from "./components/StickyTopNav";

const albertSans = localFont({
  variable: "--font-albert-sans",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Albert_Sans/AlbertSans-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Albert_Sans/AlbertSans-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    {
      path: "../public/fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  title: "Barbados Pharmaceutical Inc",
  description: "Barbados Pharmaceutical Inc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <RevealController />
          <ParallaxController />
          <StickyTopNav />
          <div className="flex-1">{children}</div>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
