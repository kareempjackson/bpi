/**
 * Universal media field — `imageWithAlt` accepts either an image or a
 * video. `kind` discriminates; `asset` is the image (rendered when
 * kind=image, or used as the poster when kind=video); `videoUrl` is
 * the resolved CDN URL of the uploaded MP4 (projected in GROQ via
 * `"videoUrl": video.asset->url`).
 */
export type SanityImage = {
  kind?: "image" | "video" | "audio" | null;
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
  audioUrl?: string | null;
  alt: string;
};

export type ResolvedMedia =
  | { kind: "image"; src: string; alt: string; poster?: undefined }
  | { kind: "video"; src: string; poster?: string; alt: string }
  | { kind: "audio"; src: string; poster?: string; alt: string };

export type Cta = {
  label: string;
  href: string;
} | null;

export type Pillar = {
  eyebrow: string;
  description: PortableTextBlock[] | string | null;
  /** `imageWithAlt` — accepts image OR video (its own `kind` field
      discriminates; `videoUrl` is on the nested object when set). */
  image?: SanityImage | null;
  bg?: string | null;
  highlight?: boolean | null;
};

export type MissionCard = {
  title: string;
  description: PortableTextBlock[] | string | null;
  href?: string | null;
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

/** A post/initiative referenced by a hero background, with its cover media
 *  resolved so the hero can reuse it in place of a standalone upload. */
export type HeroReferenceCover = {
  _type: "post" | "initiative";
  cover?: SanityImage | null;
};

export type HeroBackground = {
  kind: "video" | "image" | "content";
  videoUrl?: string | null;
  image?: SanityImage | null;
  /** Set when `kind === "content"` — reuse this item's cover as the background. */
  reference?: HeroReferenceCover | null;
};

export type HeroSlideData = {
  headline: string;
  body?: PortableTextBlock[] | string | null;
  ctaHref?: string | null;
  background?: HeroBackground | null;
  thumbnail?: SanityImage | null;
};

export type HeroFeatureData = {
  label?: string | null;
  eyebrow?: string | null;
  href?: string | null;
  videoUrl?: string | null;
  poster?: SanityImage | null;
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
};

export type MenuSubLink = {
  label: string;
  // Resolved in GROQ from either a custom href or a referenced
  // initiative/post/job; can be null if a reference is unresolved.
  href: string | null;
  media?: MenuMedia | null;
};

export type MenuLink = {
  label: string;
  href?: string | null;
  /** When true, the main link is non-clickable — only its sub-links work. */
  disableLink?: boolean | null;
  media?: MenuMedia | null;
  subItems?: MenuSubLink[] | null;
};

/** Site-wide announcement bar (top of every page). Gated on `enabled`. */
export type AnnouncementBand = {
  enabled?: boolean | null;
  text?: string | null;
  link?: Cta;
  tone?: "dark" | "green" | "blue" | null;
};

/** Site-wide CTA band (above the footer on every page). Gated on `enabled`. */
export type GlobalCtaBand = {
  enabled?: boolean | null;
  heading?: string | null;
  body?: PortableTextBlock[] | string | null;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  tone?: "green" | "blue" | null;
};

export type SiteSettings = {
  navLinks: NavLink[];
  menuLinks?: MenuLink[] | null;
  menuLegalLinks?: NavLink[] | null;
  menuSocialLinks?: SocialLink[] | null;
  menuBackground?: MenuMedia | null;
  footerTagline?: string;
  footerNavGroups?: { title: string; links: { label: string; href: string }[] }[];
  footerLegalLinks?: { label: string; href: string; disabled?: boolean }[];
  footerRights?: string;
  announcement?: AnnouncementBand | null;
  globalCta?: GlobalCtaBand | null;
};

export type SocialLink = {
  kind: "Website" | "LinkedIn" | "X" | "Instagram" | "YouTube";
  href: string;
  label?: string | null;
};

export type PriorityCard = {
  title: string;
  description: PortableTextBlock[] | string | null;
  href: string;
  image: SanityImage;
  color?: string | null;
};

export type SectorMedia = {
  kind: "image" | "video";
  image?: SanityImage | null;
  videoUrl?: string | null;
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
  description: PortableTextBlock[] | string | null;
  media: SectorMedia;
  href?: string | null;
};

export type Initiative = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  tag?: string | null;
  excerpt: string;
  publishedAt: string;
  featured?: boolean | null;
  /**
   * When false, the initiative is display-only — show in lists but don't
   * link to a detail page. `externalLink` (if set) overrides this.
   * Treat absent as `true` for backwards compatibility.
   */
  hasDetailPage?: boolean | null;
  coverImage?: SanityImage | null;
  externalLink?: string | null;
};

