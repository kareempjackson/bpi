/**
 * Universal media field — image or video with a /public fallback.
 *
 * The Studio's `imageWithAlt` schema names the image upload field `asset`
 * (Sanity image type), so the actual asset reference is at
 * `asset.asset._ref` after upload. When `kind === "video"`, `videoUrl`
 * holds the uploaded asset URL (resolved via GROQ `video.asset->url`) and
 * the image asset (if present) is treated as the video poster.
 */
export type SanityImage = {
  kind?: "image" | "video" | null;
  asset?:
    | {
        _type?: string;
        asset?: { _ref?: string; _type?: "reference" } | null;
        hotspot?: unknown;
        crop?: unknown;
        _key?: string;
        _ref?: string;
      }
    | null;
  videoUrl?: string | null;
  videoFallbackSrc?: string | null;
  fallbackSrc?: string | null;
  alt: string;
};

export type ResolvedMedia =
  | { kind: "image"; src: string; alt: string; poster?: undefined }
  | { kind: "video"; src: string; poster?: string; alt: string };

export type Cta = {
  label: string;
  href: string;
} | null;

export type Pillar = {
  eyebrow: string;
  description: string;
  image: SanityImage;
  bg?: string | null;
  highlight?: boolean | null;
};

export type MissionCard = {
  title: string;
  description: string;
  href: string;
  eyebrow?: string | null;
  image?: SanityImage | null;
  bg?: string | null;
};

export type Stat = {
  value: string;
  description: string;
};

export type Leader = {
  name: string;
  role: string;
  image: SanityImage;
  /** Portable Text array (rich) for new entries; legacy entries may still
      be a plain string. The renderer handles both. */
  bio?: PortableTextBlock[] | string | null;
  linkedin?: string | null;
};

export type ContactRow = {
  label: string;
  value: string;
  copyValue?: string | null;
};

export type HeroBackground = {
  kind: "video" | "image";
  videoUrl?: string | null;
  videoFallbackSrc?: string | null;
  image?: SanityImage | null;
};

export type NavLink = {
  label: string;
  href: string;
  disabled?: boolean | null;
};

export type MenuMedia = {
  kind: "image" | "video";
  image?: SanityImage | null;
  videoUrl?: string | null;
  videoFallbackSrc?: string | null;
};

export type MenuSubLink = {
  label: string;
  href: string;
  media?: MenuMedia | null;
};

export type MenuLink = {
  label: string;
  href: string;
  media?: MenuMedia | null;
  subItems?: MenuSubLink[] | null;
};

export type SiteSettings = {
  navLinks: NavLink[];
  menuLinks?: MenuLink[] | null;
  menuLegalLinks?: NavLink[] | null;
  menuSocialLinks?: SocialLink[] | null;
  menuBackground?: MenuMedia | null;
  showFooterPartners?: boolean | null;
  footerPartners?: FooterPartner[] | null;
};

export type FooterPartner = {
  name: string;
  logoUrl?: string | null;
  href?: string | null;
};

export type SocialLink = {
  kind: "Website" | "LinkedIn" | "X" | "Instagram" | "YouTube";
  href: string;
  label?: string | null;
};

export type PriorityCard = {
  title: string;
  description: string;
  href: string;
  image: SanityImage;
  color?: string | null;
};

export type SectorMedia = {
  kind: "image" | "video";
  image?: SanityImage | null;
  videoUrl?: string | null;
  videoFallbackSrc?: string | null;
  videoPoster?: SanityImage | null;
};

export type SectorNode = {
  nodeId:
    | "investment-financing"
    | "regulatory-policy"
    | "innovation-technology"
    | "research-development"
    | "workforce"
    | "market-access";
  num: string;
  title: string;
  description: string;
  media: SectorMedia;
  href?: string | null;
};

export type Initiative = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string;
  publishedAt: string;
  featured?: boolean | null;
  coverImage?: SanityImage | null;
  externalLink?: string | null;
};

/** Full initiative including the rich-text `body` for /initiatives/[slug]. */
export type InitiativeDetail = Initiative & {
  body?: PortableTextBlock[] | null;
};

export type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  coverImage?: SanityImage | null;
  externalLink?: string | null;
};

export type InitiativePost = PostSummary & {
  initiativeEyebrow?: string | null;
  initiativeTileSize?: "large" | "compact" | null;
  initiativeTileAccent?: boolean | null;
};

export type FutureStat = {
  value: string;
  body: string;
};

