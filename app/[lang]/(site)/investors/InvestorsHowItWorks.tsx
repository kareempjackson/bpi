import MediaImage from "@/app/components/MediaImage";
import PortableTextBody from "@/app/components/PortableTextBody";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import type {
  InvestorRole,
  PortableTextBlock,
  ResolvedMedia,
} from "@/sanity/lib/types";
import InvestorsRolesTable from "./InvestorsRolesTable";

/**
 * "How BPI Works" — a dark band carrying a divided table of BPI's four roles,
 * with a portrait laid over the table's right-hand end, and a closing
 * paragraph beneath.
 *
 * The portrait is absolutely positioned from `lg` up so the rules run behind
 * it; below `lg` it drops out of the flow's way and stacks under the table.
 */
export default function InvestorsHowItWorks({
  heading,
  intro,
  roles,
  media,
  body,
  bg,
}: {
  heading?: string | null;
  intro?: PortableTextBlock[] | string | null;
  roles?: InvestorRole[] | null;
  media: ResolvedMedia | null;
  body?: PortableTextBlock[] | string | null;
  bg?: string | null;
}) {
  return (
    <section
      data-nav-theme="dark"
      className="px-6 md:px-10 lg:px-14 py-14 md:py-20 lg:py-24"
      style={{ backgroundColor: bg || "#13362A" }}
    >
      <div className="mx-auto w-full max-w-page">
        <Stagger className="flex flex-col gap-3">
          {heading ? (
            <StaggerItem
              as="h2"
              className="font-display text-2xl md:text-3xl font-bold text-white leading-tight tracking-[-0.02em]"
            >
              {heading}
            </StaggerItem>
          ) : null}
          {intro ? (
            <StaggerItem className="max-w-2xl">
              <PortableTextBody
                value={intro}
                paragraphClassName="font-display text-[16px] font-normal leading-[28px] tracking-normal text-white/70"
              />
            </StaggerItem>
          ) : null}
        </Stagger>

        {roles?.length || media ? (
          <div className="relative mt-8 md:mt-10">
            {roles?.length ? <InvestorsRolesTable roles={roles} /> : null}

            {media ? (
              <Reveal
                preset="scale"
                className="relative mt-8 aspect-3/4 w-40 overflow-hidden rounded-xl bg-white/5 sm:w-48 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-52 xl:w-60"
              >
                <MediaImage
                  media={media}
                  sizes="(min-width: 1024px) 15rem, 12rem"
                />
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {body ? (
          <Reveal className="mt-10 md:mt-12 max-w-3xl">
            <PortableTextBody
              value={body}
              paragraphClassName="font-display text-[16px] font-normal leading-[28px] tracking-normal text-white/60"
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