/** Full initiative including the rich-text `body` for /initiatives/[slug]. */
export type InitiativeDetail = Initiative & {
  headerType?: "editorial" | "type1" | "type2" | "type3" | "type4" | null;
  headerTitle?: string | null;
  /** Type 2 only — the offset second line of the split title lockup. */
  headerTitleTail?: string | null;
  headerSubtitle?: string | null;
  headerImage?: SanityImage | null;
  headerPrimaryCta?: Cta;
  headerSecondaryCta?: Cta;
  /** Absent/true = render the standard body/quote/why-matters sections. */
  showDefaultSections?: boolean | null;
  /** Absent/false = hide the "Latest from BPI" blog section (opt-in). */
  showBlog?: boolean | null;
  /** Absent/true = render the Careers closer. */
  showCareers?: boolean | null;
  /** Absent/true = render the call-to-action closer. */
  showCta?: boolean | null;
  body?: PortableTextBlock[] | null;
  pageColor?: string | null;
  showQuote?: boolean | null;
  quoteSupporting?: PortableTextBlock[] | string | null;
  quoteText?: string | null;
  quoteAttribution?: string | null;
  quoteImage?: SanityImage | null;
  whyMattersHeading?: string | null;
  whyMattersBody?: PortableTextBlock[] | string | null;
  whyMattersImage?: SanityImage | null;
  impactHeading?: string | null;
  impactBody?: PortableTextBlock[] | string | null;
  impactStats?: { value?: string | null; label?: string | null }[] | null;
  showWhatThisIs?: boolean | null;
  /** Absent = "stacked" (the original layout). */
  whatThisIsLayout?:
    | "stacked"
    | "stackedLead"
    | "beside"
    | "imageBeside"
    | null;
  whatThisIsHeading?: string | null;
  whatThisIsBody?: string | null;
  /** "imageBeside" layout only. */
  whatThisIsImage?: SanityImage | null;
  /** "imageBeside" layout only. */
  whatThisIsCta?: Cta;
  metricsHeading?: string | null;
  keyMetrics?:
    | { value?: string | null; note?: string | null; label?: string | null }[]
    | null;
  showDevelopments?: boolean | null;
  /** Absent = "imageBeside" (the original layout). */
  developmentsLayout?: "imageBeside" | "imageBelow" | "noImage" | null;
  developmentsHeading?: string | null;
  developmentsImage?: SanityImage | null;
  developmentsBody?: string | null;
  developmentsCta?: Cta;
  showWhyBarbados?: boolean | null;
  whyBarbadosHeading?: string | null;
  whyBarbadosBody?: string | null;
  whyBarbadosCta?: Cta;
  whyBarbadosImage?: SanityImage | null;
  ecosystemHeading?: string | null;
  ecosystemBody?: PortableTextBlock[] | string | null;
  ecosystemCta?: Cta;
  showCurrentStatus?: boolean | null;
  currentStatusHeading?: string | null;
  currentStatusImage?: SanityImage | null;
  currentStatusLead?: string | null;
  currentStatusBody?: PortableTextBlock[] | string | null;
  currentStatusPrimaryCta?: Cta;
  currentStatusSecondaryCta?: Cta;
  /** The closing italic note under Current Status — NOT the `nextSteps*`
      bullets card below. */
  outlookHeading?: string | null;
  outlookBody?: string | null;
  showNextSteps?: boolean | null;
  /** Absent = true; false renders a bullets-only card. */
  showNextStepsCta?: boolean | null;
  nextStepsHeading?: string | null;
  nextStepsBody?: string | null;
  nextStepsCta?: Cta;
  /** Financing Approach — dark card: heading left; body + button, a rule, an
   *  italic quote and an attribution (photo, name, role, socials) right. */
  showFinancing?: boolean | null;
  financingHeading?: string | null;
  financingBody?: PortableTextBlock[] | string | null;
  /** Absent = true; false renders the card with no button. */
  showFinancingCta?: boolean | null;
  financingCta?: Cta;
  financingQuote?: PortableTextBlock[] | string | null;
  financingName?: string | null;
  financingRole?: string | null;
  financingImage?: SanityImage | null;
  financingSocials?: SocialLink[] | null;
  /** The closing mid-blue band — NOT the `outlook*` note under Current Status. */
  showRoadmap?: boolean | null;
  roadmapEyebrow?: string | null;
  roadmapHeading?: string | null;
  roadmapStatement?: string | null;
  roadmapCta?: Cta;
  roadmapImage?: SanityImage | null;
  showPhases?: boolean | null;
  phasesHeading?: string | null;
  phases?:
    | { title?: string | null; body?: PortableTextBlock[] | string | null }[]
    | null;
  phasesImage?: SanityImage | null;
  relevanceHeading?: string | null;
  relevanceBody?: PortableTextBlock[] | string | null;
  relevanceCta?: Cta;
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

// ── Events ──────────────────────────────────────────────────────────────────
export type EventTicketTier = {
  name: string;
  kind: "free" | "paid";
  price?: number | null;
  /** Capacity for this tier; absent = unlimited. Only used by the Eventbrite sync. */
  quantityTotal?: number | null;
};

/** Event as projected for the /events grid (see EVENTS_QUERY). */
export type EventSummary = {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  startAt: string;
  endAt?: string | null;
  timezone?: string | null;
  featured?: boolean | null;
  currency?: string | null;
  image?: SanityImage | null;
  /** Set once the event syncs to Eventbrite; absent until then. */
  eventbriteId?: string | null;
  eventbriteUrl?: string | null;
  tickets?: EventTicketTier[] | null;
};

/** Full event for the /events/[slug] detail page — adds the rich
    description + location fields and per-tier capacity. */
export type EventDetail = EventSummary & {
  description?: PortableTextBlock[] | null;
  locationType?: "online" | "venue" | null;
  venueName?: string | null;
  venueAddress?: string | null;
};

/** External event BPI attends (see ENGAGEMENTS_QUERY). Split into
    "Attending next" / "Where we've been" on the /events page by `date`. */
export type EngagementSummary = {
  _id: string;
  name: string;
  location: string;
  /** ISO date, "YYYY-MM-DD". */
  date: string;
  /** Rich text (WYSIWYG); legacy/fallback entries may be a plain string. */
  purpose?: PortableTextBlock[] | string | null;
  link?: string | null;
};

/** The /events page singleton — surrounding copy for the three sections
    (see EVENTS_PAGE_QUERY). Cards themselves come from `event`/`engagement`. */
export type EventsPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  title?: string | null;
  upcomingHeading?: string | null;
  upcomingIntro?: PortableTextBlock[] | string | null;
  attendingHeading?: string | null;
  attendingIntro?: PortableTextBlock[] | string | null;
  attendingEmptyState?: PortableTextBlock[] | string | null;
  pastHeading?: string | null;
  pastIntro?: PortableTextBlock[] | string | null;
};

