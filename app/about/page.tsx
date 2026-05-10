import type { Metadata } from "next";
import Image from "next/image";

import ArrowRight from "../components/ArrowRight";
import Button from "../components/Button";
import Logo from "../components/Logo";
import MenuLauncher from "../components/MenuLauncher";
import BlogPostShape from "../components/shapes/BlogPostShape";
import LeaderShape from "../components/shapes/LeaderShape";
import UnionShape from "../components/shapes/UnionShape";
import WhyShape from "../components/shapes/WhyShape";
import InitiativesPanel, { type Initiative } from "./InitiativesPanel";
import MissionCarousel from "./MissionCarousel";

export const metadata: Metadata = {
  title: "About — BPI",
  description:
    "Advancing Caribbean Excellence in Pharmaceutical Innovation. Building a regional hub for life sciences innovation, manufacturing, and regulatory leadership across the CARICOM.",
};

const NAV_LINKS = [
  { label: "ECOSYSTEM", href: "/#ecosystem" },
  { label: "ABOUT", href: "/about" },
  { label: "INITIATIVE", href: "/#initiative" },
];

const HERO_IMAGE = "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg";

type Pillar = {
  eyebrow: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bg: string;
  highlight?: boolean;
};

type MissionCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  bg: string;
};

const MISSION_CARDS: MissionCard[] = [
  {
    eyebrow: "Innovation Hub",
    title: "Human Capital Development",
    description:
      "Building world-class pharmaceutical talent through education, training, and skills development programs",
    href: "/initiatives/human-capital",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Researcher working in pharmaceutical lab",
    bg: "#cee2ef",
  },
  {
    eyebrow: "Regional Excellence",
    title: "Human Capital Development",
    description:
      "Building world-class pharmaceutical talent through education, training, and skills development programs",
    href: "/initiatives/regional-excellence",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Pharmaceutical training session",
    bg: "#9bffcd",
  },
  {
    eyebrow: "Manufacturing Capacity",
    title: "Human Capital Development",
    description:
      "Building world-class pharmaceutical talent through education, training, and skills development programs",
    href: "/initiatives/manufacturing-capacity",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Manufacturing facility tour",
    bg: "#cee2ef",
  },
];

type Stat = {
  value: string;
  description: string;
};

const STATS: Stat[] = [
  {
    value: "13000 +",
    description:
      "Our work is driven by a commitment to quality standards, responsible innovation",
  },
  {
    value: "21000 +",
    description:
      "Our work is driven by a commitment to quality standards, responsible innovation",
  },
  {
    value: "3000 +",
    description:
      "Our work is driven by a commitment to quality standards, responsible innovation",
  },
  {
    value: "122 +",
    description:
      "Our work is driven by a commitment to quality standards, responsible innovation",
  },
];

const INITIATIVES: Initiative[] = [
  {
    title: "AMA IV Fluids Manufacturing",
    subtitle: "Grantley Adams Industrial Estate",
    description:
      "The first Africa–Caribbean pharmaceutical trade corridor. 12 million units annually. A corridor, not a pilot.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "AMA IV Fluids facility lead",
  },
  {
    title: "PAHO Regional Supply Hub",
    description:
      "Serving 40+ countries across the Caribbean and Latin America.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "PAHO Regional Supply Hub lead",
  },
  {
    title: "EU PharmaNext",
    description: "€3M transatlantic pharmaceutical investment bridge.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "EU PharmaNext partnership lead",
  },
  {
    title: "BMPRA Regulatory Development",
    description:
      "Barbados's own standard-holder, built with WHO and PAHO.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BMPRA regulatory lead",
  },
];

type Leader = {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
  notch?: "top-left" | "top-right";
};

const LEADERS: Leader[] = [
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
    notch: "top-right",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
    notch: "top-left",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
  },
  {
    name: "Name here",
    role: "Short text here title/something",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "BPI leader",
    notch: "top-right",
  },
];

