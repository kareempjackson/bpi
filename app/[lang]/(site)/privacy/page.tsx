import type { Metadata } from "next";

import LegalDocument, { type LegalSection } from "@/app/components/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy — BPI",
  description:
    "How Barbados Pharmaceutical Inc. collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 17, 2026";

const INTRO =
  "This Privacy Policy explains how Barbados Pharmaceutical Inc. (“BPI”, “we”, “us”) collects, uses, shares, and protects information about you when you visit our website, subscribe to our newsletter, contact us, or request access to our investor and partner portal.";

const SECTIONS: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: ["We collect information in the following ways:"],
    bullets: [
      "Information you provide — such as your name, email address, organization, and any message content when you contact us, subscribe to updates, or request portal access.",
      "Information collected automatically — such as your IP address, browser type, device information, and pages visited, gathered through cookies and similar technologies.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: ["We use the information we collect to:"],
    bullets: [
      "Respond to your enquiries and provide the information or access you request.",
      "Send newsletters and updates about BPI news, initiatives, and partnerships, where you have opted in.",
      "Operate, maintain, secure, and improve our website and services.",
      "Comply with legal obligations and enforce our terms.",
    ],
  },
  {
    heading: "Legal Bases for Processing",
    body: [
      "Where applicable law requires it, we process your personal information on the basis of your consent, the performance of a contract, our legitimate interests in operating BPI, and compliance with legal obligations.",
    ],
  },
  {
    heading: "Sharing of Information",
    body: [
      "We do not sell your personal information. We may share it with service providers who process data on our behalf (such as email, hosting, and analytics providers), with professional advisers, and where required by law or to protect our rights.",
    ],
  },
  {
    heading: "Cookies and Tracking",
    body: [
      "We use cookies and similar technologies to operate the site, remember your preferences, and understand how the site is used. You can control cookies through your browser settings; disabling some cookies may affect site functionality.",
    ],
  },
  {
    heading: "Data Security",
    body: [
      "We maintain reasonable administrative, technical, and physical safeguards designed to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain personal information only for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required or permitted by law.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal information, to object to processing, and to withdraw consent. To exercise these rights, contact us using the details below.",
    ],
  },
  {
    heading: "International Transfers",
    body: [
      "Your information may be processed in countries other than your own. Where we transfer personal information internationally, we take steps to ensure it receives an adequate level of protection.",
    ],
  },
  {
    heading: "Children's Privacy",
    body: [
      "Our website is not directed to children, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. We will post the updated version on this page and revise the “Last updated” date above.",
    ],
  },
  {
    heading: "Contact Us",
    body: [
      "If you have questions about this Privacy Policy or how we handle your information, please reach out through our contact page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS}
    />
  );
}