// ── Blog ──────────────────────────────────────────────────────────────────
export type ContentType = "article" | "news" | "resource" | "report";

export type TagRef = {
  title: string;
  slug: string;
  color?: string | null;
};

/** Blog post as projected for the /blog index cards + featured hero. */
export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  contentType: ContentType;
  tags?: TagRef[] | null;
  wideTile?: boolean | null;
  coverImage?: SanityImage | null;
  externalLink?: string | null;
};

export type BlogAttachment = {
  label: string;
  url?: string | null;
  filename?: string | null;
  size?: number | null;
};

/** Full post for /blog/[slug] — adds the rich body + downloadable files. */
export type BlogPostDetail = BlogPost & {
  body?: PortableTextBlock[] | null;
  attachments?: BlogAttachment[] | null;
};

/**
 * A modular page block (Call to action / Careers) from a page's `pageSections`
 * list. One shape covers both block types; fields a given block lacks are null.
 */
export type PageSection = {
  _type: "ctaSection" | "careersSection";
  _key: string;
  enabled?: boolean | null;
  eyebrow?: string | null;
  heading?: string | null;
  lead?: string | null;
  body?: string | null;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  media?: SanityImage | null;
  tone?: string | null;
};

export type BlogPage = {
  pageSections?: PageSection[] | null;
  heading?: string | null;
  intro?: PortableTextBlock[] | string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featuredPost?: BlogPost | null;
};