const PILLARS: Pillar[] = [
  {
    eyebrow: "Research & Development",
    description:
      "Driving pharmaceutical innovation through continuous scientific advancement.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Cargo at delivery hub at sunrise",
    bg: "#ffffff",
  },
  {
    eyebrow: "Manufacturing Excellence",
    description:
      "Delivering quality focused pharmaceutical production with international standards.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Researcher in laboratory coat",
    bg: "#83ffc1",
    highlight: true,
  },
  {
    eyebrow: "Supply Chain & Distribution",
    description:
      "Strengthening pharmaceutical accessibility through efficient logistics and distribution systems.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Cargo at delivery hub at sunrise",
    bg: "#ffffff",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-error-25">
      <header className="relative px-8 lg:px-12 pt-6 lg:pt-8">
        <a href="/" aria-label="BPI home" className="inline-block">
          <Logo size={140} className="text-primary-500" />
        </a>
        <div className="absolute top-4 right-6 lg:top-6 lg:right-8 flex items-center gap-7 lg:gap-9">
          <nav data-hide-on-menu className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-bold tracking-[0.08em] text-primary-500">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <MenuLauncher size={95} />
        </div>
      </header>

      <section className="px-12 md:px-20 lg:px-32 pt-12 md:pt-16 lg:pt-20 pb-12 lg:pb-16">
        <div className="mx-auto max-w-page relative">
          <UnionShape
            size={1200}
            imageSrc={HERO_IMAGE}
            imageAlt="Barbados Pharmaceutical Inc. team"
            className="w-full h-auto"
          />

          <div
            className="absolute left-0 w-[54%] pt-5 lg:pt-8 pr-4 lg:pr-10"
            style={{ top: "59.5%" }}
          >
            <h1 className="font-display text-display-sm md:text-display-md lg:text-display-lg font-semibold text-primary-500 leading-[1.05]">
              Advancing Caribbean Excellence in Pharmaceutical Innovation
            </h1>
            <p className="mt-3 lg:mt-4 text-xs lg:text-sm text-primary-500/80 leading-relaxed max-w-sm">
              Building a regional hub for life sciences innovation,
              manufacturing, and regulatory leadership across the CARICOM
            </p>
            <div className="mt-5 lg:mt-6 flex flex-wrap items-center gap-3">
              <a href="/contact" className="inline-flex">
                <Button variant="primary" size="sm">
                  Partner With BPI
                </Button>
              </a>
              <a href="/#ecosystem" className="inline-flex">
                <Button variant="tertiary" size="sm">
                  Our Ecosystem
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-8 md:pt-12 lg:pt-16 pb-8 lg:pb-10">
        <div
          className="mx-auto max-w-page rounded-lg p-6 md:p-8 lg:p-10"
          style={{ backgroundColor: "#cee2ef" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 lg:mb-10">
            <div className="max-w-xl">
              <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
                Our Vision
              </h2>
              <p className="mt-3 text-sm lg:text-md text-primary-500/80 leading-relaxed">
                To become a globally respected pharmaceutical company
                recognized for advancing healthcare accessibility, research
                excellence, and regional pharmaceutical leadership.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a href="/contact" className="inline-flex">
                <Button variant="primary" size="sm">
                  Partner With BPI
                </Button>
              </a>
              <a href="/#initiative" className="inline-flex">
                <Button variant="tertiary" size="sm">
                  Explore Our Impact
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {PILLARS.map((pillar) => (
              <PillarCard key={pillar.eyebrow} pillar={pillar} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-12 lg:pt-16 pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <div className="max-w-2xl mb-8 lg:mb-10">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Our Mission
            </h2>
            <p className="mt-3 text-xs lg:text-sm text-primary-500/80 leading-relaxed">
              Our mission is to create a pharmaceutical ecosystem where every
              person in the Caribbean has access to healthy, innovative, and
              affordable medicines while building regional manufacturing
              excellence.
            </p>
          </div>

          <MissionCarousel>
            {MISSION_CARDS.map((card) => (
              <MissionCardItem key={card.eyebrow} card={card} />
            ))}
          </MissionCarousel>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-12 lg:pt-16 pb-14 lg:pb-20">
        <div className="mx-auto max-w-page">
          <div className="max-w-3xl mb-8 lg:mb-10">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Building The Future Of Pharmaceutical Access
            </h2>
            <p className="mt-3 text-xs lg:text-sm text-primary-500/80 leading-relaxed">
              Barbados Pharmaceutical Inc. was established with a vision to
              strengthen pharmaceutical capacity within the region while
              supporting global healthcare advancement. We operate at the
              intersection of pharmaceutical production, education, research,
              and strategic healthcare development.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
            {STATS.map((stat) => (
              <StatCard key={stat.value} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-8 lg:pt-12 pb-6 lg:pb-8">
        <div className="mx-auto max-w-page">
          <div className="relative aspect-16/7 rounded-lg overflow-hidden">
            <Image
              src="/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg"
              alt="Barbados Pharmaceutical Inc. team"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-4 lg:pt-6 pb-14 lg:pb-20">
        <div className="mx-auto max-w-page rounded-lg bg-white p-6 md:p-8 lg:p-12">
          <div className="mb-8 lg:mb-10">
            <p className="text-[10px] lg:text-xs font-bold tracking-[0.12em] text-primary-500/70 uppercase">
              What we&apos;re building
            </p>
            <h2 className="mt-2 font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Initiatives
            </h2>
          </div>

          <InitiativesPanel initiatives={INITIATIVES} />
        </div>
      </section>

      <section className="px-12 md:px-20 lg:px-32 pt-4 lg:pt-6 pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg p-6 md:p-8 lg:p-12"
          style={{ backgroundColor: "#cee2ef" }}
        >
          <div className="max-w-md mb-8 lg:mb-10">
            <h2 className="font-display text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.1]">
              Leadership
            </h2>
            <p className="mt-3 text-xs lg:text-sm text-primary-500/80 leading-relaxed">
              Barbados Pharmaceutical Inc. was established with a vision to
              strengthen pharmaceutical capacity within the region while
              supporting global healthcare advancement.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
            {LEADERS.map((leader, idx) => (
              <LeaderCard
                key={leader.name + leader.role + idx}
                leader={leader}
                index={idx}
              />
            ))}
            <LeadershipContactCard />
          </div>
        </div>
      </section>
    </main>
  );
}

function LeaderCard({
  leader,
  index,
}: {
  leader: Leader;
  index: number;
}) {
  // 1-based card numbers: 2 + 4 use leader2/leader4 (notch bottom-right),
  // 6 + 8 use leader6/leader8 (notch top-left). Odd cards stay plain.
  const cardNumber = index + 1;
  const isEven = cardNumber % 2 === 0;
  const variant: "br" | "tl" = cardNumber === 2 || cardNumber === 4 ? "br" : "tl";

  if (isEven) {
    return (
      <div className="relative w-full aspect-372/444">
        <LeaderShape
          variant={variant}
          imageSrc={leader.imageSrc}
          imageAlt={leader.imageAlt}
          darkBottom
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute left-[2.7%] right-[2.7%] bottom-[6%] px-3 lg:px-4 pointer-events-none">
          <p className="font-display text-md lg:text-lg font-bold text-white leading-tight">
            {leader.name}
          </p>
          <p className="mt-0.5 text-xs lg:text-sm text-white/85 leading-snug">
            {leader.role}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-372/444 rounded-lg overflow-hidden bg-primary-500">
      <Image
        src={leader.imageSrc}
        alt={leader.imageAlt}
        fill
        sizes="(min-width: 768px) 30vw, 45vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent pt-10 pb-4 px-4 lg:pb-5 lg:px-5">
        <p className="font-display text-md lg:text-lg font-bold text-white leading-tight">
          {leader.name}
        </p>
        <p className="mt-0.5 text-xs lg:text-sm text-white/85 leading-snug">
          {leader.role}
        </p>
      </div>
    </div>
  );
}

function LeadershipContactCard() {
  return (
    <div className="rounded-lg bg-transparent flex flex-col h-full aspect-372/444 p-2 lg:p-3">
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1]">
          Contact Us
        </h3>
        <p className="mt-3 text-xs lg:text-sm text-primary-500/80 leading-relaxed">
          Get in touch with BPI — we&apos;re here to answer your questions,
          support your journey, and help you connect with opportunities in
          pharmaceutical innovation and supply chain excellence.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a href="/contact" className="inline-flex">
          <Button variant="primary" size="sm">
            Contact Us
          </Button>
        </a>
        <a href="/#initiative" className="inline-flex">
          <Button variant="tertiary" size="sm">
            Our initiatives
          </Button>
        </a>
      </div>
    </div>
  );
}

function MissionCardItem({ card }: { card: MissionCard }) {
  return (
    <div
      className="rounded-lg p-6 lg:p-8 flex items-stretch gap-6 lg:gap-8 w-140 lg:w-160 shrink-0 min-h-72 lg:min-h-88"
      style={{ backgroundColor: card.bg }}
    >
      <div className="flex flex-col justify-between gap-6 flex-1 min-w-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary-500">
            <Logo size={60} className="text-primary-500" />
          </div>
          <h3 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.15]">
            {card.title}
          </h3>
          <p className="text-xs lg:text-sm text-primary-500/80 leading-relaxed max-w-xs">
            {card.description}
          </p>
        </div>
        <a
          href={card.href}
          className="inline-flex items-center gap-2 text-xs lg:text-sm font-semibold text-primary-500 hover:opacity-70 transition-opacity"
        >
          Learn more
          <ArrowRight />
        </a>
      </div>

      {card.imageSrc ? (
        <div className="shrink-0 self-stretch flex items-center">
          <WhyShape
            size={240}
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt ?? ""}
            className="w-full max-w-60 h-auto"
          />
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-lg p-6 lg:p-8 bg-error-100 flex flex-col justify-between min-h-64 lg:min-h-80 gap-12 lg:gap-16">
      <p className="font-display text-display-md lg:text-display-lg font-semibold text-primary-500 leading-none">
        {stat.value}
      </p>
      <p className="text-xs text-primary-500/80 leading-relaxed">
        {stat.description}
      </p>
    </div>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  if (pillar.highlight) {
    return (
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{ backgroundColor: pillar.bg }}
      >
        <div className="p-5 lg:p-6">
          <BlogPostShape
            size={320}
            imageSrc={pillar.imageSrc}
            imageAlt={pillar.imageAlt}
            className="w-full h-auto"
          />
        </div>
        <div className="px-5 lg:px-6 pb-6 lg:pb-7 flex flex-col gap-3">
          <span className="text-[10px] lg:text-xs font-bold tracking-[0.12em] text-primary-500 uppercase">
            {pillar.eyebrow}
          </span>
          <p className="text-xs lg:text-sm text-primary-500/80 leading-relaxed">
            {pillar.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{ backgroundColor: pillar.bg }}
    >
      <div className="px-5 lg:px-6 pt-6 lg:pt-7 flex flex-col gap-3">
        <span className="text-[10px] lg:text-xs font-bold tracking-[0.12em] text-primary-500 uppercase">
          {pillar.eyebrow}
        </span>
        <p className="text-xs lg:text-sm text-primary-500/80 leading-relaxed">
          {pillar.description}
        </p>
      </div>
      <div className="px-5 lg:px-6 pt-5 lg:pt-6 pb-5 lg:pb-6 mt-auto">
        <div className="relative aspect-5/4 rounded-sm overflow-hidden">
          <Image
            src={pillar.imageSrc}
            alt={pillar.imageAlt}
            fill
            sizes="(min-width: 768px) 30vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
