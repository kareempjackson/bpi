import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Portal user — one record per investor/partner. Login is passwordless (magic
 * link), so there are NO password fields here; the email is the identity key.
 *
 * Created either by an admin (status "active") or by the public request form
 * (status "pending"). The DAL requires status "active" on every request, so
 * setting "disabled" here locks the person out immediately.
 */
export const portalUser = defineType({
  name: "portalUser",
  title: "Portal user",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "The address magic-link sign-in emails are sent to.",
      validation: (Rule) =>
        Rule.required()
          .email()
          .custom((val) =>
            val && val !== val.toLowerCase()
              ? "Use a lowercase email address."
              : true,
          ),
    }),
    defineField({ name: "organization", title: "Organization", type: "string" }),
    defineField({
      name: "roles",
      title: "Access tiers",
      type: "array",
      description:
        "Which content this person can see. Content is tagged the same way; they see an item if any tier matches.",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "grid",
        list: [
          { title: "Investor", value: "investor" },
          { title: "Partner", value: "partner" },
        ],
      },
      validation: (Rule) =>
        Rule.custom((roles, ctx) => {
          const status = (ctx.document as { status?: string } | undefined)
            ?.status;
          if (status === "active" && (!roles || roles.length === 0)) {
            return "Active users need at least one access tier.";
          }
          return true;
        }),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Pending (requested access)", value: "pending" },
          { title: "Active", value: "active" },
          { title: "Disabled", value: "disabled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "requestMessage",
      title: "Request message",
      type: "text",
      rows: 3,
      readOnly: true,
      description: "Anything the requester wrote on the access-request form.",
    }),
    defineField({
      name: "requestedAt",
      title: "Requested at",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "lastLoginAt",
      title: "Last login",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Recently requested",
      name: "requestedAtDesc",
      by: [{ field: "requestedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", email: "email", status: "status" },
    prepare: ({ title, email, status }) => ({
      title: title || email,
      subtitle: `${email} · ${status ?? "—"}`,
    }),
  },
});
