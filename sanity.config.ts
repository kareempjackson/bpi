import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";

import { ThLargeIcon } from "@sanity/icons";

import { locales, LOCALE_LABELS } from "./app/lib/locale";
import { DesignLibraryTool } from "./sanity/components/DesignLibraryTool";
import { portableText } from "./sanity/schemaTypes/objects/portableText";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { approvePortalUserAction } from "./sanity/lib/approvePortalUserAction";
import { forceDeleteAction } from "./sanity/lib/forceDeleteAction";
import { schemaTypes } from "./sanity/schemaTypes";
import { i18nValue } from "./sanity/schemaTypes/previewI18n";
import { structure } from "./sanity/structure";

// Document types where editors should have access to a "Force delete"
// action that bypasses Sanity's incoming-reference check. Useful for
// content types referenced by curated slots (e.g. initiatives selected
// in the Initiatives page).
const FORCE_DELETABLE_TYPES = new Set<string>(["initiative"]);

const SINGLETON_TYPES = new Set<string>([
  "brandSettings",
  "siteSettings",
  "homePage",
  "aboutPage",
  "initiativesPage",
  "contactPage",
  "careersPage",
  "prioritiesPage",
  "sectorsPage",
  "blogPage",
  "investorsPage",
]);
const DISABLED_SINGLETON_ACTIONS = new Set<string>([
  "unpublish",
  "delete",
  "duplicate",
]);

export default defineConfig({
  name: "default",
  title: "BPI",
  basePath: "/studio",
  projectId,
  dataset,
  // Force token-based login so the editor's session token is minted and kept
  // in localStorage. The R2 uploaders need that token to authenticate against
  // our presign routes (they verify it server-side, where the Sanity session
  // cookie isn't available). The default "dual" mode can leave the browser
  // with a cookie-only session and no token, which breaks those uploads.
  auth: {
    loginMethod: "token",
  },
  plugins: [
    // Field-level i18n. Every translatable field uses one of the generated
    // `internationalizedArray*` types; each stores all locales inline as
    // `[{ language, value }]`. The frontend coalesces to the active locale
    // (falling back to `en`) in GROQ. `languageFilter` lets editors collapse
    // the form to the languages they're actively writing.
    internationalizedArray({
      languages: locales.map((id) => ({ id, title: LOCALE_LABELS[id] })),
      defaultLanguages: ["en"],
      fieldTypes: ["string", "text", portableText],
      buttonLocations: ["field"],
      languageDisplay: "titleAndCode",
    }),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: {
        // URL → document(s) that render it. Populates the "Documents on this
        // page" panel and lets editors open the right doc from any preview URL.
        // `:lang` matches the locale segment (/en, /es, …).
        mainDocuments: defineDocuments([
          { route: "/:lang", filter: `_type == "homePage"` },
          { route: "/:lang/about", filter: `_type == "aboutPage"` },
          { route: "/:lang/impact", filter: `_type == "impactPage"` },
          { route: "/:lang/contact", filter: `_type == "contactPage"` },
          { route: "/:lang/careers", filter: `_type == "careersPage"` },
          {
            route: "/:lang/careers/:slug",
            filter: `_type == "job" && slug.current == $slug`,
          },
          { route: "/:lang/initiatives", filter: `_type == "initiativesPage"` },
          {
            route: "/:lang/initiatives/:slug",
            filter: `_type == "initiative" && slug.current == $slug`,
          },
          { route: "/:lang/priorities", filter: `_type == "prioritiesPage"` },
          {
            route: "/:lang/priorities/:slug",
            filter: `_type == "priority" && slug.current == $slug`,
          },
          { route: "/:lang/sectors", filter: `_type == "sectorsPage"` },
          {
            route: "/:lang/sectors/:slug",
            filter: `_type == "sector" && slug.current == $slug`,
          },
          { route: "/:lang/investors", filter: `_type == "investorsPage"` },
          { route: "/:lang/partners", filter: `_type == "partnersPage"` },
          { route: "/:lang/blog", filter: `_type == "blogPage"` },
          {
            route: "/:lang/blog/:slug",
            filter: `_type == "post" && slug.current == $slug`,
          },
        ]),
        locations: {
          siteSettings: defineLocations({
            // Settings has no page of its own; preview lands on the
            // home page so editors see the nav update live.
            select: {},
            resolve: () => ({
              locations: [
                { title: "Home (where nav renders)", href: "/" },
              ],
            }),
          }),
          homePage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [{ title: i18nValue(doc?.title) ?? "Home", href: "/" }],
            }),
          }),
          aboutPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: i18nValue(doc?.title) ?? "About page", href: "/about" },
              ],
            }),
          }),
          initiativesPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                {
                  title: i18nValue(doc?.title) ?? "Initiatives page",
                  href: "/initiatives",
                },
              ],
            }),
          }),
          contactPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: i18nValue(doc?.title) ?? "Contact page", href: "/contact" },
              ],
            }),
          }),
          careersPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: i18nValue(doc?.title) ?? "Careers page", href: "/careers" },
              ],
            }),
          }),
          investorsPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: i18nValue(doc?.title) ?? "Investors page", href: "/investors" },
              ],
            }),
          }),
          job: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                { title: "Careers", href: "/careers" },
                ...(doc?.slug
                  ? [
                      {
                        title: i18nValue(doc?.title) ?? "Job",
                        href: `/careers/${doc.slug}`,
                      },
                    ]
                  : []),
              ],
            }),
          }),
          post: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: i18nValue(doc?.title) ?? "Post",
                  href: doc?.slug ? `/blog/${doc.slug}` : "/blog",
                },
                { title: "Blog", href: "/blog" },
              ],
            }),
          }),
          blogPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: () => ({
              locations: [{ title: "Blog", href: "/blog" }],
            }),
          }),
          initiative: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                { title: "Home", href: "/" },
                { title: "About", href: "/about" },
                ...(doc?.slug
                  ? [
                      {
                        title: i18nValue(doc?.title) ?? "Initiative",
                        href: `/initiatives/${doc.slug}`,
                      },
                    ]
                  : []),
              ],
            }),
          }),
        },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  // "Design library" tab — a browsable gallery of every brand foundation and
  // section block (reads sanity/lib/blockCatalog.ts + brandTokens.ts).
  tools: (prev) => [
    ...prev,
    {
      name: "design-library",
      title: "Design library",
      icon: ThLargeIcon,
      component: DesignLibraryTool,
    },
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter(
          ({ action }) => !action || !DISABLED_SINGLETON_ACTIONS.has(action),
        );
      }
      if (FORCE_DELETABLE_TYPES.has(schemaType)) {
        // Append the force-delete action so editors can remove a doc
        // even when other documents still hold references to it.
        return [...prev, forceDeleteAction];
      }
      if (schemaType === "portalUser") {
        // One-click approve: set the user active and email a sign-in link.
        return [...prev, approvePortalUserAction];
      }
      return prev;
    },
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(({ templateId }) => !SINGLETON_TYPES.has(templateId))
        : prev,
  },
});
