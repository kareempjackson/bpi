import { defineQuery } from "next-sanity";

// Field-level i18n helper. Translatable fields are stored by the
// internationalizedArray* plugin types as arrays of { _key, language, value }.
// `loc(field)` collapses one back to a plain value for the active language
// ($lang, guaranteed by the fetch layer), falling back to English. The output
// key + shape are unchanged, so the frontend + TS types stay the same.
const loc = (field: string) =>
  `coalesce(${field}[language == $lang][0].value, ${field}[language == "en"][0].value)`;

const IMAGE_PROJECTION = `{
  kind,
  asset,
  "videoUrl": coalesce(externalVideoUrl, video.asset->url),
  "audioUrl": coalesce(externalAudioUrl, audio.asset->url),
  "alt": ${loc("alt")}
}`;

const TAGS_PROJECTION = `tags[]->{ "title": ${loc("title")}, "slug": slug.current, color }`;

const BLOG_CARD_PROJECTION = `{
  _id,
  "title": ${loc("title")},
  "slug": slug.current,
  "excerpt": ${loc("excerpt")},
  publishedAt,
  contentType,
  wideTile,
  ${TAGS_PROJECTION},
  coverImage${IMAGE_PROJECTION},
  externalLink
}`;

const CTA_PROJECTION = `{
  "label": ${loc("label")},
  href
}`;

const MENU_MEDIA_PROJECTION = `{
  kind,
  image${IMAGE_PROJECTION},
  "videoUrl": coalesce(externalVideoUrl, video.asset->url)
}`;

// Modular page blocks (Call to action / Careers) added to a page's
// `pageSections` list. One projection serves both block types — fields a given
// block doesn't have simply resolve to null.
const PAGE_SECTIONS_PROJECTION = `pageSections[]{
  _type,
  _key,
  enabled,
  "eyebrow": ${loc("eyebrow")},
  "heading": ${loc("heading")},
  "lead": ${loc("lead")},
  "body": ${loc("body")},
  primaryCta${CTA_PROJECTION},
  secondaryCta${CTA_PROJECTION},
  media${IMAGE_PROJECTION},
  tone
}`;

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    navLinks[]{
      "label": ${loc("label")},
      href,
      disabled
    },
    menuLinks[]{
      "label": ${loc("label")},
      href,
      disableLink,
      media${MENU_MEDIA_PROJECTION},
      subItems[]{
        "label": ${loc("label")},
        media${MENU_MEDIA_PROJECTION},
        "href": select(
          linkType == "initiative" => coalesce(reference->externalLink, "/initiatives/" + reference->slug.current),
          linkType == "post" => coalesce(reference->externalLink, "/blog/" + reference->slug.current),
          linkType == "job" => "/careers/" + reference->slug.current,
          href
        )
      }
    },
    menuLegalLinks[]{
      "label": ${loc("label")},
      href,
      disabled
    },
    menuSocialLinks[]{
      kind,
      href,
      "label": ${loc("label")}
    },
    menuBackground${MENU_MEDIA_PROJECTION},
    "footerTagline": ${loc("footerTagline")},
    footerNavGroups[]{
      "title": ${loc("title")},
      links[]{
        "label": ${loc("label")},
        href
      }
    },
    footerLegalLinks[]{
      "label": ${loc("label")},
      href,
      disabled
    },
    "footerRights": ${loc("footerRights")}
  }