export type FutureStat = {
  value: string;
  body: string;
};

export type InitiativesPage = {
  pageSections?: PageSection[] | null;
  seoTitle: string;
  seoDescription: string;

  heroImage?: SanityImage | null;
  heroHeadline?: string | null;
  heroBody?: PortableTextBlock[] | string | null;
  heroPrimaryCta?: Cta | null;
  heroSecondaryCta?: Cta | null;

  showWorkInMotion?: boolean | null;
  workInMotionHeading?: string | null;
  workInMotionBody?: PortableTextBlock[] | string | null;
  workInMotionBg?: string | null;
  workInMotionPrimaryCta?: Cta | null;
  workInMotionSecondaryCta?: Cta | null;
  workInMotionImage?: SanityImage | null;

  featuredInitiative?: Initiative | null;
  featuredStatBody?: PortableTextBlock[] | string | null;
  featuredSupportingInitiatives?: Initiative[] | null;

  showMotionStories?: boolean | null;
  motionStoriesHeading?: string | null;
  motionStoriesBg?: string | null;
  motionStoriesViewAllHref?: string | null;
  motionStoriesShowCount?: number | null;

  showOtherWorks?: boolean | null;
  otherWorksEyebrow?: string | null;
  otherWorksHeading?: string | null;
  otherWorksBody?: PortableTextBlock[] | string | null;
  otherWorksBlueTitle?: string | null;
  otherWorksBlueBody?: PortableTextBlock[] | string | null;
  otherWorksBlueCta?: Cta | null;
  otherWorksBlueBg?: string | null;
  otherWorksGreenTitle?: string | null;
  otherWorksGreenBody?: PortableTextBlock[] | string | null;
  otherWorksGreenBg?: string | null;
  otherWorksTopRightImages?: SanityImage[] | null;
  otherWorksBottomLeftImage?: SanityImage | null;
  otherWorksInitiatives?: Initiative[] | null;
  otherWorksFeaturedTitle?: string | null;
  otherWorksFeaturedImage?: SanityImage | null;
  otherWorksFeaturedHref?: string | null;

  buildingFutureHeading?: string | null;
  buildingFutureBody?: PortableTextBlock[] | string | null;
  buildingFutureStats?: FutureStat[] | null;
  buildingFutureStatBg?: string | null;
};

export type HomePage = {
  pageSections?: PageSection[] | null;
  seoTitle: string;
  seoDescription: string;

  heroHeadline: string;
  heroBody: PortableTextBlock[] | string | null;
  heroCtaHref?: string | null;
  heroBackground: HeroBackground;
  heroSlides?: HeroSlideData[] | null;
  heroFeature?: HeroFeatureData | null;

  leaderQuote: PortableTextBlock[] | string | null;
  leaderBody: string;
  leaderName: string;
  leaderTitle: string;
  leaderOrg: string;
  leaderQuoteImage: SanityImage;
  leaderPortraitImage: SanityImage;
  leaderSocials: SocialLink[];

  architectureHeading: string;
  architectureDescription: PortableTextBlock[] | string | null;
  architectureItems: PriorityCard[];
  architectureFeature?: SanityImage | null;

  sectorsHeading: string;
  sectorsBody: PortableTextBlock[] | string | null;
  sectorsNodes: SectorNode[];

  whyQuote: PortableTextBlock[] | string | null;
  whyAttribution: string;
  whyBody: PortableTextBlock[] | string | null;
  whyCta: Cta;
  whyImage: SanityImage;

  initiativesEyebrow: string;
  initiativesHeading: string;
  initiativesViewAllHref?: string | null;
  initiativesDefaultImage: SanityImage;
  initiativesShowCount: number;

  blogHeading: string;
  blogShowCount: number;

  careersEyebrow?: string | null;
  careersHeading?: string | null;
  careersLead?: string | null;
  careersBody?: PortableTextBlock[] | string | null;
  careersImage?: SanityImage | null;
  careersPrimaryCta?: Cta | null;
  careersSecondaryCta?: Cta | null;

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
  longSummary: PortableTextBlock[] | string | null;
  description: PortableTextBlock[] | string | null;
  sections?: JobSection[] | null;
  applyEmail?: string | null;
  applyUrl?: string | null;
};

