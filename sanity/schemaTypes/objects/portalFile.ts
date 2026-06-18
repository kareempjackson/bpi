import { defineField, defineType } from "sanity";

import { R2PortalFileInput } from "../../components/R2PortalFileInput";

/**
 * A proprietary file stored in the PRIVATE R2 bucket. The custom input uploads
 * the file and fills these (read-only) fields with the object key + metadata.
 * No public URL is ever stored — portal users download via the auth-checked
 * `/api/portal/download` route, which mints a short-lived signed GET.
 */
export const portalFile = defineType({
  name: "portalFile",
  title: "File",
  type: "object",
  components: { input: R2PortalFileInput },
  fields: [
    defineField({ name: "key", title: "R2 object key", type: "string", readOnly: true }),
    defineField({
      name: "originalFilename",
      title: "Original filename",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "contentType", title: "Content type", type: "string", readOnly: true }),
    defineField({ name: "size", title: "Size (bytes)", type: "number", readOnly: true }),
  ],
});