`);

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroHeadline": ${loc("heroHeadline")},
    "heroBody": ${loc("heroBody")},
    heroCtaHref,
    heroBackground{
      kind,
      "videoUrl": coalesce(externalVideoUrl, video.asset->url),
      image${IMAGE_PROJECTION},
      reference->{
        _type,
        "cover": coverImage${IMAGE_PROJECTION}
      }
    },
    heroSlides[]{
      "headline": ${loc("headline")},
      "body": ${loc("body")},
      // Resolve the slide's CTA link (page / content item / custom URL) to
      // one href, falling back to any legacy string ctaHref.
      "ctaHref": coalesce(
        select(
          ctaLink.linkType == "content" => select(
            ctaLink.reference->_type == "initiative" => coalesce(ctaLink.reference->externalLink, "/initiatives/" + ctaLink.reference->slug.current),
            ctaLink.reference->_type == "post" => coalesce(ctaLink.reference->externalLink, "/blog/" + ctaLink.reference->slug.current),
            ctaLink.reference->_type == "job" => "/careers/" + ctaLink.reference->slug.current,
          ),
          ctaLink.linkType == "page" => ctaLink.page,
          ctaLink.href
        ),
        ctaHref
      ),
      background{
        kind,
        "videoUrl": coalesce(externalVideoUrl, video.asset->url),
        image${IMAGE_PROJECTION},
        reference->{
          _type,
          "cover": coverImage${IMAGE_PROJECTION}
        }
      },
      thumbnail${IMAGE_PROJECTION}
    },
    heroFeature{
      "label": ${loc("label")},
      "eyebrow": ${loc("eyebrow")},
      "videoUrl": coalesce(externalVideoUrl, video.asset->url),
      poster${IMAGE_PROJECTION},
      // Resolve the picked page / content item / custom URL to one href.
      // Falls back to any legacy string href stored before the link picker.
      "href": coalesce(
        select(
          link.linkType == "content" => select(
            link.reference->_type == "initiative" => coalesce(link.reference->externalLink, "/initiatives/" + link.reference->slug.current),
            link.reference->_type == "post" => coalesce(link.reference->externalLink, "/blog/" + link.reference->slug.current),
            link.reference->_type == "job" => "/careers/" + link.reference->slug.current,
          ),
          link.linkType == "page" => link.page,
          link.href
        ),
        href
      )
    },

    "leaderQuote": ${loc("leaderQuote")},
    "leaderBody": ${loc("leaderBody")},
    "leaderName": ${loc("leaderName")},
    "leaderTitle": ${loc("leaderTitle")},
    "leaderOrg": ${loc("leaderOrg")},
    leaderQuoteImage${IMAGE_PROJECTION},
    leaderPortraitImage${IMAGE_PROJECTION},
    leaderSocials[]{
      kind,
      href,
      "label": ${loc("label")}
    },

    "architectureHeading": ${loc("architectureHeading")},
    "architectureDescription": ${loc("architectureDescription")},
    architectureItems[]{
      "title": ${loc("title")},
      "description": ${loc("description")},
      href,
      image${IMAGE_PROJECTION},
      color
    },
    architectureFeature${IMAGE_PROJECTION},

    "sectorsHeading": ${loc("sectorsHeading")},
    "sectorsBody": ${loc("sectorsBody")},
    sectorsNodes[]{
      nodeId,
      num,
      "title": ${loc("title")},
      "description": ${loc("description")},
      media{
        kind,
        image${IMAGE_PROJECTION},
        "videoUrl": coalesce(externalVideoUrl, video.asset->url),
        videoPoster${IMAGE_PROJECTION}
      },
      href
    },

    "whyQuote": ${loc("whyQuote")},
    "whyAttribution": ${loc("whyAttribution")},
    "whyBody": ${loc("whyBody")},
    whyCta${CTA_PROJECTION},
    whyImage${IMAGE_PROJECTION},

    "initiativesEyebrow": ${loc("initiativesEyebrow")},
    "initiativesHeading": ${loc("initiativesHeading")},
    initiativesViewAllHref,
    initiativesDefaultImage${IMAGE_PROJECTION},
    initiativesShowCount,

    "blogHeading": ${loc("blogHeading")},
    blogShowCount,

    "careersEyebrow": ${loc("careersEyebrow")},
    "careersHeading": ${loc("careersHeading")},
    "careersLead": ${loc("careersLead")},
    "careersBody": ${loc("careersBody")},
    careersImage${IMAGE_PROJECTION},
    careersPrimaryCta${CTA_PROJECTION},
    careersSecondaryCta${CTA_PROJECTION},

    "buildingHeadlineLine1": ${loc("buildingHeadlineLine1")},
    "buildingHeadlineLine2": ${loc("buildingHeadlineLine2")},
    buildingImage${IMAGE_PROJECTION},
    buildingPrimaryCta${CTA_PROJECTION},
    buildingSecondaryCta${CTA_PROJECTION},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const LATEST_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && showInInitiatives != true]
    | order(publishedAt desc)[0...$limit]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "excerpt": ${loc("excerpt")},
    publishedAt,
    contentType,
    ${TAGS_PROJECTION},
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

// ── Blog ────────────────────────────────────────────────────────────────────
// Every post, newest first — drives the /blog index grid + filters.
export const ALL_BLOG_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(publishedAt desc)${BLOG_CARD_PROJECTION}
`);

export const ALL_TAGS_QUERY = defineQuery(`
  *[_type == "tag"] | order(title asc){
    "title": ${loc("title")},
    "slug": slug.current,
    color
  }
`);

export const BLOG_PAGE_QUERY = defineQuery(`
  *[_type == "blogPage"][0]{
    "heading": ${loc("heading")},
    "intro": ${loc("intro")},
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},
    "featuredPost": featuredPost->${BLOG_CARD_PROJECTION},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

// On-site pages are generated for posts that don't link out (an externalLink,
// typically News, opens the source directly — no detail page needed).
export const ALL_POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && !defined(externalLink)]{
    "slug": slug.current
  }
`);

export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "excerpt": ${loc("excerpt")},
    publishedAt,
    contentType,
    wideTile,
    ${TAGS_PROJECTION},
    coverImage${IMAGE_PROJECTION},
    externalLink,
    "body": ${loc("body")},
    "attachments": attachments[]{
      "label": ${loc("label")},
      "url": file.asset->url,
      "filename": file.asset->originalFilename,
      "size": file.asset->size
    }
  }
`);

export const LATEST_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current)]
    | order(featured desc, coalesce(order, 9999) asc, publishedAt desc)[0...$limit]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    "excerpt": ${loc("excerpt")},
    publishedAt,
    featured,
    hasDetailPage,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const FEATURED_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current) && featured == true]
    | order(coalesce(order, 9999) asc, publishedAt desc){
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    "excerpt": ${loc("excerpt")},
    publishedAt,
    featured,
    hasDetailPage,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

export const ALL_INITIATIVES_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current)]
    | order(featured desc, coalesce(order, 9999) asc, publishedAt desc){
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    "tag": ${loc("tag")},
    "excerpt": ${loc("excerpt")},
    publishedAt,
    featured,
    hasDetailPage,
    coverImage${IMAGE_PROJECTION},
    externalLink
  }
`);

// Only initiatives with a detail page get static-generated routes. If
// hasDetailPage is unset (legacy data), it defaults to true so existing
// content keeps its page.
export const ALL_INITIATIVE_SLUGS_QUERY = defineQuery(`
  *[_type == "initiative" && defined(slug.current) && hasDetailPage != false]{
    "slug": slug.current
  }
`);