export type CareersPage = {
  pageSections?: PageSection[] | null;
  seoTitle: string;
  seoDescription: string;

  heroHeadlineLine1: string;
  heroHeadlineHighlight?: string | null;
  heroDescription: PortableTextBlock[] | string | null;
  heroImage: SanityImage;

  whyHeading: string;
  whyIntro: PortableTextBlock[] | string | null;
  whyImage: SanityImage;
  whySections: { heading: string; body: string }[];
  whyBulletsHeading: string;
  whyBullets: string[];

  applyHeading?: string | null;
  applyBody?: PortableTextBlock[] | string | null;

  jobsHeading: string;
  jobsDescription: PortableTextBlock[] | string | null;
  jobsSearchPlaceholder?: string | null;
  jobsFindButtonLabel?: string | null;
  jobsBg?: string | null;

  equalOpportunityParagraph1: PortableTextBlock[] | string | null;
  equalOpportunityParagraph2?: PortableTextBlock[] | string | null;
  equalOpportunityBg?: string | null;
};

export type InvestorCard = {
  title?: string | null;
  body?: PortableTextBlock[] | string | null;
  bg?: string | null;
  watermark?: boolean | null;
};

export type InvestorRole = {
  label?: string | null;
  description?: string | null;
};

export type InvestorNote = {
  body?: PortableTextBlock[] | string | null;
};

/** One tab in a `tabsBlock` — a tab title and a rich body panel. */
export type TabItem = {
  title?: string | null;
  body?: PortableTextBlock[] | null;
};

/** One card in a `carouselBlock` — image over a title and short body. */
export type CarouselItem = {
  title?: string | null;
  body?: PortableTextBlock[] | string | null;
  image?: SanityImage | null;
};

export type InvestorQuote = {
  quote?: PortableTextBlock[] | string | null;
  name?: string | null;
  title?: string | null;
  image?: SanityImage | null;
  bg?: string | null;
};

export type InvestorsPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;

  heroTitle?: string | null;
  heroTagline?: string | null;
  heroCta?: Cta;
  heroImage?: SanityImage | null;

  opportunityEyebrow?: string | null;
  opportunityHeading?: string | null;
  /** May contain `**bold**` runs. */
  opportunityBody?: PortableTextBlock[] | string | null;
  opportunityCardLead?: PortableTextBlock[] | string | null;
  opportunityStats?: Stat[] | null;
  opportunityCardBg?: string | null;

  whyHeading?: string | null;
  whyIntro?: PortableTextBlock[] | string | null;
  whyCards?: InvestorCard[] | null;
  whyClosing?: PortableTextBlock[] | string | null;
  whyImage?: SanityImage | null;

  howHeading?: string | null;
  howIntro?: PortableTextBlock[] | string | null;
  howRoles?: InvestorRole[] | null;
  howImage?: SanityImage | null;
  howBody?: PortableTextBlock[] | string | null;
  howBg?: string | null;

  sitesHeading?: string | null;
  sitesBody?: PortableTextBlock[] | string | null;
  /** Plain strings — proper names, not translated. */
  sitesList?: string[] | null;
  sitesNote?: PortableTextBlock[] | string | null;
  sitesImage?: SanityImage | null;

  incentivesImage?: SanityImage | null;
  incentivesHeading?: string | null;
  incentivesLead?: PortableTextBlock[] | string | null;
  incentivesItems?: InvestorNote[] | null;

  bridgeEyebrow?: string | null;
  bridgeTitle?: string | null;
  bridgeTitleTail?: string | null;
  bridgeBody?: PortableTextBlock[] | string | null;
  bridgeCta?: Cta;
  bridgeBg?: string | null;

  marketHeading?: string | null;
  marketLead?: PortableTextBlock[] | string | null;
  marketStats?: Stat[] | null;
  marketClosing?: PortableTextBlock[] | string | null;
  marketImage?: SanityImage | null;

  tractionEyebrow?: string | null;
  tractionHeading?: string | null;
  tractionItems?: InvestorRole[] | null;

  whyNowHeading?: string | null;
  whyNowBody?: PortableTextBlock[] | string | null;
  whyNowPrimaryCta?: Cta;
  whyNowSecondaryCta?: Cta;
  whyNowImage?: SanityImage | null;
  whyNowBg?: string | null;

  climateHeading?: string | null;
  climateCards?: InvestorCard[] | null;

  voicesEyebrow?: string | null;
  voicesHeading?: string | null;
  voicesHeadingTail?: string | null;
  voicesQuotes?: InvestorQuote[] | null;

  deeperHeading?: string | null;
  deeperBody?: PortableTextBlock[] | string | null;
  deeperImage?: SanityImage | null;
  timelineHeading?: string | null;
  timelineItems?: InvestorRole[] | null;
  deeperPrimaryCta?: Cta;
  deeperSecondaryCta?: Cta;

  blogHeading?: string | null;
  pageSections?: PageSection[] | null;
};

