import type { Metadata } from "next";

import LegalDocument, { type LegalSection } from "@/app/components/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Use — BPI",
  description:
    "The terms governing your use of the Barbados Pharmaceutical Inc. website.",
};

const LAST_UPDATED = "June 17, 2026";

const INTRO =
  "These Terms of Use govern your access to and use of the Barbados Pharmaceutical Inc. (“BPI”, “we”, “us”) website and any content, features, or services offered through it. By accessing or using the site, you agree to be bound by these terms. If you do not agree, please do not use the site.";

const SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: [
      "By accessing this website you confirm that you are at least the age of majority in your jurisdiction and that you have read, understood, and agree to be bound by these Terms of Use, together with our Privacy Policy.",
      "We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.",
    ],
  },
  {
    heading: "Use of the Site",
    body: [
      "You agree to use the site only for lawful purposes and in a way that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, the site by any third party.",
    ],
    bullets: [
      "Do not attempt to gain unauthorized access to any part of the site, its servers, or connected systems.",
      "Do not use the site to transmit malware, conduct automated scraping, or interfere with its normal operation.",
      "Do not misrepresent your identity or affiliation with any person or organization.",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      "All content on this site — including text, graphics, logos, images, video, and the BPI name and marks — is owned by or licensed to Barbados Pharmaceutical Inc. and is protected by applicable intellectual property laws.",
      "You may view and download content for personal, non-commercial reference only. Any other use, including reproduction or redistribution, requires our prior written consent. Use of BPI brand assets is additionally governed by our Media Assets Terms of Use.",
    ],
  },
  {
    heading: "No Medical or Professional Advice",
    body: [
      "Content on this site is provided for general informational purposes only and does not constitute medical, legal, financial, or other professional advice. It should not be relied upon as a substitute for advice from a qualified professional.",
    ],
  },
  {
    heading: "Forward-Looking Statements",
    body: [
      "Some content describes plans, projections, and objectives for future operations. These are forward-looking statements that involve risks and uncertainties; actual results may differ materially, and we undertake no obligation to update them.",
    ],
  },
  {
    heading: "Third-Party Links",
    body: [
      "The site may contain links to third-party websites or resources. We provide these links for convenience only and are not responsible for the content, accuracy, or practices of any third-party site.",
    ],
  },
  {
    heading: "Disclaimers",
    body: [
      "The site is provided on an “as is” and “as available” basis without warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the site will be uninterrupted, error-free, or secure.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Barbados Pharmaceutical Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of, or inability to use, the site.",
    ],
  },
  {
    heading: "Governing Law",
    body: [
      "These Terms of Use are governed by and construed in accordance with the laws of Barbados, without regard to its conflict of laws principles. You agree to submit to the exclusive jurisdiction of the courts of Barbados.",
    ],
  },
  {
    heading: "Contact Us",
    body: [
      "If you have questions about these Terms of Use, please reach out through our contact page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  );
}
