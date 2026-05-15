import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BrowserCheck from "./components/BrowserCheck";

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

// Avenir Next stand-in — Metropolis is a free, geometric sans-serif
// with very similar proportions and curves. Only the weights actually
// used in the codebase are loaded (100, 300, 400, 500, 600, 700 + 400
// italic). Cuts ~11 files off the font payload before LCP.
const avenirNext = localFont({
  variable: "--font-avenir",
  display: "swap",
  src: [
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Barbados Pharmaceutical Inc",
  description: "Barbados Pharmaceutical Inc",
};

// Tint mobile browser chrome (iOS status bar, Android URL bar) with the
// site's signature mint so the time/status area reads as a seamless
// extension of the page background across the entire site.
export const viewport: Viewport = {
  themeColor: "#cdffe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${avenirNext.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BrowserCheck />
        {children}
      </body>
    </html>
  );
}