export type PrioritiesPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;

  heroBody?: PortableTextBlock[] | string | null;
  heroHeadlineLine1?: string | null;
  heroHeadlineLine2?: string | null;
  heroCta?: Cta | null;
  heroImage?: SanityImage | null;

  showStats?: boolean | null;
  statsIntro?: PortableTextBlock[] | string | null;
  statsHeading?: string | null;
  stats?: { value?: string | null; description?: string | null }[] | null;

  prioritiesHeading?: string | null;
  prioritiesIntro?: PortableTextBlock[] | string | null;
  priorities?: { label?: string | null }[] | null;
  prioritiesCta?: Cta | null;
  prioritiesImage?: SanityImage | null;

  latestHeading?: string | null;
  latestShowCount?: number | null;
  pageSections?: PageSection[] | null;
};

/** A strategic priority as shown in the /priorities numbered index. */
export type PrioritySummary = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  order?: number | null;
  heroImage?: SanityImage | null;
};

/** Full priority for the /priorities/[slug] detail page. */
export type PriorityHeroLayout =
  | "imageCard"
  | "split"
  | "textOnly"
  | "feature"
  | "cover"
  | "featureSplit";

export type PriorityDetail = PrioritySummary & {
  heroLayout?: PriorityHeroLayout | null;
  heroImage?: SanityImage | null;
  heroHeadlineLead?: string | null;
  heroHeadlineEmphasis?: string | null;
  heroHeadlineTrail?: string | null;
  pageColor?: string | null;
  sectionBgColor?: string | null;

  showOverview?: boolean | null;
  overviewHeading?: string | null;
  overviewBody?: PortableTextBlock[] | string | null;

  showPoints?: boolean | null;
  pointsHeading?: string | null;
  points?: { title?: string | null; body?: string | null }[] | null;

  showStats?: boolean | null;
  statsHeading?: string | null;
  stats?: { value?: string | null; description?: string | null }[] | null;

  showQuote?: boolean | null;
  quoteEyebrow?: string | null;
  quoteHeading?: string | null;
  quoteLead?: PortableTextBlock[] | string | null;
  quoteText?: PortableTextBlock[] | string | null;
  quoteAttribution?: string | null;
  quoteRole?: string | null;
  quotePortrait?: SanityImage | null;

  showPractice?: boolean | null;
  practiceEyebrow?: string | null;
  practiceStatementLead?: string | null;
  practiceStatementHighlight?: string | null;
  practiceStatementTrail?: string | null;
  practiceBody?: PortableTextBlock[] | string | null;
  practicePrimaryCta?: Cta;
  practiceSecondaryCta?: Cta;

  showPracticeDetail?: boolean | null;
  practiceDetailHeading?: string | null;
  practiceDetailBody?: PortableTextBlock[] | string | null;
  practiceDetailImage?: SanityImage | null;
  practiceDetailCta?: Cta;

  showPracticeTabs?: boolean | null;
  practiceTabsHeading?: string | null;
  practiceTabsLead?: PortableTextBlock[] | string | null;
  practiceTabsStatement?: string | null;
  practiceTabsTrail?: PortableTextBlock[] | string | null;
  practiceTabsItems?:
    | {
        label?: string | null;
        body?: string | null;
        bullets?: string | null;
      }[]
    | null;

  showMotion?: boolean | null;
  motionHeading?: string | null;
  motionTone?: "light" | "dark" | null;
  motionCta?: Cta;
  motionImage?: SanityImage | null;
  motionItems?: { title?: string | null; body?: string | null }[] | null;

  pageSections?: PageSection[] | null;
};

