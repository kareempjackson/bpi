import type { SchemaTypeDefinition } from "sanity";

import { aboutPage } from "./documents/aboutPage";
import { careersPage } from "./documents/careersPage";
import { contactPage } from "./documents/contactPage";
import { contactSubmission } from "./documents/contactSubmission";
import { homePage } from "./documents/homePage";
import { initiative } from "./documents/initiative";
import { initiativesPage } from "./documents/initiativesPage";
import { job } from "./documents/job";
import { newsletterSubscription } from "./documents/newsletterSubscription";
import { post } from "./documents/post";
import { siteSettings } from "./documents/siteSettings";
import { contactRow } from "./objects/contactRow";
import { cta } from "./objects/cta";
import { hexColor } from "./objects/hexColor";
import { imageWithAlt } from "./objects/imageWithAlt";
import { jobSection } from "./objects/jobSection";
import { leader } from "./objects/leader";
import { menuLink } from "./objects/menuLink";
import { menuMedia } from "./objects/menuMedia";
import { menuSubLink } from "./objects/menuSubLink";
import { missionCard } from "./objects/missionCard";
import { navLink } from "./objects/navLink";
import { pillar } from "./objects/pillar";
import { priorityCard } from "./objects/priorityCard";
import { sectorNode } from "./objects/sectorNode";
import { socialLink } from "./objects/socialLink";
import { stat } from "./objects/stat";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects (reusable)
  cta,
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
  jobSection,
  // Documents
  siteSettings,
  homePage,
  aboutPage,
  initiativesPage,
  contactPage,
  careersPage,
  initiative,
  post,
  job,
  contactSubmission,
  newsletterSubscription,
];
