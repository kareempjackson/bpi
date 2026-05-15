import { defineField, defineType } from "sanity";

export const newsletterSubscription = defineType({
  name: "newsletterSubscription",
  title: "Newsletter subscription",
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
      name: "subscribedAt",
      title: "Subscribed at",
      type: "datetime",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      readOnly: true,
      description: "Where on the site this subscription came from.",
      initialValue: "footer",
    }),
    defineField({
      name: "unsubscribed",
      title: "Unsubscribed",
      type: "boolean",
      description: "Toggle on if this subscriber has opted out.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Subscribed — newest first",
      name: "subscribedAtDesc",
      by: [{ field: "subscribedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      fullName: "fullName",
      email: "email",
      subscribedAt: "subscribedAt",
      unsubscribed: "unsubscribed",
    },
    prepare: ({ fullName, email, subscribedAt, unsubscribed }) => {
      let subtitle = "";
      if (subscribedAt) {
        const d = new Date(subscribedAt);
        if (!Number.isNaN(d.getTime())) subtitle = d.toLocaleString();
      }
      return {
        title: `${unsubscribed ? "[unsubscribed] " : ""}${fullName ?? "Subscriber"} <${email ?? ""}>`,
        subtitle,
      };
    },
  },
});
