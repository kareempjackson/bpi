import { defineQuery } from "next-sanity";

const IMAGE_PROJECTION = `{
  kind,
  asset,
  "videoUrl": video.asset->url,
  videoFallbackSrc,
  fallbackSrc,
  alt
}`;

const CTA_PROJECTION = `{
  label,
  href
}`;

const MENU_MEDIA_PROJECTION = `{
  kind,
  image${IMAGE_PROJECTION},
  "videoUrl": video.asset->url,
  videoFallbackSrc
}`;

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    navLinks[]{
      label,
      href,
      disabled
    },
    menuLinks[]{
      label,
      href,
      media${MENU_MEDIA_PROJECTION},
      subItems[]{
        label,
        href,
        media${MENU_MEDIA_PROJECTION}
      }
    },
    menuLegalLinks[]{
      label,
      href,
      disabled
    },
    menuSocialLinks[]{
      kind,
      href,
      label
    },
    menuBackground${MENU_MEDIA_PROJECTION},
    showFooterPartners,
    footerPartners[]{
      name,
      "logoUrl": logo.asset->url,
      href
    }
  }
`);

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    seoTitle,
    seoDescription,

    heroHeadline,
    heroBody,
    heroCtaHref,
    heroBackground{
      kind,
      "videoUrl": video.asset->url,
      videoFallbackSrc,
      image${IMAGE_PROJECTION}
    },

    leaderQuote,
    leaderBody,
    leaderName,
    leaderTitle,
    leaderOrg,
    leaderQuoteImage${IMAGE_PROJECTION},
    leaderPortraitImage${IMAGE_PROJECTION},
    leaderSocials[]{
      kind,
      href,
      label
    },

    architectureHeading,
    architectureDescription,
    architectureItems[]{
      title,
      description,
      href,
      image${IMAGE_PROJECTION},
      color
    },

    sectorsHeading,
    sectorsBody,
    sectorsNodes[]{
      nodeId,
      num,
      title,
      description,
      media{
        kind,
        image${IMAGE_PROJECTION},
        "videoUrl": video.asset->url,
        videoFallbackSrc,
        videoPoster${IMAGE_PROJECTION}
      },
      href
    },

    whyQuote,
    whyAttribution,
    whyBody,
    whyCta${CTA_PROJECTION},
    whyImage${IMAGE_PROJECTION},

    initiativesEyebrow,
    initiativesHeading,
    initiativesViewAllHref,
    initiativesDefaultImage${IMAGE_PROJECTION},
    initiativesShowCount,

    blogHeading,
    blogShowCount,

    buildingHeadlineLine1,
    buildingHeadlineLine2,
    buildingImage${IMAGE_PROJECTION},
    buildingPrimaryCta${CTA_PROJECTION},
    buildingSecondaryCta${CTA_PROJECTION}
  }
`);

export const LATEST_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && showInInitiatives != true]
    | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const LATEST_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current)]
    | order(featured desc, coalesce(order, 9999) asc, publishedAt desc)[0...$limit]{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    publishedAt,
    featured,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const FEATURED_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current) && featured == true]
    | order(coalesce(order, 9999) asc, publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    publishedAt,
    featured,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const ALL_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current)]
    | order(featured desc, coalesce(order, 9999) asc, publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    publishedAt,
    featured,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const ALL_INITIATIVE_SLUGS_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const INITIATIVE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "initiative" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    publishedAt,
    featured,
    coverImage${IMAGE_PROJECTION},
    externalLink,
    body
  }
`);

export const RELATED_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current) && slug.current != $slug]
    | order(featured desc, coalesce(order, 9999) asc, publishedAt desc)[0...3]{
    _id,
    title,
    "slug": slug.current,
    subtitle,
    excerpt,
    publishedAt,
    featured,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const INITIATIVE_POSTS_QUERY = defineQuery(`
  *[_type == "post" && showInInitiatives == true && defined(slug.current)]
    | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    coverImage${IMAGE_PROJECTION},
    externalLink,
    initiativeEyebrow,
    initiativeTileSize,
    initiativeTileAccent
  }
