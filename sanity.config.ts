import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { defineLocations, presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { forceDeleteAction } from "./sanity/lib/forceDeleteAction";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

// Document types where editors should have access to a "Force delete"
// action that bypasses Sanity's incoming-reference check. Useful for
// content types referenced by curated slots (e.g. initiatives selected
// in the Initiatives page).
const FORCE_DELETABLE_TYPES = new Set<string>(["initiative"]);

const SINGLETON_TYPES = new Set<string>([
  "siteSettings",
  "homePage",
  "aboutPage",
  "initiativesPage",
  "contactPage",
  "careersPage",
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
  plugins: [
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: {
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
              locations: [{ title: doc?.title ?? "Home", href: "/" }],
            }),
          }),
          aboutPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title ?? "About page", href: "/about" },
              ],
            }),
          }),
          initiativesPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title ?? "Initiatives page",
                  href: "/initiatives",
                },
              ],
            }),
          }),
          contactPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title ?? "Contact page", href: "/contact" },
              ],
            }),
          }),
          careersPage: defineLocations({
            select: { title: "seoTitle" },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title ?? "Careers page", href: "/careers" },
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
                        title: doc?.title ?? "Job",
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
                  title: doc?.title ?? "Post",
                  href: doc?.slug ? `/blog/${doc.slug}` : "/",
                },
                { title: "Home", href: "/" },
              ],
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
                        title: doc?.title ?? "Initiative",
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
      return prev;
    },
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(({ templateId }) => !SINGLETON_TYPES.has(templateId))
        : prev,
  },
});