export const INITIATIVE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "initiative" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    "excerpt": ${loc("excerpt")},
    publishedAt,
    featured,
    hasDetailPage,
    coverImage${IMAGE_PROJECTION},
    headerType,
    "headerTitle": ${loc("headerTitle")},
    "headerTitleTail": ${loc("headerTitleTail")},
    "headerSubtitle": ${loc("headerSubtitle")},
    headerImage${IMAGE_PROJECTION},
    headerPrimaryCta${CTA_PROJECTION},
    headerSecondaryCta${CTA_PROJECTION},
    showDefaultSections,
    showBlog,
    showCareers,
    showCta,
    externalLink,
    "body": ${loc("body")},
    pageColor,
    showQuote,
    "quoteSupporting": ${loc("quoteSupporting")},
    "quoteText": ${loc("quoteText")},
    "quoteAttribution": ${loc("quoteAttribution")},
    quoteImage${IMAGE_PROJECTION},
    "whyMattersHeading": ${loc("whyMattersHeading")},
    "whyMattersBody": ${loc("whyMattersBody")},
    whyMattersImage${IMAGE_PROJECTION},
    "impactHeading": ${loc("impactHeading")},
    "impactBody": ${loc("impactBody")},
    "impactStats": impactStats[]{
      "value": ${loc("value")},
      "label": ${loc("label")}
    },
    showWhatThisIs,
    whatThisIsLayout,
    "whatThisIsHeading": ${loc("whatThisIsHeading")},
    "whatThisIsBody": ${loc("whatThisIsBody")},
    whatThisIsImage${IMAGE_PROJECTION},
    whatThisIsCta${CTA_PROJECTION},
    "metricsHeading": ${loc("metricsHeading")},
    "keyMetrics": keyMetrics[]{
      "value": ${loc("value")},
      "note": ${loc("note")},
      "label": ${loc("label")}
    },
    showDevelopments,
    developmentsLayout,
    "developmentsHeading": ${loc("developmentsHeading")},
    developmentsImage${IMAGE_PROJECTION},
    "developmentsBody": ${loc("developmentsBody")},
    developmentsCta${CTA_PROJECTION},
    showWhyBarbados,
    "whyBarbadosHeading": ${loc("whyBarbadosHeading")},
    "whyBarbadosBody": ${loc("whyBarbadosBody")},
    whyBarbadosCta${CTA_PROJECTION},
    whyBarbadosImage${IMAGE_PROJECTION},
    "ecosystemHeading": ${loc("ecosystemHeading")},
    "ecosystemBody": ${loc("ecosystemBody")},
    ecosystemCta${CTA_PROJECTION},
    showCurrentStatus,
    "currentStatusHeading": ${loc("currentStatusHeading")},
    currentStatusImage${IMAGE_PROJECTION},
    "currentStatusLead": ${loc("currentStatusLead")},
    "currentStatusBody": ${loc("currentStatusBody")},
    currentStatusPrimaryCta${CTA_PROJECTION},
    currentStatusSecondaryCta${CTA_PROJECTION},
    "outlookHeading": ${loc("outlookHeading")},
    "outlookBody": ${loc("outlookBody")},
    showNextSteps,
    showNextStepsCta,
    "nextStepsHeading": ${loc("nextStepsHeading")},
    "nextStepsBody": ${loc("nextStepsBody")},
    nextStepsCta${CTA_PROJECTION},
    showFinancing,
    "financingHeading": ${loc("financingHeading")},
    "financingBody": ${loc("financingBody")},
    showFinancingCta,
    financingCta${CTA_PROJECTION},
    "financingQuote": ${loc("financingQuote")},
    "financingName": ${loc("financingName")},
    "financingRole": ${loc("financingRole")},
    financingImage${IMAGE_PROJECTION},
    financingSocials[]{
      kind,
      href,
      "label": ${loc("label")}
    },
    showRoadmap,
    "roadmapEyebrow": ${loc("roadmapEyebrow")},
    "roadmapHeading": ${loc("roadmapHeading")},
    "roadmapStatement": ${loc("roadmapStatement")},
    roadmapCta${CTA_PROJECTION},
    roadmapImage${IMAGE_PROJECTION},
    showPhases,
    "phasesHeading": ${loc("phasesHeading")},
    "phases": phases[]{
      "title": ${loc("title")},
      "body": ${loc("body")}
    },
    phasesImage${IMAGE_PROJECTION},
    "relevanceHeading": ${loc("relevanceHeading")},
    "relevanceBody": ${loc("relevanceBody")},
    relevanceCta${CTA_PROJECTION}
  }
`);

export const INITIATIVE_POSTS_QUERY = defineQuery(`
  *[_type == "post" && showInInitiatives == true && defined(slug.current)]
    | order(publishedAt desc)[0...$limit]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "excerpt": ${loc("excerpt")},
    publishedAt,
    coverImage${IMAGE_PROJECTION},
    externalLink,
    "initiativeEyebrow": ${loc("initiativeEyebrow")},
    initiativeTileSize,
    initiativeTileAccent
  }
