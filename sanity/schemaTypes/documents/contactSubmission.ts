import { defineField, defineType } from "sanity";

export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact submission",
  type: "document",
  fields: [
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "businessName",
      title: "Business name",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "read",
      title: "Read",
      type: "boolean",
      description: "Toggle on once this submission has been actioned.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Submitted — newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      fullName: "fullName",
      email: "email",
      businessName: "businessName",
      submittedAt: "submittedAt",
      read: "read",
    },
    prepare: ({ fullName, email, businessName, submittedAt, read }) => {
      const subtitleParts: string[] = [];
      if (businessName) subtitleParts.push(businessName);
      if (submittedAt) {
        const d = new Date(submittedAt);
        if (!Number.isNaN(d.getTime())) {
          subtitleParts.push(d.toLocaleString());
        }
      }
      return {
        title: `${read ? "" : "• "}${fullName ?? "Submission"} <${email ?? ""}>`,
        subtitle: subtitleParts.join(" · "),
      };
    },
  },
});