// ── Sectors ──────────────────────────────────────────────────────────────────
/** The /sectors landing page (singleton) that frames the sector cards. */
export type SectorsPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;

  heroHeading?: string | null;
  heroBody?: PortableTextBlock[] | string | null;
  heroCta?: Cta | null;
  heroImage?: SanityImage | null;

  sixHeading?: string | null;
  sixIntro?: PortableTextBlock[] | string | null;

  latestHeading?: string | null;
  pageSections?: PageSection[] | null;
};

/** A sector as shown in the /sectors listing stack. */
export type SectorSummary = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  order?: number | null;
  cardImage?: SanityImage | null;
};

/** Full sector for the /sectors/[slug] detail page. */
export type SectorDetail = SectorSummary & {
  headerLayout?:
    | "split"
    | "centered"
    | "sideBySide"
    | "overlay"
    | "showcase"
    | "spotlight"
    | "masthead"
    | null;
  heroImage?: SanityImage | null;
  pageColor?: string | null;
  heroHeadingColor?: string | null;
  sectionBgColor?: string | null;
  heroPrimaryCta?: Cta;
  heroSecondaryCta?: Cta;

  showOverview?: boolean | null;
  overviewHeading?: string | null;
  overviewBody?: PortableTextBlock[] | string | null;

  showCapabilities?: boolean | null;
  capabilitiesHeading?: string | null;
  capabilities?: { title?: string | null; body?: string | null }[] | null;

  showStats?: boolean | null;
  statsHeading?: string | null;
  stats?: { value?: string | null; description?: string | null }[] | null;

  showQuote?: boolean | null;
  quoteEyebrow?: string | null;
  quoteHeading?: string | null;
  quoteLead?: PortableTextBlock[] | string | null;
  quoteCta?: Cta;
  quoteText?: PortableTextBlock[] | string | null;
  quoteAttribution?: string | null;
  quoteRole?: string | null;
  quotePortrait?: SanityImage | null;

  showPractice?: boolean | null;
  practiceHeading?: string | null;
  practiceLead?: PortableTextBlock[] | string | null;
  practiceBody?: PortableTextBlock[] | string | null;
  practiceListHeading?: string | null;
  practiceList?: { term?: string | null; body?: string | null }[] | null;
  practiceCreatesLabel?: string | null;
  practiceCreatesStatement?: string | null;
  practicePrimaryCta?: Cta;
  practiceSecondaryCta?: Cta;
  practiceImage?: SanityImage | null;
  practiceCards?:
    | { title?: string | null; body?: string | null; tone?: string | null }[]
    | null;

  showOperational?: boolean | null;
  operationalHeading?: string | null;
  operationalListHeading?: string | null;
  operationalList?: { term?: string | null; body?: string | null }[] | null;
  operationalPrimaryCta?: Cta;
  operationalSecondaryCta?: Cta;
  operationalImage?: SanityImage | null;

  showBeingBuilt?: boolean | null;
  beingBuiltEyebrow?: string | null;
  beingBuiltItems?:
    | {
        heading?: string | null;
        subtitle?: string | null;
        body?: string | null;
      }[]
    | null;
  beingBuiltPrimaryCta?: Cta;
  beingBuiltSecondaryCta?: Cta;
  beingBuiltImage?: SanityImage | null;

  showHighlight?: boolean | null;
  highlightHeading?: string | null;
  highlightBody?: PortableTextBlock[] | string | null;
  highlightStatement?: string | null;
  highlightImage?: SanityImage | null;

  showMotion?: boolean | null;
  motionHeading?: string | null;
  motionTone?: "light" | "dark" | null;
  motionCta?: Cta;
  motionImage?: SanityImage | null;
  motionItems?: { title?: string | null; body?: string | null }[] | null;

  pageSections?: PageSection[] | null;
};

