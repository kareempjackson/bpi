import type { StructureResolver } from "sanity/structure";

const SINGLETON_IDS = new Set<string>([
  "siteSettings",
  "homePage",
  "aboutPage",
  "initiativesPage",
  "contactPage",
  "careersPage",
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Home page")
        .id("homePage")
        .child(
          S.document().schemaType("homePage").documentId("homePage"),
        ),
      S.listItem()
        .title("About page")
        .id("aboutPage")
        .child(
          S.document().schemaType("aboutPage").documentId("aboutPage"),
        ),
      S.listItem()
        .title("Initiatives page")
        .id("initiativesPage")
        .child(
          S.document()
            .schemaType("initiativesPage")
            .documentId("initiativesPage"),
        ),
      S.listItem()
        .title("Contact page")
        .id("contactPage")
        .child(
          S.document().schemaType("contactPage").documentId("contactPage"),
        ),
      S.listItem()
        .title("Careers page")
        .id("careersPage")
        .child(
          S.document().schemaType("careersPage").documentId("careersPage"),
        ),
      S.divider(),
      S.documentTypeListItem("initiative").title("Initiatives"),
      S.documentTypeListItem("job").title("Jobs"),
      S.documentTypeListItem("post").title("Posts"),
      S.divider(),
      S.documentTypeListItem("contactSubmission").title("Contact submissions"),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return (
          !SINGLETON_IDS.has(id) &&
          id !== "post" &&
          id !== "initiative" &&
          id !== "job" &&
          id !== "contactSubmission"
        );
      }),
    ]);