`);

export const INITIATIVES_PAGE_QUERY = defineQuery(`
  *[_type == "initiativesPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    heroImage${IMAGE_PROJECTION},
    "heroHeadline": ${loc("heroHeadline")},
    "heroBody": ${loc("heroBody")},
    heroPrimaryCta${CTA_PROJECTION},
    heroSecondaryCta${CTA_PROJECTION},

    showWorkInMotion,
    "workInMotionHeading": ${loc("workInMotionHeading")},
    "workInMotionBody": ${loc("workInMotionBody")},
    workInMotionBg,
    workInMotionPrimaryCta${CTA_PROJECTION},
    workInMotionSecondaryCta${CTA_PROJECTION},
    workInMotionImage${IMAGE_PROJECTION},

    // The defined() filter drops dangling weak refs (e.g. when the target
    // initiative has been deleted). Without it, deleted refs show up as
    // null entries and need extra handling downstream.
    "featuredInitiative": featuredInitiative->{
      _id,
      "title": ${loc("title")},
      "slug": slug.current,
      "subtitle": ${loc("subtitle")},
      "excerpt": ${loc("excerpt")},
      publishedAt,
      featured,
      coverImage${IMAGE_PROJECTION},
      externalLink
    },
    "featuredStatBody": ${loc("featuredStatBody")},
    "featuredSupportingInitiatives": featuredSupportingInitiatives[
      defined(@->_id)
    ]->{
      _id,
      "title": ${loc("title")},
      "slug": slug.current,
      "subtitle": ${loc("subtitle")},
      "tag": ${loc("tag")},
      "excerpt": ${loc("excerpt")},
      publishedAt,
      featured,
      coverImage${IMAGE_PROJECTION},
      externalLink
    },

    showMotionStories,
    "motionStoriesHeading": ${loc("motionStoriesHeading")},
    motionStoriesBg,
    motionStoriesViewAllHref,
    motionStoriesShowCount,

    showOtherWorks,
    "otherWorksEyebrow": ${loc("otherWorksEyebrow")},
    "otherWorksHeading": ${loc("otherWorksHeading")},
    "otherWorksBody": ${loc("otherWorksBody")},
    "otherWorksBlueTitle": ${loc("otherWorksBlueTitle")},
    "otherWorksBlueBody": ${loc("otherWorksBlueBody")},
    otherWorksBlueCta${CTA_PROJECTION},
    otherWorksBlueBg,
    "otherWorksGreenTitle": ${loc("otherWorksGreenTitle")},
    "otherWorksGreenBody": ${loc("otherWorksGreenBody")},
    otherWorksGreenBg,
    otherWorksTopRightImages[]${IMAGE_PROJECTION},
    otherWorksBottomLeftImage${IMAGE_PROJECTION},
    "otherWorksInitiatives": otherWorksInitiatives[defined(@->_id)]->{
      _id,
      "title": ${loc("title")},
      "slug": slug.current,
      "tag": ${loc("tag")},
      "excerpt": ${loc("excerpt")},
      coverImage${IMAGE_PROJECTION},
      externalLink,
      hasDetailPage
    },
    "otherWorksFeaturedTitle": ${loc("otherWorksFeaturedTitle")},
    otherWorksFeaturedImage${IMAGE_PROJECTION},
    otherWorksFeaturedHref,

    "buildingFutureHeading": ${loc("buildingFutureHeading")},
    "buildingFutureBody": ${loc("buildingFutureBody")},
    buildingFutureStats[]{
      "value": ${loc("value")},
      "body": ${loc("body")}
    },
    buildingFutureStatBg,
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const CONTACT_PAGE_QUERY = defineQuery(`
  *[_type == "contactPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroHeading": ${loc("heroHeading")},
    heroImage${IMAGE_PROJECTION},
    contactRows[]{
      "label": ${loc("label")},
      "value": ${loc("value")},
      "copyValue": ${loc("copyValue")}
    },

    "formHeading": ${loc("formHeading")},
    "formDescription": ${loc("formDescription")},
    "formSubmitLabel": ${loc("formSubmitLabel")},
    formBg,
    formImage${IMAGE_PROJECTION},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const CAREERS_PAGE_QUERY = defineQuery(`
  *[_type == "careersPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroHeadlineLine1": ${loc("heroHeadlineLine1")},
    "heroHeadlineHighlight": ${loc("heroHeadlineHighlight")},
    "heroDescription": ${loc("heroDescription")},
    heroImage${IMAGE_PROJECTION},

    "whyHeading": ${loc("whyHeading")},
    "whyIntro": ${loc("whyIntro")},
    whyImage${IMAGE_PROJECTION},
    whySections[]{
      "heading": ${loc("heading")},
      "body": ${loc("body")}
    },
    "whyBulletsHeading": ${loc("whyBulletsHeading")},
    whyBullets,

    "applyHeading": ${loc("applyHeading")},
    "applyBody": ${loc("applyBody")},

    "jobsHeading": ${loc("jobsHeading")},
    "jobsDescription": ${loc("jobsDescription")},
    "jobsSearchPlaceholder": ${loc("jobsSearchPlaceholder")},
    "jobsFindButtonLabel": ${loc("jobsFindButtonLabel")},
    jobsBg,

    "equalOpportunityParagraph1": ${loc("equalOpportunityParagraph1")},
    "equalOpportunityParagraph2": ${loc("equalOpportunityParagraph2")},
    equalOpportunityBg,
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const INVESTORS_PAGE_QUERY = defineQuery(`
  *[_type == "investorsPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroTitle": ${loc("heroTitle")},
    "heroTagline": ${loc("heroTagline")},
    heroCta${CTA_PROJECTION},
    heroImage${IMAGE_PROJECTION},

    "opportunityEyebrow": ${loc("opportunityEyebrow")},
    "opportunityHeading": ${loc("opportunityHeading")},
    "opportunityBody": ${loc("opportunityBody")},
    "opportunityCardLead": ${loc("opportunityCardLead")},
    opportunityStats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },
    opportunityCardBg,

    "whyHeading": ${loc("whyHeading")},
    "whyIntro": ${loc("whyIntro")},
    whyCards[]{
      "title": ${loc("title")},
      "body": ${loc("body")},
      bg,
      watermark
    },
    "whyClosing": ${loc("whyClosing")},
    whyImage${IMAGE_PROJECTION},

    "howHeading": ${loc("howHeading")},
    "howIntro": ${loc("howIntro")},
    howRoles[]{
      "label": ${loc("label")},
      "description": ${loc("description")}
    },
    howImage${IMAGE_PROJECTION},
    "howBody": ${loc("howBody")},
    howBg,

    "sitesHeading": ${loc("sitesHeading")},
    "sitesBody": ${loc("sitesBody")},
    sitesList,
    "sitesNote": ${loc("sitesNote")},

    incentivesImage${IMAGE_PROJECTION},
    "incentivesHeading": ${loc("incentivesHeading")},
    "incentivesLead": ${loc("incentivesLead")},
    incentivesItems[]{
      "body": ${loc("body")}
    },

    "bridgeEyebrow": ${loc("bridgeEyebrow")},
    "bridgeTitle": ${loc("bridgeTitle")},
    "bridgeTitleTail": ${loc("bridgeTitleTail")},
    "bridgeBody": ${loc("bridgeBody")},
    bridgeCta${CTA_PROJECTION},
    bridgeBg,

    "marketHeading": ${loc("marketHeading")},
    "marketLead": ${loc("marketLead")},
    marketStats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },
    "marketClosing": ${loc("marketClosing")},
    marketImage${IMAGE_PROJECTION},

    "tractionEyebrow": ${loc("tractionEyebrow")},
    "tractionHeading": ${loc("tractionHeading")},
    tractionItems[]{
      "label": ${loc("label")},
      "description": ${loc("description")}
    },

    "whyNowHeading": ${loc("whyNowHeading")},
    "whyNowBody": ${loc("whyNowBody")},
    whyNowPrimaryCta${CTA_PROJECTION},
    whyNowSecondaryCta${CTA_PROJECTION},
    whyNowImage${IMAGE_PROJECTION},
    whyNowBg,

    "climateHeading": ${loc("climateHeading")},
    climateCards[]{
      "title": ${loc("title")},
      "body": ${loc("body")},
      bg,
      watermark
    },

    "voicesEyebrow": ${loc("voicesEyebrow")},
    "voicesHeading": ${loc("voicesHeading")},
    "voicesHeadingTail": ${loc("voicesHeadingTail")},
    voicesQuotes[]{
      "quote": ${loc("quote")},
      "name": ${loc("name")},
      "title": ${loc("title")},
      image${IMAGE_PROJECTION},
      bg
    },

    "deeperHeading": ${loc("deeperHeading")},
    "deeperBody": ${loc("deeperBody")},
    deeperImage${IMAGE_PROJECTION},
    "timelineHeading": ${loc("timelineHeading")},
    timelineItems[]{
      "label": ${loc("label")},
      "description": ${loc("description")}
    },
    deeperPrimaryCta${CTA_PROJECTION},
    deeperSecondaryCta${CTA_PROJECTION},

    "blogHeading": ${loc("blogHeading")},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const PRIORITIES_PAGE_QUERY = defineQuery(`
  *[_type == "prioritiesPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroBody": ${loc("heroBody")},
    "heroHeadlineLine1": ${loc("heroHeadlineLine1")},
    "heroHeadlineLine2": ${loc("heroHeadlineLine2")},
    heroCta${CTA_PROJECTION},
    heroImage${IMAGE_PROJECTION},

    showStats,
    "statsIntro": ${loc("statsIntro")},
    "statsHeading": ${loc("statsHeading")},
    stats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },

    "prioritiesHeading": ${loc("prioritiesHeading")},
    "prioritiesIntro": ${loc("prioritiesIntro")},
    priorities[]{
      "label": ${loc("label")}
    },
    prioritiesCta${CTA_PROJECTION},
    prioritiesImage${IMAGE_PROJECTION},

    "latestHeading": ${loc("latestHeading")},
    latestShowCount,
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

// ── Strategic priorities ────────────────────────────────────────────────────
// The numbered index on /priorities and the linked /priorities/[slug] detail
// pages. Ordered by the editor-set `order`, then title.
const PRIORITY_CARD_PROJECTION = `{
  _id,
  "title": ${loc("title")},
  "slug": slug.current,
  "subtitle": ${loc("subtitle")},
  order,
  heroImage${IMAGE_PROJECTION}
}`;

export const ALL_PRIORITIES_QUERY = defineQuery(`
  *[_type == "priority" && defined(slug.current)]
    | order(coalesce(order, 9999) asc, ${loc("title")} asc)${PRIORITY_CARD_PROJECTION}
`);

export const ALL_PRIORITY_SLUGS_QUERY = defineQuery(`
  *[_type == "priority" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const PRIORITY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "priority" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    order,
    heroLayout,
    heroImage${IMAGE_PROJECTION},
    "heroHeadlineLead": ${loc("heroHeadlineLead")},
    "heroHeadlineEmphasis": ${loc("heroHeadlineEmphasis")},
    "heroHeadlineTrail": ${loc("heroHeadlineTrail")},
    pageColor,
    sectionBgColor,

    showOverview,
    "overviewHeading": ${loc("overviewHeading")},
    "overviewBody": ${loc("overviewBody")},

    showPoints,
    "pointsHeading": ${loc("pointsHeading")},
    points[]{
      "title": ${loc("title")},
      "body": ${loc("body")}
    },

    showStats,
    "statsHeading": ${loc("statsHeading")},
    stats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },

    showQuote,
    "quoteEyebrow": ${loc("quoteEyebrow")},
    "quoteHeading": ${loc("quoteHeading")},
    "quoteLead": ${loc("quoteLead")},
    "quoteText": ${loc("quoteText")},
    "quoteAttribution": ${loc("quoteAttribution")},
    "quoteRole": ${loc("quoteRole")},
    quotePortrait${IMAGE_PROJECTION},

    showPractice,
    "practiceEyebrow": ${loc("practiceEyebrow")},
    "practiceStatementLead": ${loc("practiceStatementLead")},
    "practiceStatementHighlight": ${loc("practiceStatementHighlight")},
    "practiceStatementTrail": ${loc("practiceStatementTrail")},
    "practiceBody": ${loc("practiceBody")},
    practicePrimaryCta${CTA_PROJECTION},
    practiceSecondaryCta${CTA_PROJECTION},

    showPracticeDetail,
    "practiceDetailHeading": ${loc("practiceDetailHeading")},
    "practiceDetailBody": ${loc("practiceDetailBody")},
    practiceDetailImage${IMAGE_PROJECTION},
    practiceDetailCta${CTA_PROJECTION},

    showPracticeTabs,
    "practiceTabsHeading": ${loc("practiceTabsHeading")},
    "practiceTabsLead": ${loc("practiceTabsLead")},
    "practiceTabsStatement": ${loc("practiceTabsStatement")},
    "practiceTabsTrail": ${loc("practiceTabsTrail")},
    practiceTabsItems[]{
      "label": ${loc("label")},
      "body": ${loc("body")},
      "bullets": ${loc("bullets")}
    },

    showMotion,
    "motionHeading": ${loc("motionHeading")},
    motionTone,
    motionCta${CTA_PROJECTION},
    motionImage${IMAGE_PROJECTION},
    motionItems[]{
      "title": ${loc("title")},
      "body": ${loc("body")}
    },

    ${PAGE_SECTIONS_PROJECTION}
  }
`);

// The /sectors landing page (singleton) — frames the sector cards below it.
export const SECTORS_PAGE_QUERY = defineQuery(`
  *[_type == "sectorsPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroHeading": ${loc("heroHeading")},
    "heroBody": ${loc("heroBody")},
    heroCta${CTA_PROJECTION},
    heroImage${IMAGE_PROJECTION},

    "sixHeading": ${loc("sixHeading")},
    "sixIntro": ${loc("sixIntro")},

    "latestHeading": ${loc("latestHeading")},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

// ── Sectors ─────────────────────────────────────────────────────────────────
// The /sectors listing (the drawer stack) and the linked /sectors/[slug] detail
// pages. Ordered by the editor-set `order`, then title. The card projection
// carries just what the listing stack renders.
const SECTOR_CARD_PROJECTION = `{
  _id,
  "title": ${loc("title")},
  "slug": slug.current,
  "subtitle": ${loc("subtitle")},
  order,
  cardImage${IMAGE_PROJECTION}
}`;

export const ALL_SECTORS_QUERY = defineQuery(`
  *[_type == "sector" && defined(slug.current)]
    | order(coalesce(order, 9999) asc, ${loc("title")} asc)${SECTOR_CARD_PROJECTION}
`);

export const ALL_SECTOR_SLUGS_QUERY = defineQuery(`
  *[_type == "sector" && defined(slug.current)]{
    "slug": slug.current
  }
`);

export const SECTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "sector" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "subtitle": ${loc("subtitle")},
    order,
    cardImage${IMAGE_PROJECTION},
    headerLayout,
    heroImage${IMAGE_PROJECTION},
    pageColor,
    heroHeadingColor,
    sectionBgColor,
    heroPrimaryCta${CTA_PROJECTION},
    heroSecondaryCta${CTA_PROJECTION},

    showOverview,
    "overviewHeading": ${loc("overviewHeading")},
    "overviewBody": ${loc("overviewBody")},

    showCapabilities,
    "capabilitiesHeading": ${loc("capabilitiesHeading")},
    capabilities[]{
      "title": ${loc("title")},
      "body": ${loc("body")}
    },

    showStats,
    "statsHeading": ${loc("statsHeading")},
    stats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },

    showQuote,
    "quoteEyebrow": ${loc("quoteEyebrow")},
    "quoteHeading": ${loc("quoteHeading")},
    "quoteLead": ${loc("quoteLead")},
    quoteCta${CTA_PROJECTION},
    "quoteText": ${loc("quoteText")},
    "quoteAttribution": ${loc("quoteAttribution")},
    "quoteRole": ${loc("quoteRole")},
    quotePortrait${IMAGE_PROJECTION},

    showPractice,
    "practiceHeading": ${loc("practiceHeading")},
    "practiceLead": ${loc("practiceLead")},
    "practiceBody": ${loc("practiceBody")},
    "practiceListHeading": ${loc("practiceListHeading")},
    practiceList[]{
      "term": ${loc("term")},
      "body": ${loc("body")}
    },
    "practiceCreatesLabel": ${loc("practiceCreatesLabel")},
    "practiceCreatesStatement": ${loc("practiceCreatesStatement")},
    practicePrimaryCta${CTA_PROJECTION},
    practiceSecondaryCta${CTA_PROJECTION},
    practiceImage${IMAGE_PROJECTION},
    practiceCards[]{
      "title": ${loc("title")},
      "body": ${loc("body")},
      tone
    },

    showOperational,
    "operationalHeading": ${loc("operationalHeading")},
    "operationalListHeading": ${loc("operationalListHeading")},
    operationalList[]{
      "term": ${loc("term")},
      "body": ${loc("body")}
    },
    operationalPrimaryCta${CTA_PROJECTION},
    operationalSecondaryCta${CTA_PROJECTION},
    operationalImage${IMAGE_PROJECTION},

    showBeingBuilt,
    "beingBuiltEyebrow": ${loc("beingBuiltEyebrow")},
    beingBuiltItems[]{
      "heading": ${loc("heading")},
      "subtitle": ${loc("subtitle")},
      "body": ${loc("body")}
    },
    beingBuiltPrimaryCta${CTA_PROJECTION},
    beingBuiltSecondaryCta${CTA_PROJECTION},
    beingBuiltImage${IMAGE_PROJECTION},

    showHighlight,
    "highlightHeading": ${loc("highlightHeading")},
    "highlightBody": ${loc("highlightBody")},
    "highlightStatement": ${loc("highlightStatement")},
    highlightImage${IMAGE_PROJECTION},

    showMotion,
    "motionHeading": ${loc("motionHeading")},
    motionTone,
    motionCta${CTA_PROJECTION},
    motionImage${IMAGE_PROJECTION},
    motionItems[]{
      "title": ${loc("title")},
      "body": ${loc("body")}
    },

    ${PAGE_SECTIONS_PROJECTION}
  }
`);

export const ALL_JOBS_QUERY = defineQuery(`
  *[_type == "job" && active != false && defined(slug.current)]
    | order(publishedAt desc){
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    category,
    "location": ${loc("location")},
    "schedule": ${loc("schedule")},
    "summary": ${loc("summary")},
    publishedAt
  }
`);

export const JOB_BY_SLUG_QUERY = defineQuery(`
  *[_type == "job" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    category,
    "location": ${loc("location")},
    "schedule": ${loc("schedule")},
    "summary": ${loc("summary")},
    "longSummary": ${loc("longSummary")},
    "description": ${loc("description")},
    sections[]{
      "title": ${loc("title")},
      "content": ${loc("content")}
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

// ── Events ──────────────────────────────────────────────────────────────────
// Every event, soonest first — drives the /events grid. Includes the synced
// Eventbrite id/url (set by /api/eventbrite-sync) used by the checkout widget.
const EVENT_PROJECTION = `{
  _id,
  "title": ${loc("title")},
  "slug": slug.current,
  "summary": ${loc("summary")},
  startAt,
  endAt,
  timezone,
  featured,
  currency,
  image${IMAGE_PROJECTION},
  eventbriteId,
  eventbriteUrl,
  tickets[]{ "name": ${loc("name")}, kind, price }
}`;

export const EVENTS_QUERY = defineQuery(`
  *[_type == "event" && defined(startAt)]
    | order(startAt asc)${EVENT_PROJECTION}
`);

// All event slugs — drives generateStaticParams for /events/[slug].
export const ALL_EVENT_SLUGS_QUERY = defineQuery(`
  *[_type == "event" && defined(slug.current)]{ "slug": slug.current }
`);

// Single event by slug — the /events/[slug] detail page. Adds the rich
// description + location fields on top of the card projection.
export const EVENT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "event" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "summary": ${loc("summary")},
    "description": ${loc("description")},
    startAt,
    endAt,
    timezone,
    featured,
    currency,
    locationType,
    "venueName": ${loc("venueName")},
    "venueAddress": ${loc("venueAddress")},
    image${IMAGE_PROJECTION},
    eventbriteId,
    eventbriteUrl,
    tickets[]{ "name": ${loc("name")}, kind, price, quantityTotal }
  }
`);

// Full event by id — used by the Eventbrite sync webhook. Projects everything
// the Eventbrite create/update needs, plus the stored syncHash (loop guard).
// imageUrl is the raw Sanity CDN URL of the upload (used as the event logo).
export const EVENT_FOR_SYNC_QUERY = defineQuery(`
  *[_type == "event" && _id == $id][0]{
    _id,
    "title": ${loc("title")},
    "summary": ${loc("summary")},
    "description": ${loc("description")},
    startAt,
    endAt,
    timezone,
    locationType,
    "venueName": ${loc("venueName")},
    "venueAddress": ${loc("venueAddress")},
    currency,
    tickets[]{ "name": ${loc("name")}, kind, price, quantityTotal },
    "imageUrl": image.asset.asset->url,
    eventbriteId,
    syncHash
  }
`);

export const IMPACT_PAGE_QUERY = defineQuery(`
  *[_type == "impactPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    "heroHeading": ${loc("heroHeading")},
    "heroBody": ${loc("heroBody")},
    heroImage${IMAGE_PROJECTION},
    heroCta${CTA_PROJECTION},

    "whyEyebrow": ${loc("whyEyebrow")},
    "whyHeadingLead": ${loc("whyHeadingLead")},
    "whyHeadingTrail": ${loc("whyHeadingTrail")},
    "whyBody": ${loc("whyBody")},
    "whyQuote": ${loc("whyQuote")},
    "whyAttributionName": ${loc("whyAttributionName")},
    "whyAttributionDate": ${loc("whyAttributionDate")},
    whyPortrait${IMAGE_PROJECTION},

    facilityImage${IMAGE_PROJECTION},

    trajectoryBlocks[]{
      "heading": ${loc("heading")},
      "body": ${loc("body")},
      highlight
    }
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage"][0]{
    "seoTitle": ${loc("seoTitle")},
    "seoDescription": ${loc("seoDescription")},

    heroImage${IMAGE_PROJECTION},
    "heroHeadline": ${loc("heroHeadline")},
    "heroSubheading": ${loc("heroSubheading")},
    heroCta${CTA_PROJECTION},

    "visionHeading": ${loc("visionHeading")},
    "visionDescription": ${loc("visionDescription")},
    visionPrimaryCta${CTA_PROJECTION},
    visionSecondaryCta${CTA_PROJECTION},
    visionBg,
    pillars[]{
      "eyebrow": ${loc("eyebrow")},
      "description": ${loc("description")},
      image${IMAGE_PROJECTION},
      bg,
      highlight
    },

    "differenceEyebrow": ${loc("differenceEyebrow")},
    "differenceHeading": ${loc("differenceHeading")},
    "differenceBody": ${loc("differenceBody")},
    "differenceTagline": ${loc("differenceTagline")},

    "missionHeading": ${loc("missionHeading")},
    "missionDescription": ${loc("missionDescription")},
    missionCards[]{
      "title": ${loc("title")},
      "description": ${loc("description")},
      href,
      "eyebrow": ${loc("eyebrow")},
      image${IMAGE_PROJECTION},
      bg
    },

    "statsHeading": ${loc("statsHeading")},
    "statsDescription": ${loc("statsDescription")},
    stats[]{
      "value": ${loc("value")},
      "description": ${loc("description")}
    },

    bannerImage${IMAGE_PROJECTION},

    "initiativesEyebrow": ${loc("initiativesEyebrow")},
    "initiativesHeading": ${loc("initiativesHeading")},
    initiativesShowCount,

    "leadershipHeading": ${loc("leadershipHeading")},
    "leadershipDescription": ${loc("leadershipDescription")},
    leadershipBg,
    leaders[]{
      "name": ${loc("name")},
      "role": ${loc("role")},
      image${IMAGE_PROJECTION},
      "bio": ${loc("bio")},
      linkedin
    },
    "leadershipContactHeading": ${loc("leadershipContactHeading")},
    "leadershipContactDescription": ${loc("leadershipContactDescription")},
    leadershipContactPrimaryCta${CTA_PROJECTION},
    leadershipContactSecondaryCta${CTA_PROJECTION},
    ${PAGE_SECTIONS_PROJECTION}
  }
`);

// ── Investor / Partner portal ────────────────────────────────────────────────

// Auth-critical reads. `useCdn:false` client (see app/lib/portal/sanity.ts).
export const PORTAL_USER_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "portalUser" && email == $email][0]{
    _id, name, email, organization, roles, status
  }
`);

export const PORTAL_USER_BY_ID_QUERY = defineQuery(`
  *[_type == "portalUser" && _id == $id][0]{
    _id, name, email, organization, roles, status
  }
`);

// Content listings — already filtered to the viewer's roles in GROQ (the DAL
// re-checks per item too). Audience match = non-empty intersection.
export const PORTAL_PAGES_QUERY = defineQuery(`
  *[_type == "portalPage" && count(audiences[@ in $roles]) > 0]
    | order(coalesce(order, 9999) asc, title asc){
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "summary": ${loc("summary")},
    audiences
  }
`);

export const PORTAL_RESOURCES_QUERY = defineQuery(`
  *[_type == "portalResource" && count(audiences[@ in $roles]) > 0]
    | order(coalesce(order, 9999) asc, title asc){
    _id,
    "title": ${loc("title")},
    "description": ${loc("description")},
    kind,
    audiences,
    file{ key, originalFilename, contentType, size }
  }
`);

// Detail reads include `audiences` so the page/route can re-check access for a
// directly-typed URL.
export const PORTAL_PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "portalPage" && slug.current == $slug][0]{
    _id,
    "title": ${loc("title")},
    "slug": slug.current,
    "summary": ${loc("summary")},
    audiences,
    // body is localized (internationalizedArrayPortableText). Resolve to the
    // active language's block array, then keep the per-block imageWithAlt
    // media resolution so the renderer is unchanged.
    "body": coalesce(
      body[language == $lang][0].value,
      body[language == "en"][0].value
    )[]{
      ...,
      _type == "imageWithAlt" => {
        ...,
        "videoUrl": coalesce(externalVideoUrl, video.asset->url),
        "audioUrl": coalesce(externalAudioUrl, audio.asset->url)
      }
    }
  }
`);

export const PORTAL_RESOURCE_BY_ID_QUERY = defineQuery(`
  *[_type == "portalResource" && _id == $id][0]{
    _id,
    "title": ${loc("title")},
    kind,
    audiences,
    file{ key, originalFilename, contentType, size }
  }
`);

// ── Site search ──────────────────────────────────────────────────────────────
// Powers the global search modal. `$q` is a GROQ match pattern built by the
// /api/search route (each token suffixed with `*` for prefix matching, e.g.
// "phar mal" -> "phar* mal*"). We match across *every* language value of each
// translatable field (`field[].value match $q`) so a query finds content no
// matter which language it was authored in, then project the localized value
// (via `loc`) for display. Results are grouped by type and capped per group;
// hrefs mirror each type's public route (coalescing to an external link where
// the document links out instead of rendering an on-site detail page).
const SEARCH_LIMIT = 6;

export const SEARCH_QUERY = defineQuery(`{
  "posts": *[_type == "post" && defined(slug.current) && (
      title[].value match $q ||
      excerpt[].value match $q
    )] | order(publishedAt desc)[0...${SEARCH_LIMIT}]{
    _id,
    "type": "post",
    "title": ${loc("title")},
    "description": ${loc("excerpt")},
    "href": coalesce(externalLink, "/blog/" + slug.current)
  },
  "initiatives": *[_type == "initiative" && defined(slug.current) && (
      title[].value match $q ||
      subtitle[].value match $q ||
      excerpt[].value match $q
    )] | order(featured desc, coalesce(order, 9999) asc, publishedAt desc)[0...${SEARCH_LIMIT}]{
    _id,
    "type": "initiative",
    "title": ${loc("title")},
    "description": coalesce(${loc("subtitle")}, ${loc("excerpt")}),
    "href": select(
      defined(externalLink) => externalLink,
      hasDetailPage != false => "/initiatives/" + slug.current,
      "/initiatives"
    )
  },
  "events": *[_type == "event" && defined(slug.current) && defined(startAt) && (
      title[].value match $q ||
      summary[].value match $q
    )] | order(startAt asc)[0...${SEARCH_LIMIT}]{
    _id,
    "type": "event",
    "title": ${loc("title")},
    "description": ${loc("summary")},
    "href": "/events/" + slug.current
  },
  "jobs": *[_type == "job" && active != false && defined(slug.current) && (
      title[].value match $q ||
      summary[].value match $q ||
      location[].value match $q
    )] | order(publishedAt desc)[0...${SEARCH_LIMIT}]{
    _id,
    "type": "job",
    "title": ${loc("title")},
    "description": coalesce(${loc("summary")}, ${loc("location")}),
    "href": "/careers/" + slug.current
  }
}`);
