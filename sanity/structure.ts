import type { StructureResolver } from "sanity/structure";

const SINGLETON_IDS = new Set<string>([
  "siteSettings",
  "homePage",
  "aboutPage",
  "initiativesPage",
  "contactPage",
  "careersPage",
  "prioritiesPage",
  "sectorsPage",
  "blogPage",
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
      S.listItem()
        .title("Priorities page")
        .id("prioritiesPage")
        .child(
          S.document()
            .schemaType("prioritiesPage")
            .documentId("prioritiesPage"),
        ),
      S.listItem()
        .title("Sectors page")
        .id("sectorsPage")
        .child(
          S.document().schemaType("sectorsPage").documentId("sectorsPage"),
        ),
      S.listItem()
        .title("Blog page")
        .id("blogPage")
        .child(S.document().schemaType("blogPage").documentId("blogPage")),
      S.divider(),
      S.documentTypeListItem("initiative").title("Initiatives"),
      S.documentTypeListItem("priority").title("Strategic priorities"),
      S.documentTypeListItem("sector").title("Sectors"),
      S.documentTypeListItem("event").title("Events"),
      S.documentTypeListItem("job").title("Jobs"),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("tag").title("Tags"),
      S.divider(),
      // ── Investor / Partner portal ──────────────────────────────────────
      S.listItem()
        .title("Portal — Access requests")
        .id("portalRequests")
        .child(
          S.documentList()
            .title("Access requests (pending)")
            .filter('_type == "portalUser" && status == "pending"')
            .defaultOrdering([{ field: "requestedAt", direction: "desc" }]),
        ),
      S.listItem()
        .title("Portal — Users")
        .id("portalUsers")
        .child(
          S.documentList()
            .title("Portal users")
            .filter('_type == "portalUser" && status != "pending"')
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
      S.documentTypeListItem("portalPage").title("Portal — Pages"),
      S.documentTypeListItem("portalResource").title("Portal — Resources"),
      S.divider(),
      S.documentTypeListItem("contactSubmission").title("Contact submissions"),
      S.documentTypeListItem("newsletterSubscription").title(
        "Newsletter subscriptions",
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return (
          !SINGLETON_IDS.has(id) &&
          id !== "post" &&
          id !== "tag" &&
          id !== "initiative" &&
          id !== "priority" &&
          id !== "sector" &&
          id !== "event" &&
          id !== "job" &&
          id !== "contactSubmission" &&
          id !== "newsletterSubscription" &&
          id !== "portalUser" &&
          id !== "portalPage" &&
          id !== "portalResource"
        );
      }),
    ]);