export type ContactPage = {
  pageSections?: PageSection[] | null;
  seoTitle: string;
  seoDescription: string;

  heroHeading: string;
  heroImage: SanityImage;
  contactRows: ContactRow[];

  formHeading: string;
  formDescription: PortableTextBlock[] | string | null;
  formSubmitLabel: string;
  formBg?: string | null;
  formImage: SanityImage;
};

export type PartnerCard = {
  title?: string | null;
  description?: string | null;
  tone?: string | null;
};

export type PartnerGroup = {
  eyebrow?: string | null;
  headingLead?: string | null;
  headingTrail?: string | null;
  layout?: "cards" | "list" | "panel" | "feature" | "split" | null;
  cards?: PartnerCard[] | null;
  cta?: Cta;
  secondaryCta?: Cta;
  image?: SanityImage | null;
};

export type PartnersPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;

  heroHeading?: string | null;
  heroBody?: PortableTextBlock[] | string | null;
  heroImage?: SanityImage | null;
  heroCta?: Cta;

  partnerGroups?: PartnerGroup[] | null;
};

export type ImpactPage = {
  seoTitle?: string | null;
  seoDescription?: string | null;

  heroHeading?: string | null;
  heroBody?: PortableTextBlock[] | string | null;
  heroImage?: SanityImage | null;
  heroCta?: Cta;

  whyEyebrow?: string | null;
  whyHeadingLead?: string | null;
  whyHeadingTrail?: string | null;
  whyBody?: PortableTextBlock[] | string | null;
  whyQuote?: PortableTextBlock[] | string | null;
  whyAttributionName?: string | null;
  whyAttributionDate?: string | null;
  whyPortrait?: SanityImage | null;

  facilityImage?: SanityImage | null;

  trajectoryBlocks?:
    | {
        heading?: string | null;
        body?: PortableTextBlock[] | string | null;
        highlight?: boolean | null;
      }[]
    | null;
};

export type AboutPage = {
  pageSections?: PageSection[] | null;
  seoTitle: string;
  seoDescription: string;

  heroImage: SanityImage;
  heroHeadline: string;
  heroSubheading: string;
  heroCta: Cta;

  visionHeading: string;
  visionDescription: PortableTextBlock[] | string | null;
  visionPrimaryCta: Cta;
  visionSecondaryCta: Cta;
  visionBg?: string | null;
  pillars: Pillar[];

  differenceEyebrow?: string | null;
  differenceHeading?: string | null;
  differenceBody?: string | null;
  differenceTagline?: string | null;

  missionHeading: string;
  missionDescription: PortableTextBlock[] | string | null;
  missionCards: MissionCard[];

  statsHeading: string;
  statsDescription: PortableTextBlock[] | string | null;
  stats: Stat[];

  bannerImage?: SanityImage | null;

  initiativesEyebrow: string;
  initiativesHeading: string;
  initiativesShowCount: number;

  leadershipHeading: string;
  leadershipDescription: PortableTextBlock[] | string | null;
  leadershipBg?: string | null;
  leaders: Leader[];
  leadershipContactHeading: string;
  leadershipContactDescription: PortableTextBlock[] | string | null;
  leadershipContactPrimaryCta: Cta;
  leadershipContactSecondaryCta: Cta;
};

// ── Investor / Partner portal ────────────────────────────────────────────────

export type PortalRole = "investor" | "partner";
export type PortalStatus = "pending" | "active" | "disabled";

/** Auth-critical projection — what the session/DAL needs to gate access. */
export type PortalUser = {
  _id: string;
  name?: string | null;
  email: string;
  organization?: string | null;
  roles: PortalRole[];
  status: PortalStatus;
};

/** A gated file/video/dataset stored in the PRIVATE R2 bucket. */
export type PortalFile = {
  key?: string | null;
  originalFilename?: string | null;
  contentType?: string | null;
  size?: number | null;
};

export type PortalResource = {
  _id: string;
  title: string;
  description?: PortableTextBlock[] | string | null;
  kind: "file" | "video" | "dataset";
  audiences: PortalRole[];
  file?: PortalFile | null;
};

/** Card-level projection for the dashboard listing. */
export type PortalPageSummary = {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  audiences: PortalRole[];
};

export type PortalPageDetail = PortalPageSummary & {
  body?: PortableTextBlock[] | null;
};
