import localFont from "next/font/local";

// Shared font definitions. Extracted from the old single root layout so each
// root layout ([lang], studio) can apply the same CSS variables without
// instantiating duplicate font loaders.
export const albertSans = localFont({
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

// Avenir Next stand-in — Metropolis. Only the weights actually used are loaded.
export const avenirNext = localFont({
  variable: "--font-avenir",
  display: "swap",
  src: [
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Thin.otf", weight: "100", style: "normal" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/avenir-next-similar-fonts/metropolis/Metropolis-Bold.otf", weight: "700", style: "normal" },
  ],
});
