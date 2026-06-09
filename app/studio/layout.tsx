import "@/app/globals.css";
import { albertSans, avenirNext } from "@/app/fonts";

// Studio is English-only admin UI and is NOT under the [lang] segment, so it
// is its own root layout (renders <html>/<body>) now that the shared root
// layout has moved into app/[lang]/layout.tsx.
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${avenirNext.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
