import type { SchemaTypeDefinition } from "sanity";

import { aboutPage } from "./documents/aboutPage";
import { blogPage } from "./documents/blogPage";
import { brandSettings } from "./documents/brandSettings";
import { careersPage } from "./documents/careersPage";
import { contactPage } from "./documents/contactPage";
import { contactSubmission } from "./documents/contactSubmission";
import { event } from "./documents/event";
import { engagement } from "./documents/engagement";
import { eventsPage } from "./documents/eventsPage";
import { homePage } from "./documents/homePage";
import { impactPage } from "./documents/impactPage";
import { initiative } from "./documents/initiative";
import { initiativesPage } from "./documents/initiativesPage";
import { investorsPage } from "./documents/investorsPage";
import { job } from "./documents/job";
import { newsletterSubscription } from "./documents/newsletterSubscription";
import { partnersPage } from "./documents/partnersPage";
import { portalPage } from "./documents/portalPage";
import { portalResource } from "./documents/portalResource";
import { portalUser } from "./documents/portalUser";
import { post } from "./documents/post";
import { priority } from "./documents/priority";
import { prioritiesPage } from "./documents/prioritiesPage";
import { sector } from "./documents/sector";
import { sectorsPage } from "./documents/sectorsPage";
import { sharedSection } from "./documents/sharedSection";
import { siteSettings } from "./documents/siteSettings";
import { tag } from "./documents/tag";
import { careersSection } from "./objects/careersSection";
import { contactRow } from "./objects/contactRow";
import { cta } from "./objects/cta";
import { ctaSection } from "./objects/ctaSection";
import { hexColor } from "./objects/hexColor";
import { imageWithAlt } from "./objects/imageWithAlt";
import { investorCard } from "./objects/investorCard";
import { investorNote } from "./objects/investorNote";
import { investorQuote } from "./objects/investorQuote";
import { investorRole } from "./objects/investorRole";
import { tabItem } from "./objects/tabItem";
import { carouselItem } from "./objects/carouselItem";
import { jobSection } from "./objects/jobSection";
import { leader } from "./objects/leader";
import { menuLink } from "./objects/menuLink";
import { menuMedia } from "./objects/menuMedia";
import { menuSubLink } from "./objects/menuSubLink";
import { missionCard } from "./objects/missionCard";
import { navLink } from "./objects/navLink";
import { metricsTable } from "./objects/metricsTable";
import { pageLink } from "./objects/pageLink";
import { pillar } from "./objects/pillar";
import { portalFile } from "./objects/portalFile";
import { priorityCard } from "./objects/priorityCard";
import { sectorNode } from "./objects/sectorNode";
import { socialLink } from "./objects/socialLink";
import { stat } from "./objects/stat";
import { statCard } from "./objects/statCard";
import { typeStyle } from "./objects/typeStyle";
import { headerBlock } from "./objects/blocks/headerBlock";
import { richTextBlock } from "./objects/blocks/richTextBlock";
import { statementSplitBlock } from "./objects/blocks/statementSplitBlock";
import { statsBlock } from "./objects/blocks/statsBlock";
import { cardGridBlock } from "./objects/blocks/cardGridBlock";
import { listBlock } from "./objects/blocks/listBlock";
import { contactRowsBlock } from "./objects/blocks/contactRowsBlock";
import { teamBlock } from "./objects/blocks/teamBlock";
import { quoteBlock } from "./objects/blocks/quoteBlock";
import { mediaBlock } from "./objects/blocks/mediaBlock";
import { timelineBlock } from "./objects/blocks/timelineBlock";
import { tabsBlock } from "./objects/blocks/tabsBlock";
import { carouselBlock } from "./objects/blocks/carouselBlock";
import { sectionReference } from "./objects/blocks/sectionReference";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects (reusable)
  cta,
  ctaSection,
  careersSection,
  hexColor,
  imageWithAlt,
  navLink,
  socialLink,
  pillar,
  missionCard,
  stat,
  leader,
  contactRow,
  priorityCard,
  sectorNode,
  menuMedia,
  menuSubLink,
  menuLink,
  pageLink,
  jobSection,
  portalFile,
  statCard,
  metricsTable,
  investorCard,
  investorRole,
  investorNote,
  investorQuote,
  tabItem,
  carouselItem,
  typeStyle,
  // Page-builder blocks
  headerBlock,
  richTextBlock,
  statementSplitBlock,
  statsBlock,
  cardGridBlock,
  listBlock,
  contactRowsBlock,
  teamBlock,
  quoteBlock,
  mediaBlock,
  timelineBlock,
  tabsBlock,
  carouselBlock,
  sectionReference,
  // Documents
  brandSettings,
  siteSettings,
  homePage,
  aboutPage,
  impactPage,
  initiativesPage,
  contactPage,
  careersPage,
  prioritiesPage,
  sectorsPage,
  blogPage,
  investorsPage,
  partnersPage,
  eventsPage,
  sharedSection,
  initiative,
  priority,
  sector,
  post,
  tag,
  job,
  event,
  engagement,
  contactSubmission,
  newsletterSubscription,
  portalUser,
  portalPage,
  portalResource,
];