export type InitiativesPage = {
  seoTitle: string;
  seoDescription: string;

  heroImage?: SanityImage | null;
  heroHeadline?: string | null;
  heroBody?: string | null;
  heroPrimaryCta?: Cta | null;
  heroSecondaryCta?: Cta | null;

  showWorkInMotion?: boolean | null;
  workInMotionHeading?: string | null;
  workInMotionBody?: string | null;
  workInMotionBg?: string | null;
  workInMotionPrimaryCta?: Cta | null;
  workInMotionSecondaryCta?: Cta | null;

  featuredInitiative?: Initiative | null;
  featuredSupportingInitiatives?: Initiative[] | null;

  showMotionStories?: boolean | null;
  motionStoriesHeading?: string | null;
  motionStoriesBg?: string | null;
  motionStoriesViewAllHref?: string | null;
  motionStoriesShowCount?: number | null;

  showOtherWorks?: boolean | null;
  otherWorksEyebrow?: string | null;
  otherWorksHeading?: string | null;
  otherWorksBody?: string | null;
  otherWorksBlueTitle?: string | null;
  otherWorksBlueBody?: string | null;
  otherWorksBlueCta?: Cta | null;
  otherWorksBlueBg?: string | null;
  otherWorksGreenTitle?: string | null;
  otherWorksGreenBody?: string | null;
  otherWorksGreenBg?: string | null;
  otherWorksTopRightImages?: SanityImage[] | null;
  otherWorksBottomLeftImage?: SanityImage | null;

  buildingFutureHeading?: string | null;
  buildingFutureBody?: string | null;
  buildingFutureStats?: FutureStat[] | null;
  buildingFutureStatBg?: string | null;
};

export type HomePage = {
  seoTitle: string;
  seoDescription: string;

  heroHeadline: string;
  heroBody: string;
  heroCtaHref?: string | null;
  heroBackground: HeroBackground;

  leaderQuote: string;
  leaderBody: string;
  leaderName: string;
  leaderTitle: string;
  leaderOrg: string;
  leaderQuoteImage: SanityImage;
  leaderPortraitImage: SanityImage;
  leaderSocials: SocialLink[];

  architectureHeading: string;
  architectureDescription: string;
  architectureItems: PriorityCard[];

  sectorsHeading: string;
  sectorsBody: string;
  sectorsNodes: SectorNode[];

  whyQuote: string;
  whyAttribution: string;
  whyBody: string;
  whyCta: Cta;
  whyImage: SanityImage;

  initiativesEyebrow: string;
  initiativesHeading: string;
  initiativesViewAllHref?: string | null;
  initiativesDefaultImage: SanityImage;
  initiativesShowCount: number;

  blogHeading: string;
  blogShowCount: number;

  buildingHeadlineLine1: string;
  buildingHeadlineLine2: string;
  buildingImage: SanityImage;
  buildingPrimaryCta: Cta;
  buildingSecondaryCta: Cta;
};

export type JobCategory =
  | "Operations"
  | "Development"
  | "Marketing"
  | "Finance"
  | "Other";

export type JobSummary = {
  _id: string;
  title: string;
  slug: string;
  category: JobCategory;
  location: string;
  schedule: string;
  summary: string;
  publishedAt: string;
};

/** Sanity Portable Text block. Loosely typed — we render via @portabletext/react. */
export type PortableTextBlock = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: unknown[];
  markDefs?: unknown[];
};

export type JobSection = {
  title: string;
  content: PortableTextBlock[];
};

export type Job = JobSummary & {
  longSummary: string;
  description: string;
  sections?: JobSection[] | null;
  applyEmail?: string | null;
  applyUrl?: string | null;
};

export type CareersPage = {
  seoTitle: string;
  seoDescription: string;

  heroHeadlineLine1: string;
  heroDescription: string;
  heroImage: SanityImage;

  whyHeading: string;
  whyIntro: string;
  whyImage: SanityImage;
  whySections: { heading: string; body: string }[];
  whyBulletsHeading: string;
  whyBullets: string[];

  jobsHeading: string;
  jobsDescription: string;
  jobsSearchPlaceholder?: string | null;
  jobsFindButtonLabel?: string | null;
  jobsBg?: string | null;

  equalOpportunityParagraph1: string;
  equalOpportunityParagraph2?: string | null;
  equalOpportunityBg?: string | null;
};

export type ContactPage = {
  seoTitle: string;
  seoDescription: string;

  heroHeading: string;
  heroImage: SanityImage;
  contactRows: ContactRow[];

  formHeading: string;
  formDescription: string;
  formSubmitLabel: string;
  formBg?: string | null;
  formImage: SanityImage;
};

export type AboutPage = {
  seoTitle: string;
  seoDescription: string;

  heroImage: SanityImage;
  heroHeadline: string;
  heroSubheading: string;
  heroCta: Cta;

  visionHeading: string;
  visionDescription: string;
  visionPrimaryCta: Cta;
  visionSecondaryCta: Cta;
  visionBg?: string | null;
  pillars: Pillar[];

  differenceLeftImage?: SanityImage | null;
  differenceRightImage?: SanityImage | null;
  differenceHeading?: string | null;
  differenceBody?: string | null;
  differencePrimaryCta?: Cta | null;
  differenceSecondaryCta?: Cta | null;
  differenceOuterBg?: string | null;
  differenceInnerBg?: string | null;

  missionHeading: string;
  missionDescription: string;
  missionCards: MissionCard[];

  statsHeading: string;
  statsDescription: string;
  stats: Stat[];

  bannerImage?: SanityImage | null;

  initiativesEyebrow: string;
  initiativesHeading: string;
  initiativesShowCount: number;

  leadershipHeading: string;
  leadershipDescription: string;
  leadershipBg?: string | null;
  leaders: Leader[];
  leadershipContactHeading: string;
  leadershipContactDescription: string;
  leadershipContactPrimaryCta: Cta;
  leadershipContactSecondaryCta: Cta;
};