`);

export const INITIATIVES_PAGE_QUERY = defineQuery(`
  *[_type == "initiativesPage"][0]{
    seoTitle,
    seoDescription,

    heroImage${IMAGE_PROJECTION},
    heroHeadline,
    heroBody,
    heroPrimaryCta${CTA_PROJECTION},
    heroSecondaryCta${CTA_PROJECTION},

    showWorkInMotion,
    workInMotionHeading,
    workInMotionBody,
    workInMotionBg,
    workInMotionPrimaryCta${CTA_PROJECTION},
    workInMotionSecondaryCta${CTA_PROJECTION},

    // The defined() filter drops dangling weak refs (e.g. when the target
    // initiative has been deleted). Without it, deleted refs show up as
    // null entries and need extra handling downstream.
    "featuredInitiative": featuredInitiative->{
      _id,
      title,
      "slug": slug.current,
      subtitle,
      excerpt,
      publishedAt,
      featured,
      coverImage${IMAGE_PROJECTION},
      externalLink
    },
    "featuredSupportingInitiatives": featuredSupportingInitiatives[
      defined(@->_id)
    ]->{
      _id,
      title,
      "slug": slug.current,
      subtitle,
      excerpt,
      publishedAt,
      featured,
      coverImage${IMAGE_PROJECTION},
      externalLink
    },

    showMotionStories,
    motionStoriesHeading,
    motionStoriesBg,
    motionStoriesViewAllHref,
    motionStoriesShowCount,

    showOtherWorks,
    otherWorksEyebrow,
    otherWorksHeading,
    otherWorksBody,
    otherWorksBlueTitle,
    otherWorksBlueBody,
    otherWorksBlueCta${CTA_PROJECTION},
    otherWorksBlueBg,
    otherWorksGreenTitle,
    otherWorksGreenBody,
    otherWorksGreenBg,
    otherWorksTopRightImages[]${IMAGE_PROJECTION},
    otherWorksBottomLeftImage${IMAGE_PROJECTION},

    buildingFutureHeading,
    buildingFutureBody,
    buildingFutureStats[]{
      value,
      body
    },
    buildingFutureStatBg
  }
`);

export const CONTACT_PAGE_QUERY = defineQuery(`
  *[_type == "contactPage"][0]{
    seoTitle,
    seoDescription,

    heroHeading,
    heroImage${IMAGE_PROJECTION},
    contactRows[]{
      label,
      value,
      copyValue
    },

    formHeading,
    formDescription,
    formSubmitLabel,
    formBg,
    formImage${IMAGE_PROJECTION}
  }
`);

export const CAREERS_PAGE_QUERY = defineQuery(`
  *[_type == "careersPage"][0]{
    seoTitle,
    seoDescription,

    heroHeadlineLine1,
    heroDescription,
    heroImage${IMAGE_PROJECTION},

    whyHeading,
    whyIntro,
    whyImage${IMAGE_PROJECTION},
    whySections[]{
      heading,
      body
    },
    whyBulletsHeading,
    whyBullets,

    jobsHeading,
    jobsDescription,
    jobsSearchPlaceholder,
    jobsFindButtonLabel,
    jobsBg,

    equalOpportunityParagraph1,
    equalOpportunityParagraph2,
    equalOpportunityBg
  }
`);

export const ALL_JOBS_QUERY = defineQuery(`
  *[_type == "job" && active != false && defined(slug.current)]
    | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    category,
    location,
    schedule,
    summary,
    publishedAt
  }
`);

export const JOB_BY_SLUG_QUERY = defineQuery(`
  *[_type == "job" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    category,
    location,
    schedule,
    summary,
    longSummary,
    description,
    sections[]{
      title,
      content
    },
    applyEmail,
    applyUrl
  }
`);

export const ALL_JOB_SLUGS_QUERY = defineQuery(`
  *[_type == "job" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage"][0]{
    seoTitle,
    seoDescription,

    heroImage${IMAGE_PROJECTION},
    heroHeadline,
    heroSubheading,
    heroCta${CTA_PROJECTION},

    visionHeading,
    visionDescription,
    visionPrimaryCta${CTA_PROJECTION},
    visionSecondaryCta${CTA_PROJECTION},
    visionBg,
    pillars[]{
      eyebrow,
      description,
      image${IMAGE_PROJECTION},
      bg,
      highlight
    },

    differenceLeftImage${IMAGE_PROJECTION},
    differenceRightImage${IMAGE_PROJECTION},
    differenceHeading,
    differenceBody,
    differencePrimaryCta${CTA_PROJECTION},
    differenceSecondaryCta${CTA_PROJECTION},
    differenceOuterBg,
    differenceInnerBg,

    missionHeading,
    missionDescription,
    missionCards[]{
      title,
      description,
      href,
      eyebrow,
      image${IMAGE_PROJECTION},
      bg
    },

    statsHeading,
    statsDescription,
    stats[]{
      value,
      description
    },

    bannerImage${IMAGE_PROJECTION},

    initiativesEyebrow,
    initiativesHeading,
    initiativesShowCount,

    leadershipHeading,
    leadershipDescription,
    leadershipBg,
    leaders[]{
      name,
      role,
      image${IMAGE_PROJECTION},
      bio,
      linkedin
    },
    leadershipContactHeading,
    leadershipContactDescription,
    leadershipContactPrimaryCta${CTA_PROJECTION},
    leadershipContactSecondaryCta${CTA_PROJECTION}
  }
`);
