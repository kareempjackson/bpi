import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import ArrowRight from "../components/ArrowRight";
import Button from "../components/Button";
import Logo from "../components/Logo";
import BlogPostShape from "../components/shapes/BlogPostShape";
import LeaderShape from "../components/shapes/LeaderShape";
import UnionShape from "../components/shapes/UnionShape";
import WhyShape from "../components/shapes/WhyShape";
import CountUp from "./CountUp";
import InitiativesPanel, { type Initiative } from "./InitiativesPanel";
import MissionCarousel from "./MissionCarousel";

export const metadata: Metadata = {
  title: "About BPI | Barbados Pharmaceutical Inc.",
  description:
    "BPI is the institution advancing pharmaceutical manufacturing, investment, and essential medicines access across the Caribbean and beyond.",
};

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
    bg: "#CAF1FF",
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
    bg: "#CAF1FF",
  },
];

type Stat = {
  value: string;
  description: string;
};

const STATS: Stat[] = [
  {
    value: "$31.3M",
    description:
      "Total investment in the AMA IV fluids manufacturing facility at Grantley Adams Industrial Estate.",
  },
  {
    value: "12M",
    description:
      "Bags of IV fluids to be produced annually, the first of their kind manufactured in the Caribbean.",
  },
  {
    value: "180M",
    description:
      "Lives touched by the PAHO revolving fund that BPI's regional supply hub will support.",
  },
  {
    value: "€3M",
    description:
      "EU PharmaNext investment mobilized to build a transatlantic pharmaceutical investment bridge.",
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
    eyebrow: "Manufacture",
    description:
      "Local production of essential medicines, starting with IV fluids, scaling to ARVs, diagnostics, and NCDs.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Pharmaceutical manufacturing line",
    bg: "#ffffff",
  },
  {
    eyebrow: "Distribute",
    description:
      "A regional logistics model that puts medicines where they are needed, reliably and at lower cost.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Regional pharmaceutical logistics",
    bg: "#83ffc1",
    highlight: true,
  },
  {
    eyebrow: "Build",
    description:
      "The regulatory, workforce, and institutional foundations that sustain a pharmaceutical sector for generations.",
    imageSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
    imageAlt: "Workforce training and regulatory development",
    bg: "#ffffff",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-error-25">
      <section className="px-5 md:px-20 lg:px-32 pt-6 md:pt-10 lg:pt-12 pb-24 md:pb-14 lg:pb-20">
        <div className="mx-auto max-w-page relative">
          <div data-reveal="scale" className="mx-auto max-w-xs md:max-w-none">
            <UnionShape
              size={1200}
              imageSrc={HERO_IMAGE}
              imageAlt="Barbados Pharmaceutical Inc. team"
              className="w-full h-auto"
            />
          </div>

          {/* Hero copy — sits inside the shape's bottom-left negative space
              at every viewport. */}
          <div
            className="absolute left-0 w-[58%] md:w-[52%] pt-2 md:pt-4 lg:pt-6 pr-3 md:pr-4 lg:pr-10"
            style={{ top: "60%" }}
          >
            <h1
              className="hero-anim font-display text-xl md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-[1.15] md:leading-[1.08] tracking-tight max-w-lg text-balance"
              style={{ "--anim-delay": "0s" } as CSSProperties}
            >
              We&apos;re not a traditional agency.
              <br />
              We&apos;re a market creator.
            </h1>
            <p
              className="hero-anim mt-3 text-sm md:text-base lg:text-lg text-primary-500/70 leading-relaxed max-w-sm"
              style={{ "--anim-delay": "0.12s" } as CSSProperties}
            >
              Established to bring access to essential medicines to Bajans,
              Caribbean people and beyond.
            </p>
            <div
              className="hero-anim mt-4 lg:mt-5 flex flex-wrap items-center gap-3"
              style={{ "--anim-delay": "0.24s" } as CSSProperties}
            >
              <a href="/contact" className="inline-flex">
                <Button variant="primary" size="sm">
                  Partner with BPI
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-6 md:pt-12 lg:pt-16 pb-6 md:pb-10 lg:pb-14">
        <div
          data-reveal-stagger
          className="mx-auto max-w-page rounded-lg px-4 py-6 md:px-8 md:py-16 lg:px-12 lg:py-24"
          style={{ backgroundColor: "#CAF1FF" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 md:gap-4 mb-4 md:mb-5 lg:mb-6">
            <div className="max-w-lg">
              <h2 className="font-display text-lg md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
                Our Vision
              </h2>
              <p className="mt-2 text-xs md:text-sm lg:text-base text-primary-500/75 leading-relaxed">
                To transform Barbados into the trusted pharmaceutical
                manufacturing gateway for the Caribbean and the Global South.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
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

          <div data-reveal-stagger className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            {PILLARS.map((pillar) => (
              <PillarCard key={pillar.eyebrow} pillar={pillar} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <div data-reveal-stagger className="max-w-2xl mb-6 lg:mb-8">
            <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              Our Mission
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              To accelerate access to high-quality, affordable medicines
              across the Caribbean by building a resilient pharmaceutical
              industry, attracting global investment, and positioning
              Barbados as the gateway to the region and beyond.
            </p>
          </div>

          <div data-reveal="fade">
          <MissionCarousel>
            {MISSION_CARDS.map((card) => (
              <MissionCardItem key={card.eyebrow} card={card} />
            ))}
          </MissionCarousel>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-page">
          <div data-reveal-stagger className="max-w-3xl mb-6 lg:mb-8">
            <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              By the Numbers
            </h2>
            <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
              In three years, BPI has gone from a founding mandate to five
              bankable projects and the first pharmaceutical trade corridor
              between Africa and the Caribbean.
            </p>
          </div>

          <div data-reveal-stagger className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {STATS.map((stat) => (
              <StatCard key={stat.value} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-8 lg:pt-10 pb-8 lg:pb-10">
        <div className="mx-auto max-w-page">
          <div
            data-reveal="scale"
            className="relative aspect-3/1 md:aspect-2/1 rounded-lg overflow-hidden"
          >
            <div
              data-parallax="0.06"
              className="absolute inset-x-0 top-[-12%] bottom-[-12%]"
            >
              <Image
                src="/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg"
                alt="Barbados Pharmaceutical Inc. team"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-8 md:pt-10 lg:pt-14 pb-10 md:pb-14 lg:pb-20">
        <div data-reveal-stagger className="mx-auto max-w-page rounded-lg bg-white px-5 py-8 md:px-8 md:py-16 lg:px-12 lg:py-24">
          <div className="mb-6 lg:mb-8">
            <p className="text-[10px] lg:text-xs font-bold tracking-[0.14em] text-primary-500/70 uppercase">
              Where Investment Meets Execution
            </p>
            <h2 className="mt-2 font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
              Initiatives
            </h2>
          </div>

          <InitiativesPanel initiatives={INITIATIVES} />
        </div>
      </section>

      <section className="px-5 md:px-20 lg:px-32 pt-8 md:pt-10 lg:pt-14 pb-10 md:pb-14 lg:pb-20">
        <div
          className="mx-auto max-w-page rounded-lg px-5 py-8 md:px-8 md:py-16 lg:px-12 lg:py-24"
          style={{ backgroundColor: "#CAF1FF" }}
        >
          <div data-reveal-stagger className="mx-auto max-w-5xl xl:max-w-6xl">
            <div className="max-w-md mb-6 lg:mb-8">
              <h2 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
                Leadership
              </h2>
              <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
                BPI is led by a team of global health strategists, investment
                specialists, and pharmaceutical sector experts united by a
                single mandate.
              </p>
            </div>

            <div data-reveal-stagger className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
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
  const cardNumber = index + 1;
  const isEven = cardNumber % 2 === 0;
  const variant: "br" | "tl" =
    cardNumber === 2 || cardNumber === 4 ? "br" : "tl";

  if (isEven) {
    const labelClass =
      variant === "br"
        ? "left-[2.7%] bottom-[6%] right-[45.6%] px-3 lg:px-4"
        : "left-[2.7%] right-[2.7%] bottom-[6%] px-3 lg:px-4";
    return (
      <div className="group relative w-full aspect-372/444">
        <LeaderShape
          variant={variant}
          imageSrc={leader.imageSrc}
          imageAlt={leader.imageAlt}
          darkBottom
          className="absolute inset-0 w-full h-full"
          imageClassName="transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
        <LeaderLabel
          name={leader.name}
          role={leader.role}
          className={labelClass}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-372/444">
      <div
        className="group absolute rounded-2xl overflow-hidden isolate transform-gpu bg-primary-500/5"
        style={{
          left: `${(10 / 372) * 100}%`,
          right: `${(10 / 372) * 100}%`,
          top: 0,
          bottom: `${(20 / 444) * 100}%`,
        }}
      >
        <Image
          src={leader.imageSrc}
          alt={leader.imageAlt}
          fill
          sizes="(min-width: 768px) 30vw, 45vw"
          className="object-cover transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        <LeaderLabel
          name={leader.name}
          role={leader.role}
          className="inset-x-0 bottom-0 px-4 lg:px-5 pb-4 lg:pb-5"
        />
      </div>
    </div>
  );
}

function LeaderLabel({
  name,
  role,
  className,
}: {
  name: string;
  role: string;
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <p className="font-display text-sm md:text-base lg:text-lg font-semibold text-white leading-tight tracking-tight">
        {name}
      </p>
      <p className="mt-1 text-[11px] md:text-xs lg:text-sm text-white/80 leading-snug">
        {role}
      </p>
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="overflow-hidden">
          <a
            href="#"
            className="mt-3 inline-flex items-center rounded-round border border-dashed border-primary-500/60 bg-error-500 px-4 py-1.5 text-sm font-semibold text-primary-500 opacity-0 translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:translate-y-0 hover:bg-error-400"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
}

function LeadershipContactCard() {
  return (
    <div className="rounded-2xl bg-transparent flex flex-col h-full aspect-372/444 p-2 lg:p-3">
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-display text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.1] tracking-tight">
          Contact Us
        </h3>
        <p className="mt-3 text-sm lg:text-base text-primary-500/75 leading-relaxed">
          The journey to health resilience and regional health security
          will require partnerships, not solo action.
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
      className="rounded-lg p-4 md:p-6 lg:p-10 flex items-stretch gap-4 md:gap-6 lg:gap-10 w-[86vw] md:w-[70vw] lg:w-[60vw] xl:w-[52vw] shrink-0 min-h-80 md:min-h-112 lg:min-h-128"
      style={{ backgroundColor: card.bg }}
    >
      <div className="flex flex-col justify-between gap-4 md:gap-5 flex-1 min-w-0">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-primary-500">
            <Logo size={60} className="text-primary-500 w-10 md:w-14 lg:w-15 h-auto" />
          </div>
          <h3 className="font-display text-base md:text-display-xs lg:text-display-sm font-semibold text-primary-500 leading-[1.15] tracking-tight">
            {card.title}
          </h3>
          <p className="text-xs md:text-sm lg:text-base text-primary-500/75 leading-relaxed max-w-md">
            {card.description}
          </p>
        </div>
        <a
          href={card.href}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-primary-500 hover:opacity-70 transition-opacity"
        >
          Learn more
          <ArrowRight />
        </a>
      </div>

      {card.imageSrc ? (
        <div data-reveal="scale" className="shrink-0 self-stretch flex items-center">
          <WhyShape
            size={420}
            imageSrc={card.imageSrc}
            imageAlt={card.imageAlt ?? ""}
            className="w-full max-w-32 md:max-w-md lg:max-w-lg h-auto"
          />
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-lg p-4 md:p-5 lg:p-6 bg-error-100 flex flex-col justify-between min-h-36 md:min-h-52 lg:min-h-64 gap-5 md:gap-8 lg:gap-10">
      <CountUp
        value={stat.value}
        className="font-display text-display-xs md:text-display-sm lg:text-display-md font-semibold text-primary-500 leading-none tracking-tight"
      />
      <p className="text-xs md:text-sm text-primary-500/75 leading-relaxed">
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
        <div data-reveal="scale" className="p-3 md:p-5 lg:p-6">
          <BlogPostShape
            size={320}
            imageSrc={pillar.imageSrc}
            imageAlt={pillar.imageAlt}
            className="w-full h-auto"
          />
        </div>
        <div className="px-4 md:px-5 lg:px-6 pb-4 md:pb-6 lg:pb-7 flex flex-col gap-2 md:gap-3">
          <span className="text-[10px] lg:text-xs font-bold tracking-[0.12em] text-primary-500 uppercase">
            {pillar.eyebrow}
          </span>
          <p className="text-xs md:text-sm lg:text-base text-primary-500/80 leading-relaxed">
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
      <div className="px-4 md:px-5 lg:px-6 pt-4 md:pt-6 lg:pt-7 flex flex-col gap-2 md:gap-3">
        <span className="text-[10px] lg:text-xs font-bold tracking-[0.12em] text-primary-500 uppercase">
          {pillar.eyebrow}
        </span>
        <p className="text-xs md:text-sm lg:text-base text-primary-500/80 leading-relaxed">
          {pillar.description}
        </p>
      </div>
      <div className="px-4 md:px-5 lg:px-6 pt-3 md:pt-5 lg:pt-6 pb-3 md:pb-5 lg:pb-6 mt-auto">
        <div data-reveal="scale" className="relative aspect-video md:aspect-5/4 rounded-sm overflow-hidden">
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
