import Logo from "@/app/components/Logo";

/**
 * Subtle BPI-icon watermarks that sit in the mint margins of the careers
 * pages, behind the white content cards. Uses the existing
 * `.footer-watermark` styles (opacity 0.03 + clip-path reveal) so the
 * texture matches the footer treatment elsewhere on the site.
 *
 * The parent must be `position: relative` and clip overflow.
 */
export default function CareersWatermark() {
  return (
    <div
      aria-hidden
      data-reveal="fade"
      className="pointer-events-none absolute inset-0 z-0"
    >
      {/* Top-left — sits in the left margin above the hero */}
      <Logo
        iconOnly
        size={340}
        className="footer-watermark absolute -top-12 -left-24 text-primary-500"
      />
      {/* Mid-right — anchors the middle of the page on the right margin */}
      <Logo
        iconOnly
        size={400}
        className="footer-watermark absolute top-[38%] -right-28 text-primary-500"
      />
      {/* Bottom-left — balances the right side, near the Jobs card */}
      <Logo
        iconOnly
        size={300}
        className="footer-watermark absolute bottom-[8%] -left-20 text-primary-500"
      />
    </div>
  );
}
