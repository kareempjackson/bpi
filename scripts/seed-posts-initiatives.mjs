/**
 * Seeds demo Blog posts, Tags, and Initiatives into Sanity so the blog and
 * initiatives pages have realistic, image-led content to look at.
 *
 * - 7 tags, 10 posts, 10 initiatives.
 * - Every post & initiative is fully populated (cover image, excerpt, dates,
 *   flags) and carries an 800+ word portable-text body with an inline image.
 * - Cover + inline images are downloaded from Unsplash and uploaded into the
 *   Sanity asset pipeline (the schema uses real image assets, not URLs).
 *
 * Idempotent: fixed _ids + createOrReplace, and image uploads are de-duped and
 * cached on the asset's originalFilename so re-runs don't re-upload.
 *
 * Run:   node --env-file=.env.local scripts/seed-posts-initiatives.mjs
 * Clean: node --env-file=.env.local scripts/seed-posts-initiatives.mjs --clean
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/seed-posts-initiatives.mjs",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// ── portable-text builders ────────────────────────────────────────────────────
let k = 0;
const key = () => `k${(k += 1)}`;

const para = (text) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const heading = (text, style = "h2") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const quote = (text) => ({
  _type: "block",
  _key: key(),
  style: "blockquote",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const bullets = (items) =>
  items.map((text) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  }));

const bodyImage = (assetId, alt) => ({
  _type: "image",
  _key: key(),
  asset: { _type: "reference", _ref: assetId },
  ...(alt ? { alt } : {}),
});

const wordsIn = (body) =>
  body
    .filter((b) => b._type === "block")
    .flatMap((b) => (b.children || []).map((c) => c.text || ""))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

// ── image upload (download from Unsplash → upload to Sanity, cached) ──────────
const UNSPLASH = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

const assetCache = new Map(); // photoId → assetId

async function findExistingAsset(filename) {
  return client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $f][0]._id`,
    { f: filename },
  );
}

async function uploadImage(photoId) {
  if (assetCache.has(photoId)) return assetCache.get(photoId);
  const filename = `seed-${photoId}.jpg`;

  const existing = await findExistingAsset(filename);
  if (existing) {
    assetCache.set(photoId, existing);
    console.log(`  reuse  ${filename}`);
    return existing;
  }

  const res = await fetch(UNSPLASH(photoId));
  if (!res.ok) throw new Error(`Download failed ${photoId}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buf, { filename });
  assetCache.set(photoId, asset._id);
  console.log(`  upload ${filename}  →  ${asset._id}`);
  return asset._id;
}

const cover = (assetId, alt) => ({
  _type: "imageWithAlt",
  kind: "image",
  asset: { _type: "image", asset: { _type: "reference", _ref: assetId } },
  alt,
});

// ── tags ──────────────────────────────────────────────────────────────────────
const TAGS = [
  { slug: "manufacturing", title: "Manufacturing", color: "#1f7a4d" },
  { slug: "innovation", title: "Innovation", color: "#2563eb" },
  { slug: "research", title: "Research & Development", color: "#7c3aed" },
  { slug: "distribution", title: "Distribution", color: "#0891b2" },
  { slug: "policy", title: "Policy & Regulation", color: "#b45309" },
  { slug: "sustainability", title: "Sustainability", color: "#15803d" },
  { slug: "community", title: "Community", color: "#be123c" },
];

const tagDoc = (t) => ({
  _id: `seedTag-${t.slug}`,
  _type: "tag",
  title: t.title,
  slug: { _type: "slug", current: t.slug },
  color: t.color,
});

const tagRef = (slug) => ({
  _type: "reference",
  _key: key(),
  _ref: `seedTag-${slug}`,
  _weak: true,
});

// ── content ────────────────────────────────────────────────────────────────────
// Each entry's `body(img)` returns an 800+ word portable-text array, where `img`
// is the resolved inline-image asset id for that document.

const POSTS = [
  {
    id: "seedPost-fill-finish-suite",
    slug: "inside-bpis-sterile-fill-finish-suite",
    title: "Inside BPI's New Sterile Fill-Finish Suite",
    contentType: "article",
    tags: ["manufacturing", "innovation"],
    coverPhoto: "1581091226825-a6a2a5aee158",
    inlinePhoto: "1532187863486-abf9dbad1b69",
    daysAgo: 4,
    wideTile: true,
    excerpt:
      "A walk through the cleanrooms, isolators, and people behind BPI's newly validated sterile fill-finish line — and why it changes what the Caribbean can make for itself.",
    showInInitiatives: true,
    initiativeEyebrow: "Manufacturing",
    initiativeTileSize: "large",
    body: (img) => [
      para(
        "When the air-handling units finally hummed to life in the new fill-finish suite, the room fell quiet in the way that only a fully gowned team can manage. Months of construction, qualification runs, and paperwork had narrowed to a single question: would the line hold sterility under real production conditions? It did — and with that, Barbados Pharmaceutical Inc. crossed a threshold that very few facilities in the region have reached.",
      ),
      heading("Why fill-finish matters"),
      para(
        "Fill-finish is the last and most unforgiving stage of injectable manufacturing. It is where a sterile drug product is dosed into vials or syringes, sealed, and prepared for distribution. There is no downstream step that can rescue a contaminated unit, so every surface, every airflow pattern, and every human movement has to be engineered to keep the product clean. For decades, small island economies imported finished injectables because building this capability locally was considered too complex and too capital-intensive to justify.",
      ),
      para(
        "BPI took the opposite view. If the Caribbean wants resilience — the ability to keep clinics stocked through a hurricane season, a shipping disruption, or a global supply shock — then the hardest capabilities are precisely the ones worth owning. The fill-finish suite is the clearest expression of that thesis.",
      ),
      bodyImage(img, "Operator working at an aseptic filling isolator"),
      heading("Inside the cleanrooms"),
      para(
        "The suite is organized as a cascade of pressure-controlled rooms, each cleaner than the last. Personnel and materials move through airlocks designed so that air always flows from the cleanest zone outward, sweeping particles away from the exposed product. At the heart of the line sits a restricted-access barrier system: a sealed isolator where vials are filled under a continuous curtain of HEPA-filtered air, with operators working through glove ports rather than reaching in directly.",
      ),
      para(
        "Environmental monitoring runs constantly. Particle counters, settle plates, and active air samplers build a continuous picture of the room's microbial and particulate load. If any reading drifts toward an action limit, the batch record captures it and the team investigates before product is released. This is the unglamorous discipline that separates a suite that looks sterile from one that is sterile, batch after batch.",
      ),
      heading("Validation, the right way"),
      para(
        "Before a single commercial vial was filled, the line ran a series of media fills — production simulations that replace the drug with a sterile growth medium designed to reveal any contamination. Three consecutive successful media fills, covering the worst-case interventions an operator might perform, were required to qualify the process. The team also mapped temperature uniformity across the sterilizer, challenged the integrity of every filter, and traced cleaning validation down to swab-level residue limits.",
      ),
      ...bullets([
        "Three consecutive media fills passed with zero contaminated units.",
        "Sterilizing-grade filters integrity-tested before and after each batch.",
        "Smoke studies confirmed unidirectional airflow over the exposed product zone.",
        "Operators re-qualified on aseptic technique through gowning and intervention trials.",
      ]),
      heading("The people behind the line"),
      para(
        "Technology gets the headlines, but a sterile suite runs on people. BPI staffed the line with a mix of experienced manufacturing technicians and recent graduates from regional universities, then put every one of them through months of aseptic-technique training. The standard is exacting: a single careless movement near an open vial can compromise a batch, so operators rehearse their interventions until the motions are deliberate and economical.",
      ),
      para(
        "That investment pays back twice. The first return is product quality. The second is a growing pool of skilled pharmaceutical workers in Barbados — people who can carry this knowledge into the next line, the next facility, and the next generation of trainees. Sovereign capability is not just equipment; it is the accumulated judgment of the team that runs it.",
      ),
      quote(
        "You cannot import sterility assurance. It has to be built into your rooms, your procedures, and the habits of the people on the floor.",
      ),
      heading("From one suite to a system"),
      para(
        "The suite does not stand alone. BPI is deliberately assembling the complementary capabilities around it — formulation, quality control, packaging, and warehousing — so that a vial does not simply get filled but moves through a complete, controlled chain from raw material to released product. Each capability added makes the others more valuable, and together they begin to resemble not a single line but the nucleus of an industry.",
      ),
      para(
        "There is also a multiplier the equipment list never captures. A validated suite becomes a training ground, a reference others in the region can learn from, and a credential when the company seeks to register products abroad. The first commercial batches matter for the patients who receive them — and just as much for what they prove about what the Caribbean can now build and run for itself.",
      ),
      heading("What comes next"),
      para(
        "With the suite validated, BPI is moving toward its first commercial campaigns and preparing the regulatory dossiers that will let those products reach patients across the region. The longer arc is more ambitious still: a cluster of complementary capabilities — formulation, quality control, packaging, and cold-chain distribution — anchored in Barbados and serving the wider Caribbean. The fill-finish suite is one room. The point was never the room. The point is everything it now makes possible.",
      ),
      para(
        "For a region that has spent decades at the end of someone else's supply chain, that shift in posture matters. The quiet hum of those air handlers is, in its own way, a statement of intent.",
      ),
    ],
  },
  {
    id: "seedPost-regional-supply-agreement",
    slug: "barbados-secures-regional-supply-agreement",
    title: "Barbados Secures Regional Supply Agreement for Essential Medicines",
    contentType: "news",
    tags: ["distribution", "policy"],
    coverPhoto: "1504384308090-c894fdcc538d",
    inlinePhoto: "1454165804606-c3d57bc86b40",
    daysAgo: 9,
    externalLink: "https://www.barbadospharmainc.org/news",
    excerpt:
      "A multi-year agreement positions BPI as a regional supplier of essential injectables and generics, reducing the Caribbean's dependence on distant manufacturers.",
    body: (img) => [
      para(
        "Barbados Pharmaceutical Inc. has signed a multi-year supply agreement that will see the company provide essential injectables and generic medicines to public health systems across several Caribbean territories. The agreement, announced this week, is among the first of its kind to be anchored by manufacturing that physically sits inside the region rather than thousands of miles away.",
      ),
      heading("What the agreement covers"),
      para(
        "Under the terms, BPI will supply a defined basket of essential medicines — the everyday drugs that clinics and hospitals cannot run without — on predictable volumes and pricing. Predictability is the quiet headline here. Health ministries have long struggled with the volatility of global procurement, where a factory shutdown on another continent can leave a Caribbean pharmacy short of a life-saving product for weeks.",
      ),
      para(
        "By committing to multi-year volumes, the agreement gives BPI the demand certainty it needs to plan production campaigns, while giving health systems a supplier they can reach by a short flight rather than a six-week ocean voyage. It is a structural change in how the region sources its medicines.",
      ),
      bodyImage(img, "Pharmaceutical packaging on a distribution line"),
      heading("Why proximity changes the math"),
      para(
        "Distance is expensive in ways that do not always show up on an invoice. Long supply chains require larger safety stocks, more cold-chain handovers, and more points where things can go wrong. Every additional week in transit is a week of inventory financing, a week of refrigeration risk, and a week in which a sudden surge in demand cannot be met. Shortening that chain compresses all of those costs and risks at once.",
      ),
      ...bullets([
        "Lead times measured in days rather than weeks.",
        "Fewer cold-chain handovers, reducing the risk of temperature excursions.",
        "Local technical support and faster response to quality queries.",
        "Demand certainty that lets BPI plan efficient production campaigns.",
      ]),
      heading("A regional, not national, project"),
      para(
        "Officials involved in the negotiations were careful to frame the agreement as a regional good rather than a Barbadian win. The economics of pharmaceutical manufacturing reward scale, and no single Caribbean market is large enough on its own to justify the investment in sterile capacity. Pooling demand across territories is what makes local production viable — and what makes the resulting medicines affordable.",
      ),
      para(
        "That logic mirrors the broader push within CARICOM toward shared health security. The pandemic years exposed how quickly small states can be pushed to the back of the global queue when supply tightens. Building regional manufacturing, and then knitting it to regional demand through agreements like this one, is the practical answer to that vulnerability.",
      ),
      quote(
        "Health security is not a slogan. It is whether the medicine is on the shelf the morning a patient needs it — and whether you control the chain that put it there.",
      ),
      heading("Measuring success"),
      para(
        "Both sides have built review points into the agreement precisely so that performance is examined rather than assumed. If fill rates slip or delivery times stretch, the structure forces a conversation rather than a quiet drift back toward distant suppliers. That willingness to be measured is itself a signal of seriousness — an acknowledgment that the case for regional supply has to be earned in the data, not asserted in a press release, and re-earned with every quarter that follows.",
      ),
      para(
        "The real test of this agreement will not be the signing ceremony but the dull, vital metrics that follow: fill rates that stay high, stockouts that grow rare, and delivery times measured in days. Those numbers, tracked quarter after quarter, are how both sides will know whether regional supply genuinely outperforms the long-distance status quo it replaces.",
      ),
      para(
        "There is a confidence effect, too. Each shipment that arrives on time and on spec makes the next commitment easier — for the territories weighing whether to join, for regulators deciding what to register, and for BPI as it plans the production campaigns that depend on demand it can count on. Trust, once earned in practice, is what lets an arrangement like this widen from a foundation into a regional norm.",
      ),
      heading("Quality as the precondition"),
      para(
        "None of this works without trust in quality. Public buyers will not — and should not — accept locally made medicines simply because they are local. BPI's case rests on manufacturing to international standards, with the documentation and third-party scrutiny to prove it. The supply agreement is therefore as much a vote of confidence in the company's quality systems as it is a commercial arrangement.",
      ),
      para(
        "The company has invested heavily in quality control laboratories, stability testing, and the regulatory groundwork required to register products across multiple jurisdictions. Each registration is a slow, evidence-heavy process, and the agreement's rollout will track those approvals product by product rather than arriving all at once.",
      ),
      heading("The road ahead"),
      para(
        "Implementation will be phased. Early shipments will cover the products already cleared for the participating markets, with the basket widening as additional registrations come through and as BPI's production capacity scales. Both sides have described the agreement as a foundation to build on rather than a finished structure.",
      ),
      para(
        "If it succeeds, the template could extend to other essential categories and other territories — a Caribbean that increasingly makes, regulates, and distributes its own medicines. For now, the signatures on this agreement mark a concrete step away from dependence and toward a supply chain the region can actually see and touch.",
      ),
    ],
  },
  {
    id: "seedPost-cold-chain-logistics",
    slug: "cold-chain-logistics-caribbean-healthcare",
    title: "How Cold-Chain Logistics Are Reshaping Caribbean Healthcare",
    contentType: "article",
    tags: ["distribution", "innovation"],
    coverPhoto: "1518152006812-edab29b069ac",
    inlinePhoto: "1519389950473-47ba0277781c",
    daysAgo: 15,
    excerpt:
      "Vaccines and biologics live or die by temperature. Inside the unglamorous engineering that keeps medicines viable from factory floor to island clinic.",
    showInInitiatives: true,
    initiativeEyebrow: "Distribution",
    initiativeTileSize: "compact",
    initiativeTileAccent: true,
    body: (img) => [
      para(
        "A vaccine is only as good as the coldest and warmest moment of its journey. Stray a few degrees outside the validated range for long enough, and an expensive, carefully made biologic becomes a vial of useless liquid that looks exactly like the real thing. This invisible failure mode is why cold-chain logistics — not glamorous, rarely discussed — is quietly one of the most important problems in Caribbean healthcare.",
      ),
      heading("The tyranny of small islands"),
      para(
        "Geography makes the problem harder here than almost anywhere. Medicines often arrive by sea or air at a single port, then travel by road to district facilities, then to remote clinics that may sit at the end of a long, hot drive. Each transfer — from ship to warehouse, warehouse to truck, truck to refrigerator — is a chance for the temperature to drift. Ambient heat is unforgiving, and a power cut at the wrong moment can undo days of careful handling.",
      ),
      para(
        "Multiply that across dozens of islands, each with its own ports, roads, and grid reliability, and you begin to see why a 'last mile' in the Caribbean can be more fragile than a last mile almost anywhere else. The cold chain is not one chain; it is hundreds of small ones, each only as strong as its weakest handover.",
      ),
      bodyImage(img, "Temperature-controlled cold-chain storage units"),
      heading("Engineering the chain"),
      para(
        "Modern cold-chain practice answers fragility with redundancy and visibility. Insulated shippers now carry phase-change materials engineered to hold a precise temperature band for days, even if a refrigerator fails. Data loggers ride inside every shipment, recording temperature minute by minute so that any excursion is detected and documented rather than guessed at. When a shipment arrives, the log is reviewed before the product is accepted — no log, no acceptance.",
      ),
      ...bullets([
        "Continuous data loggers travel with every temperature-sensitive shipment.",
        "Phase-change packaging holds the cold band through power interruptions.",
        "Backup generators and solar-assisted refrigeration protect storage sites.",
        "Clear excursion procedures decide what to quarantine and what to release.",
      ]),
      heading("From reactive to predictive"),
      para(
        "The next leap is moving from detecting problems to anticipating them. Real-time telemetry lets a logistics team watch a shipment's temperature as it moves, intervening before a drift becomes an excursion. Pair that with demand forecasting, and inventory can be positioned closer to where it will be needed — reducing both stockouts and the waste of expired product. The cold chain becomes a living system rather than a series of hopeful handoffs.",
      ),
      para(
        "BPI's interest here is direct. Manufacturing medicines locally only delivers value if those medicines reach patients in usable condition. A factory and a distribution network are two halves of the same promise; investing in one while neglecting the other would be self-defeating.",
      ),
      quote(
        "The cold chain is the part of medicine no patient ever sees — and the part that decides whether their medicine works at all.",
      ),
      heading("The economics of getting it right"),
      para(
        "None of this is unique to medicine, but the stakes are higher here than in almost any other cargo. A spoiled shipment of consumer goods is an inconvenience; a spoiled shipment of vaccines can mean a vaccination campaign delayed and a community left exposed. Treating the cold chain as critical infrastructure rather than ordinary freight is the mental shift that justifies the investment — and that turns reliability from an aspiration into an operating requirement everyone in the chain is accountable for.",
      ),
      para(
        "A well-run cold chain pays for itself in ways that are easy to overlook. Spoiled product is pure loss — the manufacturing cost, the shipping cost, and the clinical opportunity, all written off at once. Reducing excursions therefore protects not just patient safety but the entire economic case for handling temperature-sensitive medicines in the first place.",
      ),
      para(
        "For the Caribbean, where every vial may have travelled far and cost dearly to bring close, that math is especially sharp. Investing in loggers, packaging, backup power, and training is not overhead; it is the protection of an asset already paid for. The cheapest cold chain, counterintuitively, is usually the one built well enough that almost nothing is ever lost.",
      ),
      heading("People and procedures"),
      para(
        "As with sterile manufacturing, the technology is only half the story. A logger is useless if no one reads it; a backup generator is useless if no one tests it. Reliable cold chains are built on trained staff who understand why the rules exist, and on procedures simple enough to follow correctly at the end of a long shift. The most common cause of spoilage is not exotic equipment failure but a fridge left open, a shipment left on a hot loading dock, or a power cut nobody planned for.",
      ),
      para(
        "That is why training and clear accountability matter as much as hardware. Every person who touches a temperature-sensitive product is a link in the chain, and the chain only holds if each of them knows their part.",
      ),
      heading("Why it reshapes care"),
      para(
        "A dependable cold chain quietly expands what a health system can offer. It makes ambitious vaccination campaigns feasible, lets clinics stock biologics that were previously too risky to handle, and reduces the financial bleed of expired stock. For the Caribbean, strengthening the cold chain is one of the highest-leverage investments available — and one of the least visible. The reward is simple and profound: when a patient needs a medicine, it works.",
      ),
    ],
  },
  {
    id: "seedPost-sustainability-report",
    slug: "bpi-2026-sustainability-report",
    title: "BPI 2026 Sustainability Report",
    contentType: "report",
    tags: ["sustainability", "policy"],
    coverPhoto: "1473341304170-971dccb5ac1e",
    inlinePhoto: "1497215728101-856f4ea42174",
    daysAgo: 21,
    excerpt:
      "Our first full-year sustainability report: water, energy, waste, and the social footprint of building a pharmaceutical industry on a small island.",
    body: (img) => [
      para(
        "Pharmaceutical manufacturing is resource-intensive. It consumes purified water by the cubic metre, runs energy-hungry HVAC systems around the clock, and generates waste streams that demand careful handling. Building this industry in Barbados — a small island with finite water and a grid still weaning itself off imported fuel — means confronting those realities honestly. This report is our attempt to do exactly that.",
      ),
      heading("Why we publish this"),
      para(
        "A sustainability report is only worth writing if it is candid about what is not yet good enough. We have set out our baselines across water, energy, and waste not to celebrate them, but to make ourselves accountable for improving them. Numbers published are numbers that can be questioned, tracked, and held against next year's results. That is the point.",
      ),
      bodyImage(img, "Solar panels supporting clean energy operations"),
      heading("Water: the island constraint"),
      para(
        "Barbados is classified as a water-scarce country, and pharmaceutical-grade water is among the most demanding utilities a facility produces. Our purified-water and water-for-injection systems are engineered to recover and reuse where validation allows, and we measure consumption per batch so that efficiency gains are visible rather than vague. Reducing the water intensity of each unit produced is, for us, both an environmental obligation and a basic condition of operating responsibly on this island.",
      ),
      ...bullets([
        "Per-batch water consumption tracked as a core operating metric.",
        "Reverse-osmosis reject water recovered for non-product uses where feasible.",
        "Closed-loop cooling to minimize fresh-water draw on the HVAC plant.",
        "Leak detection and metering across the utility network.",
      ]),
      heading("Energy and the grid"),
      para(
        "Cleanrooms never sleep. The air-handling systems that keep manufacturing spaces sterile run continuously, making energy our largest environmental lever. We are pursuing efficiency on two fronts: reducing demand through better controls and heat recovery, and greening supply through on-site solar generation and participation in the island's broader transition to renewable power. Every kilowatt-hour we avoid or decarbonize lowers both our footprint and our exposure to volatile fuel prices.",
      ),
      para(
        "We are transparent that this is a journey. Our current renewable share is a starting point, not a destination, and we have set targets to raise it year over year. Publishing the baseline is how we hold ourselves to that path.",
      ),
      quote(
        "Sustainability on a small island is not abstract. It is whether the water you use and the power you burn leave the place better able to support the next industry, not worse.",
      ),
      heading("Accountability over aspiration"),
      para(
        "Transparency carries a cost we accept deliberately: it gives critics something concrete to point at. We consider that a feature rather than a flaw. Vague commitments invite vague accountability, while specific numbers invite specific scrutiny — and specific scrutiny is what actually drives improvement. The companies that hide their environmental performance behind soft language are usually the ones with the most to hide. We would rather publish figures that occasionally embarrass us than language that never holds us to anything at all.",
      ),
      para(
        "It would be easy to fill a sustainability report with aspiration and leave it there. We have chosen instead to anchor it in numbers we can be held to — baselines that can be questioned and targets that can be missed in full public view. A commitment that carries no risk of visible failure is not really a commitment at all.",
      ),
      para(
        "That is also why this report will return each year with the same metrics, tracked over time. Progress in sustainability is rarely linear, and some years will show setbacks alongside gains. Reporting both honestly is the only way the document earns the trust it is meant to build — with regulators, with the community, and with the people who work here.",
      ),
      heading("Waste and materials"),
      para(
        "Pharmaceutical operations generate several waste streams — solvents, packaging, single-use components, and the inevitable byproducts of cleaning and quality testing. Our approach prioritizes the familiar hierarchy: reduce first, then reuse, then recycle, and only then dispose. Hazardous streams are segregated and handled through licensed pathways, and we are working to design packaging that uses less material without compromising the protection a medicine requires.",
      ),
      para(
        "Single-use technologies, common in modern manufacturing, present a genuine tension: they improve sterility assurance and reduce water and cleaning-chemical use, but they generate plastic waste. We report both sides of that trade-off rather than hiding behind whichever framing is more flattering.",
      ),
      heading("The social footprint"),
      para(
        "Sustainability is not only environmental. Building a pharmaceutical industry creates skilled jobs, draws talented graduates back to the region, and develops capabilities that ripple outward into the wider economy. We track our local hiring, our training hours, and our spending with regional suppliers, because a sustainable enterprise is one that strengthens the community hosting it. The medicines we make matter; so does the livelihood and expertise we build while making them.",
      ),
      heading("What the targets look like"),
      para(
        "This report closes with the commitments we are prepared to be measured against: year-over-year reductions in water and energy intensity, a rising renewable share, expanded local procurement, and continued investment in workforce development. We will report progress against each of these in next year's edition — including where we fall short. Trust is earned by reporting the misses as plainly as the wins, and that is the standard we intend to hold.",
      ),
    ],
  },
  {
    id: "seedPost-bioequivalence-guide",
    slug: "researchers-guide-to-bioequivalence",
    title: "A Researcher's Guide to Generic Drug Bioequivalence",
    contentType: "resource",
    tags: ["research", "innovation"],
    coverPhoto: "1530026405186-ed1f139313f8",
    inlinePhoto: "1582719478250-c89cae4dc85b",
    daysAgo: 28,
    excerpt:
      "What does it actually mean for a generic to be 'the same' as the original? A clear, practical primer on bioequivalence for students and new researchers.",
    body: (img) => [
      para(
        "Generic medicines are one of the great quiet bargains of modern healthcare: the same therapeutic effect as a brand-name drug, at a fraction of the price. But 'the same' is doing a lot of work in that sentence. A generic is not a copy assembled from the original's blueprints — it is an independently formulated product that must prove it behaves like the reference drug inside the human body. The science that underwrites that proof is called bioequivalence, and it is worth understanding properly.",
      ),
      heading("Same active ingredient, different product"),
      para(
        "A generic must contain the same active pharmaceutical ingredient, in the same strength and dosage form, intended for the same use as the reference product. What it need not share is the inactive supporting cast — the binders, fillers, and coatings that carry the drug. Those can differ, which means the manufacturer has to demonstrate that their different formulation still delivers the drug to the bloodstream in essentially the same way.",
      ),
      bodyImage(img, "Researcher analyzing samples in a laboratory"),
      heading("The shape of the evidence"),
      para(
        "The classic bioequivalence study is elegantly simple in design. A group of healthy volunteers takes the generic on one occasion and the reference drug on another, in a crossover so that each person serves as their own comparison. Blood samples are drawn over time, and the concentration of the drug is plotted to produce a curve. Two features of that curve carry most of the weight: the peak concentration reached, and the total exposure — the area under the curve — over the dosing interval.",
      ),
      ...bullets([
        "Cmax — the peak concentration the drug reaches in the blood.",
        "Tmax — how quickly that peak is reached.",
        "AUC — the total drug exposure, the area under the concentration-time curve.",
        "Crossover design — each volunteer receives both products, reducing variability.",
      ]),
      heading("The 80–125 rule"),
      para(
        "Here is the part that surprises newcomers. Regulators do not require the generic to be identical to the reference — biological systems are too variable for that to be a meaningful standard. Instead, they require that the ratio of the generic to the reference, for the key parameters, falls within a defined range, with the 90% confidence interval contained between 80% and 125%. The asymmetry is deliberate: it reflects the logarithmic way drug concentrations are analyzed, and it is tighter than the numbers first suggest.",
      ),
      para(
        "Crucially, this is a confidence-interval requirement, not just a point estimate. The study must be large and well-controlled enough that the entire interval, accounting for statistical uncertainty, sits inside the window. A product whose average looks fine but whose data are noisy will fail — and should.",
      ),
      quote(
        "Bioequivalence does not ask whether two products are identical. It asks whether the difference between them is small enough to be clinically irrelevant — and proves it with statistics.",
      ),
      heading("A worked intuition"),
      para(
        "It helps to hold a concrete picture in mind. Imagine plotting the drug's blood concentration over time for both products and laying the two curves on top of each other. If they rise at a similar rate, peak at a similar height, and enclose a similar area, the body is, for practical purposes, seeing the same drug exposure from each. Bioequivalence is simply the statistical formalization of that visual intuition.",
      ),
      para(
        "What the statistics add is rigour about uncertainty. A single pair of curves could match by luck; the confidence-interval requirement insists the match hold across enough subjects that chance is an implausible explanation. That is why study design — sample size, crossover, controlled conditions — matters as much as the chemistry. Good evidence is not just the right average, but the right average proven beyond reasonable doubt.",
      ),
      heading("Where it gets harder"),
      para(
        "Not every drug fits the standard template. Highly variable drugs, narrow-therapeutic-index drugs, long-acting injectables, and locally acting products that never enter the bloodstream in meaningful amounts each demand tailored approaches. For some, regulators specify additional studies or tighter limits; for others, in-vitro testing or pharmacodynamic endpoints substitute for blood-level measurements. A good researcher learns the template first, then learns when the template does not apply.",
      ),
      para(
        "Formulation work sits underneath all of this. Achieving bioequivalence often means painstaking adjustment of particle size, dissolution behavior, and excipient choice until the generic's release profile matches the reference. The clinical study is the verdict; the months of formulation that precede it are where the work actually happens.",
      ),
      heading("Why it matters for the region"),
      para(
        "For a manufacturer building generic capacity in the Caribbean, bioequivalence is the gatekeeper to credibility. It is the objective, internationally recognized standard that lets a regulator, a clinician, and ultimately a patient trust that a locally made generic will perform exactly as the expensive import did. Mastering this science is not optional polish — it is the foundation on which an entire affordable-medicines strategy rests.",
      ),
      para(
        "For students entering the field, that makes bioequivalence one of the most rewarding areas to specialize in. It sits precisely where rigorous statistics, careful chemistry, and real human benefit meet — and the region needs people who can work fluently in all three.",
      ),
    ],
  },
  {
    id: "seedPost-sovereign-capacity",
    slug: "sovereign-manufacturing-small-island-states",
    title: "Building Sovereign Manufacturing Capacity in Small Island States",
    contentType: "article",
    tags: ["manufacturing", "policy"],
    coverPhoto: "1581092918056-0c4c3acd3789",
    inlinePhoto: "1565374395542-0ce18882c857",
    daysAgo: 34,
    wideTile: true,
    excerpt:
      "Conventional economics says small islands shouldn't make their own medicines. The pandemic taught a harder lesson about what 'shouldn't' really costs.",
    body: (img) => [
      para(
        "For most of the modern era, the advice to small island states was consistent and confident: do not try to manufacture your own medicines. The economics, the experts said, simply do not work. Markets are too small, capital costs too high, technical complexity too daunting. Better to buy from efficient global producers and spend your scarce resources elsewhere. It was sensible advice, right up until the moment it wasn't.",
      ),
      heading("The lesson of the empty shelf"),
      para(
        "When global supply tightened during the pandemic, the comfortable logic of comparative advantage collided with the uncomfortable reality of triage. Large markets secured supply first. Small, distant ones waited. The medicines and equipment that textbooks said would always be available at a price turned out to be unavailable at any price, for those without leverage. The cost of dependence, long hidden, became suddenly and painfully visible.",
      ),
      para(
        "That experience reframed the question. It was never really about whether local manufacturing could match the per-unit cost of a mega-factory abroad. It was about what a guaranteed supply is worth when the alternative is going without. Resilience, it turns out, is a product with its own value — one that pure efficiency accounting never bothered to price.",
      ),
      bodyImage(img, "Industrial pharmaceutical production equipment"),
      heading("Reframing the economics"),
      para(
        "Once resilience enters the ledger, the calculus shifts. A locally made medicine that costs slightly more per unit may be far cheaper once you account for the safety stock you no longer need to hoard, the emergency airfreight you no longer pay for, and the simple fact that the product is actually there when a patient needs it. Add the jobs, the skills, and the supplier ecosystem that grow around a factory, and the case strengthens further.",
      ),
      ...bullets([
        "Resilience has economic value that per-unit cost comparisons ignore.",
        "Pooling regional demand reaches the scale a single island cannot.",
        "Skilled jobs and supplier networks compound over time.",
        "Local production shortens chains that are expensive and fragile to maintain.",
      ]),
      heading("Scale through cooperation"),
      para(
        "None of this means every island should build its own factory. The opposite, in fact. The viable path runs through cooperation: pooling the demand of multiple territories so that a single, well-run regional facility reaches the volumes that make sterile manufacturing economic. Sovereignty, in this framing, is regional rather than national — a Caribbean capability rather than a Barbadian or Jamaican or Trinidadian one.",
      ),
      para(
        "That requires the unglamorous work of harmonizing regulations, aligning procurement, and building the institutional trust that lets territories rely on one another. It is slower than building a factory, but without it the factory has no market large enough to sustain it.",
      ),
      quote(
        "The question was never whether small states can afford to make their own medicines. It is whether they can afford not to.",
      ),
      heading("Lessons from elsewhere"),
      para(
        "There is one further lesson worth naming: patience. The economies that succeeded did not expect their pharmaceutical sectors to turn a profit in the first few years, treating early investment as the price of a strategic capability rather than a quick commercial bet. Those that demanded immediate returns tended to abandon the effort just before it would have matured. Building sovereign capacity is a decade-scale undertaking, and the willingness to hold that horizon is, in the end, as decisive as any technical choice along the way.",
      ),
      para(
        "Small and mid-sized economies elsewhere have walked versions of this path, and their experience offers a consistent lesson: success comes from focus and cooperation, failure from trying to do everything alone. The economies that built durable pharmaceutical capacity concentrated on a defined set of products, partnered across borders for scale, and invested patiently in people. Those that scattered their effort thinly tended to produce showcase factories that never reached viability.",
      ),
      para(
        "The Caribbean has the advantage of learning from both kinds of example. The strategy BPI is pursuing — focused products, regional demand, international standards, and heavy investment in talent — is drawn directly from what has actually worked. Sovereignty is achievable, but only when it is pursued as a disciplined economic project rather than a matter of national pride alone.",
      ),
      heading("Choosing the right battles"),
      para(
        "Sovereign capability does not mean making everything. It means making the right things — the essential medicines whose absence causes the most harm, and the dosage forms where supply is most fragile. A focused portfolio, manufactured to international standards and backed by regional demand, beats an ambition to replicate the entire global pharmacopoeia. Strategy here is as much about what to leave to others as what to bring home.",
      ),
      para(
        "BPI's own focus on sterile injectables and essential generics reflects exactly this logic. These are high-stakes, supply-fragile categories where local production delivers the most resilience per dollar invested.",
      ),
      heading("A different kind of development"),
      para(
        "There is a deeper point underneath the economics. For small post-colonial states, the ability to make something as sophisticated as a sterile medicine is not only practical but symbolic — a demonstration that complex, high-value industry can take root in the region and be run by its own people. The factory produces vials. It also produces confidence, expertise, and a sense of what else might be possible. That, in the end, may be the most valuable output of all.",
      ),
    ],
  },
  {
    id: "seedPost-university-partnership",
    slug: "partnering-with-regional-universities",
    title: "Partnering with Regional Universities on Pharmaceutical Talent",
    contentType: "article",
    tags: ["research", "community"],
    coverPhoto: "1542744173-8e7e53415bb0",
    inlinePhoto: "1497366216548-37526070297c",
    daysAgo: 41,
    excerpt:
      "A factory is only as strong as the people who run it. How BPI is working with regional universities to build a pipeline of pharmaceutical scientists and technicians.",
    body: (img) => [
      para(
        "Buy a sterilizer and it arrives in weeks. Train the person who can operate it, troubleshoot it, and know instinctively when something is wrong, and you are looking at years. This asymmetry — equipment is fast, expertise is slow — is the single biggest constraint on building a pharmaceutical industry in any new location. BPI's answer is to start upstream, working directly with the region's universities to grow the talent the industry needs before the industry strictly needs it.",
      ),
      heading("The talent bottleneck"),
      para(
        "Pharmaceutical manufacturing draws on an unusually wide range of skills: analytical chemistry, microbiology, process engineering, quality systems, regulatory affairs, and the hard-to-teach discipline of working cleanly in a sterile environment. Few of these are taught with manufacturing in mind, and fewer still come with the hands-on exposure that turns a graduate into a productive employee. The result is a gap between what universities produce and what a factory floor requires.",
      ),
      para(
        "Left alone, that gap forces companies to import expertise at great expense, or to spend years training from scratch. Neither builds the durable local capability that makes a regional industry worth having in the first place.",
      ),
      bodyImage(img, "Students collaborating in a science laboratory"),
      heading("Closing the gap, together"),
      para(
        "BPI's partnerships with regional universities are designed to close that gap from both ends. The company works with faculty to align coursework with the realities of modern manufacturing, opens its facilities for student placements and internships, and brings working scientists into classrooms to teach the parts of the job that textbooks miss. The aim is graduates who arrive already fluent in the vocabulary and habits of the industry.",
      ),
      ...bullets([
        "Internships and placements that put students on real production and QC work.",
        "Guest lectures from working scientists on manufacturing, quality, and regulation.",
        "Input into curriculum so coursework reflects current industry practice.",
        "Final-year and graduate research projects tied to genuine company problems.",
      ]),
      heading("Research that points both ways"),
      para(
        "The relationship is not one-directional. Universities bring research capability that a young company cannot replicate in-house — depth in formulation science, analytical method development, and the patient, open-ended inquiry that industry timelines rarely permit. By sponsoring student projects on real problems, BPI gains fresh thinking while students gain the rare experience of research with a tangible, real-world endpoint.",
      ),
      para(
        "Over time, these projects seed a regional research culture oriented toward pharmaceutical science — a base of knowledge and curiosity that compounds well beyond any single company's needs.",
      ),
      quote(
        "The most important thing we are building is not a product line. It is a generation of people who know how to make medicines, and who chose to do it here.",
      ),
      heading("From classroom to clean room"),
      para(
        "Employers across the region quietly report the same gap, and it is not a knock on the universities — it is the nature of a discipline where competence is built through repetition under real conditions. What the partnerships add is exactly that missing repetition: hours on real equipment, under real supervision, with real consequences. A graduate who has spent months inside an operating facility arrives not just knowing what a clean room is, but carrying the instincts that keep one clean. That difference is worth more than any single course on a transcript.",
      ),
      para(
        "The distance between a university lab and a production clean room is larger than it looks. A student who has run an experiment once, at small scale, with forgiving tolerances, is not yet ready for an environment where a single lapse can cost an entire sterile batch. Bridging that gap is precisely what the partnerships are designed to do — through placements, mentoring, and the repeated, supervised practice that turns theoretical knowledge into reliable habit.",
      ),
      para(
        "The benefit runs in both directions over time. As graduates move into industry and gain experience, some return to teach, advise, or co-supervise the next cohort, closing the loop. A partnership that begins as a company helping a university gradually becomes a genuine ecosystem, in which classroom and factory continuously inform and strengthen one another.",
      ),
      heading("Keeping talent in the region"),
      para(
        "There is a stubborn pattern in small economies: the brightest graduates leave, drawn abroad by opportunities that home cannot match. A credible, ambitious local industry is one of the few things that can reverse it. When a chemistry or engineering graduate can see a path to challenging, well-paid, internationally relevant work without emigrating, the calculus changes. Talent that would have left, stays — and talent that left, sometimes returns.",
      ),
      para(
        "That retention is itself a form of development. Every scientist who builds a career in the region rather than leaving it strengthens the foundation for whatever the region builds next, in pharmaceuticals and far beyond.",
      ),
      heading("A long game, played deliberately"),
      para(
        "Partnerships like these do not pay off in a quarter. They are a deliberate long game, premised on the belief that the constraint on regional industry is people, and that people are grown rather than bought. BPI is investing accordingly — in classrooms, in internships, and in the slow, unglamorous work of turning bright students into the scientists and technicians a sovereign pharmaceutical industry cannot exist without.",
      ),
      para(
        "It is, in the most literal sense, an investment in the future running of the very factories the region is only beginning to build.",
      ),
    ],
  },
  {
    id: "seedPost-quality-by-design",
    slug: "quality-by-design-process-validation",
    title: "Quality by Design: Our Approach to Process Validation",
    contentType: "article",
    tags: ["manufacturing", "research"],
    coverPhoto: "1579154204601-01588f351e67",
    inlinePhoto: "1559757175-0eb30cd8c063",
    daysAgo: 48,
    excerpt:
      "Quality you inspect for is quality you've already lost. Why BPI builds quality into the process itself, and what 'Quality by Design' means on the factory floor.",
    body: (img) => [
      para(
        "There is an old way to think about pharmaceutical quality and a better one. The old way treats quality as something you test for at the end — make the batch, sample it, and hope it passes. The better way, codified in the principle known as Quality by Design, treats quality as something you engineer into the process from the start, so that a conforming product is the inevitable result rather than a lucky one. BPI is built on the second philosophy.",
      ),
      heading("Why testing at the end is not enough"),
      para(
        "End-of-line testing has a fundamental flaw: you can only sample a fraction of a batch, so a passing test tells you the samples were good, not that every unit was. If quality is variable, testing simply tells you, after the fact, that you have a problem — by which point the material and time are already spent. Inspection catches failure; it does not prevent it. For sterile and high-stakes products, prevention is the only acceptable standard.",
      ),
      bodyImage(img, "Quality control analysis in a pharmaceutical lab"),
      heading("Understanding before controlling"),
      para(
        "Quality by Design begins with deep understanding. Before a process is locked down, the team identifies which product attributes actually matter to safety and efficacy — the critical quality attributes — and then determines which process parameters influence them. The relationship between the two is mapped deliberately, often through structured experiments, until the team knows not just that a setting works, but why, and how much room exists around it before quality starts to suffer.",
      ),
      ...bullets([
        "Critical quality attributes: the product properties that matter to the patient.",
        "Critical process parameters: the settings that drive those attributes.",
        "Design space: the proven range within which the process reliably succeeds.",
        "Control strategy: how parameters are kept inside that range, every batch.",
      ]),
      heading("The design space"),
      para(
        "The payoff of this understanding is the design space — a multidimensional region of parameter settings within which quality is assured. Operating inside it is not guesswork; it is movement within a boundary that has been demonstrated to produce conforming product. That knowledge makes a process robust: it tolerates the small, inevitable variations of real manufacturing without drifting out of specification, because the team knows exactly how much variation it can absorb.",
      ),
      para(
        "It also makes a process easier to improve and defend. When a regulator asks why a parameter is set where it is, the answer is data, not tradition. When something does drift, the team knows immediately whether it matters and what to do about it.",
      ),
      quote(
        "Quality you inspect for is quality you have already lost. The only quality worth having is the kind you build into the process before the first unit is ever made.",
      ),
      heading("When something goes wrong"),
      para(
        "The truest test of a quality system is not the batch that goes perfectly but the one that does not. When a parameter drifts or a deviation appears, a process built on Quality by Design responds with knowledge rather than panic: the team already understands which attributes are at risk, how far the drift can go before quality suffers, and what corrective action the data supports. Investigation becomes diagnosis rather than guesswork.",
      ),
      para(
        "That same understanding makes continuous improvement possible. Because the process is characterized rather than merely fixed, the team can refine it deliberately — tightening a control here, widening a tolerance there — with confidence about the consequences. A process you understand is one you can both defend and improve; a process you have only memorized is one you can only hope keeps working.",
      ),
      heading("Validation as proof, not theatre"),
      para(
        "Process validation, in this framework, is not a box-ticking ritual performed once and forgotten. It is the formal demonstration that the process, run within its design space, consistently produces what it is supposed to. BPI approaches validation in stages — designing the process on sound science, qualifying that it performs as intended at scale, and then verifying continuously that it stays in control over its entire commercial life. Validation is a state the process maintains, not a certificate it earns once.",
      ),
      para(
        "Continued verification matters as much as the initial exercise. Equipment ages, raw materials vary, seasons change. A process that was validated two years ago is only trustworthy if it is still being watched, with trends analyzed and deviations investigated, today.",
      ),
      heading("Why it matters for trust"),
      para(
        "For a manufacturer asking the region to trust locally made medicines, Quality by Design is more than good engineering — it is the basis of credibility. It lets BPI demonstrate, with evidence rather than assurance, that its processes are understood, controlled, and consistent. That evidence is what convinces regulators to register a product and clinicians to prescribe it. Quality built into the process is quality that can be proven, and proof is what earns trust.",
      ),
      para(
        "In the end, the philosophy comes down to a simple commitment: do not hope the batch is good. Know it is, because you designed it to be. Every patient who receives one of those medicines is, whether they know it or not, relying on exactly that discipline.",
      ),
    ],
  },
  {
    id: "seedPost-caricom-alliance",
    slug: "bpi-joins-caricom-health-manufacturing-alliance",
    title: "BPI Joins CARICOM Health Manufacturing Alliance",
    contentType: "news",
    tags: ["policy", "distribution"],
    coverPhoto: "1486406146926-c627a92ad1ab",
    inlinePhoto: "1551288049-bebda4e38f71",
    daysAgo: 56,
    externalLink: "https://www.barbadospharmainc.org/news",
    excerpt:
      "BPI has joined a regional alliance aiming to coordinate pharmaceutical manufacturing, procurement, and regulation across CARICOM member states.",
    body: (img) => [
      para(
        "Barbados Pharmaceutical Inc. has joined a regional alliance dedicated to building coordinated pharmaceutical manufacturing capacity across CARICOM member states. The alliance brings together manufacturers, health ministries, regulators, and procurement bodies around a shared premise: that the Caribbean's health security is best served by acting as a region rather than as a scattering of small, individually vulnerable markets.",
      ),
      heading("From competition to coordination"),
      para(
        "In a fragmented market, each territory negotiates alone, regulates alone, and stocks alone — and each, individually, is too small to command attention from global suppliers or to justify serious local manufacturing. The alliance's central idea is to replace that fragmentation with coordination, pooling demand and aligning standards so that the region's combined weight becomes an asset rather than its small size remaining a liability.",
      ),
      para(
        "For a manufacturer like BPI, coordination is not charity; it is the precondition for viability. Sterile manufacturing needs volume, and the volume only exists when territories buy together. The alliance is, in effect, the institutional machinery that turns a continent of small markets into one market large enough to sustain an industry.",
      ),
      bodyImage(img, "Delegates meeting around a conference table"),
      heading("What the alliance aims to do"),
      para(
        "The alliance's agenda spans the full chain from policy to patient. Its working groups are tackling the practical obstacles that have long kept regional manufacturing theoretical rather than real — chief among them the patchwork of national regulations that forces a manufacturer to register the same product, separately and slowly, in every single market.",
      ),
      ...bullets([
        "Harmonizing regulatory requirements so one dossier can serve many markets.",
        "Pooling procurement to give local manufacturers viable production volumes.",
        "Mapping the region's manufacturing capabilities and the gaps between them.",
        "Coordinating stockpiles and emergency response for public health crises.",
      ]),
      heading("Regulatory harmonization first"),
      para(
        "If the alliance achieves one thing, regulatory harmonization may be the most consequential. Today, a medicine approved in one Caribbean state must often run the registration gauntlet again, from scratch, in the next. Each duplication adds months and cost, and the cumulative friction is enough to deter manufacturers from bothering with smaller markets at all. A harmonized pathway — where rigorous review in one jurisdiction is recognized by others — would dismantle that barrier without lowering standards.",
      ),
      para(
        "BPI has a direct stake in this. The company's regional ambitions depend on being able to bring a product to market across multiple territories without re-litigating its safety and quality a dozen times over.",
      ),
      quote(
        "No Caribbean state is large enough to build pharmaceutical sovereignty alone. Together, the region is more than large enough.",
      ),
      heading("Turning intent into institutions"),
      para(
        "History offers a sobering reminder here. The region has launched cooperative bodies before, and some have thrived while others faded into well-meaning irrelevance. The deciding factor was rarely the quality of the founding vision; it was whether member states funded the institution, staffed it, and granted it the authority to act. This alliance will face the same test. BPI's view is that the manufacturing it represents gives the effort a concrete anchor — a reason for the institutions to do real work, because there is real production depending on them.",
      ),
      para(
        "Alliances are easy to announce and hard to sustain. The difference lies in whether the shared intent is translated into durable institutions — working groups with real mandates, agreed standards with teeth, and procurement mechanisms that actually pool demand rather than merely promising to. The coming years will test whether this alliance builds that machinery or settles into the familiar pattern of communiqués without follow-through.",
      ),
      para(
        "BPI's interest is in the former, because its regional strategy depends on it. The company intends to contribute not just rhetoric but the practical experience of an operating manufacturer — helping shape standards that are rigorous yet workable, and demonstrating, batch by batch, that the regional ambition rests on something real. Institutions, not announcements, are what will determine whether this moment matters.",
      ),
      heading("Emergency preparedness"),
      para(
        "The alliance also turns toward the next crisis before it arrives. Coordinated stockpiles, shared surge capacity, and pre-agreed protocols for emergencies are all on the agenda — the kind of preparation that is easy to neglect in calm times and impossible to improvise when a hurricane or outbreak strikes. Having regional manufacturing inside that preparedness picture changes what is possible, replacing a desperate scramble for distant supply with the ability to produce closer to home.",
      ),
      para(
        "It is precisely this scenario — the region cut off from global supply at the worst moment — that gives the whole project its urgency.",
      ),
      heading("BPI's role"),
      para(
        "Within the alliance, BPI brings something still rare in the region: an operating, internationally credible manufacturing base. The company has positioned itself as a working proof point that sophisticated pharmaceutical production can happen in the Caribbean and be run by its own people. Membership lets BPI both contribute that experience and help shape the rules and standards under which the region's industry will grow. The alliance is young, and the work ahead is long — but the direction is set, and BPI intends to help lead it.",
      ),
    ],
  },
  {
    id: "seedPost-economics-local-production",
    slug: "economics-of-local-drug-production",
    title: "The Economics of Local Drug Production",
    contentType: "report",
    tags: ["policy", "manufacturing"],
    coverPhoto: "1551076805-e1869033e561",
    inlinePhoto: "1556742049-0cfed4f6a45d",
    daysAgo: 63,
    excerpt:
      "A clear-eyed look at the numbers behind local pharmaceutical manufacturing — the costs, the trade-offs, and the value that conventional accounting misses.",
    body: (img) => [
      para(
        "Any honest case for local pharmaceutical manufacturing has to begin with the uncomfortable part: on a narrow per-unit basis, a small regional factory will rarely beat a global mega-producer on price. Scale is real, and the largest manufacturers operate at volumes a Caribbean facility cannot match. Pretending otherwise does the cause no favours. The serious argument is not that local production is cheaper on a spreadsheet — it is that the spreadsheet measures the wrong things.",
      ),
      heading("What the per-unit price leaves out"),
      para(
        "A unit price captures the cost of making one vial under ideal conditions. It says nothing about the cost of that vial not arriving — the stockout that forces a clinic to turn patients away, the emergency airfreight that costs ten times the ocean rate, the oversized safety stock a fragile supply chain forces you to finance and store. These costs are real, recurring, and entirely invisible to a comparison that looks only at the factory gate.",
      ),
      para(
        "Local production attacks exactly these hidden costs. A short, reliable supply chain needs less buffer stock, suffers fewer emergencies, and rarely leaves a shelf empty. Once those savings enter the calculation, the gap with the distant mega-producer narrows — and for the most supply-fragile products, can close entirely.",
      ),
      bodyImage(img, "Financial analysis and economic charts"),
      heading("The multiplier effect"),
      para(
        "Then there is everything the factory does beyond the medicine itself. A pharmaceutical plant employs skilled people at good wages, buys services and materials from local suppliers, and develops capabilities that spill over into the wider economy. Each of these circulates money and knowledge within the region rather than exporting it. Economists call this the multiplier effect; in plain terms, a dollar spent on a locally made medicine works harder for the local economy than a dollar sent abroad.",
      ),
      ...bullets([
        "Skilled employment that retains talent which might otherwise emigrate.",
        "Demand for local suppliers, logistics, and professional services.",
        "Technical capabilities that transfer to adjacent industries.",
        "Tax revenue and foreign-exchange savings on reduced imports.",
      ]),
      heading("Pricing resilience"),
      para(
        "The hardest value to quantify is also the most important: resilience. What is it worth to know that a supply of essential medicines exists within the region, under regional control, when global markets seize up? The pandemic offered a brutal estimate. Countries without secure supply paid in delayed treatments, in scrambled emergency procurement, and ultimately in lives. Resilience is insurance, and like all insurance its value is invisible until the day you need it — at which point it is the only thing that matters.",
      ),
      para(
        "A mature economic analysis prices that insurance rather than ignoring it. The premium is the modest per-unit difference; the payout is supply that holds when it counts.",
      ),
      quote(
        "Per-unit cost is the price of a medicine on a calm day. Resilience is the price of having it at all on the worst one.",
      ),
      heading("Who decides, and on what basis"),
      para(
        "It is worth being candid that local production is not a panacea, and overselling it would do the cause a disservice. For high-volume commodity drugs where global competition is fierce and supply is robust, importing will often remain the sensible choice. The argument is selective, not universal: build locally where resilience is scarce and the consequences of shortage are severe, and buy globally where the market already works. A strategy that knows the difference is far more credible — and far more durable — than one that treats every medicine as a candidate for localization.",
      ),
      para(
        "Ultimately these decisions sit with governments and regional bodies weighing scarce public resources against competing demands. The purpose of an honest economic analysis is not to make that choice for them but to ensure it is made on real figures — the true cost of dependence included, the value of resilience priced rather than ignored, and the multiplier effects counted rather than assumed away.",
      ),
      para(
        "Framed that way, local production stops looking like an act of economic romanticism and starts looking like what it is: a deliberate, defensible investment in security and capability, with costs and returns that can be laid out and debated. The figures will not always favour local manufacturing for every product. But for the essential, supply-fragile medicines at the heart of BPI's strategy, the case, honestly tallied, is strong.",
      ),
      heading("Getting the strategy right"),
      para(
        "None of this is an argument for manufacturing everything locally at any cost. The economics reward focus: concentrating on essential medicines and supply-fragile dosage forms, pooling regional demand to reach efficient scale, and manufacturing to standards that command international trust. A scattered, subscale attempt to replicate the entire global pharmacopoeia would fail on exactly the cost grounds the skeptics fear. A focused, regionally coordinated strategy will not.",
      ),
      para(
        "The difference between those two outcomes is policy and discipline, not luck. Get the focus right and the economics work; get it wrong and they do not.",
      ),
      heading("A question of values, measured honestly"),
      para(
        "Ultimately the choice to build local manufacturing is a values question backed by honest numbers. It says the region is willing to pay a modest, well-understood premium to control its own supply of medicines, build its own expertise, and never again be left at the back of the global queue. This report's purpose is to make that premium visible and its returns explicit — so the decision is made with clear eyes, on real figures, rather than on either naive optimism or reflexive doubt.",
      ),
    ],
  },
];

const INITIATIVES = [
  {
    id: "seedInit-sovereign-manufacturing",
    slug: "sovereign-manufacturing-initiative",
    title: "Sovereign Manufacturing Initiative",
    subtitle: "Building the Caribbean's own sterile capacity",
    order: 1,
    featured: true,
    hasDetailPage: true,
    coverPhoto: "1581091226825-a6a2a5aee158",
    inlinePhoto: "1581092918056-0c4c3acd3789",
    daysAgo: 5,
    excerpt:
      "Our flagship effort to establish internationally credible sterile manufacturing in Barbados — and to prove the Caribbean can make the medicines it depends on.",
    body: (img) => [
      para(
        "The Sovereign Manufacturing Initiative is the spine that the rest of BPI's work hangs from. Its goal is direct and ambitious: to establish, in Barbados, sterile pharmaceutical manufacturing that meets international standards and serves the wider Caribbean — and in doing so, to prove that the region can make the medicines it has spent decades importing.",
      ),
      heading("The problem we are solving"),
      para(
        "For generations, the Caribbean has sat at the far end of someone else's supply chain. The medicines its clinics depend on are made thousands of miles away, by manufacturers for whom the region is a small and easily deprioritized customer. In ordinary times this is merely inefficient. In a crisis — a pandemic, a hurricane season, a global shortage — it becomes dangerous, as small distant markets are pushed to the back of the queue precisely when supply matters most.",
      ),
      para(
        "Sovereign manufacturing is the structural answer to that vulnerability. Not a stockpile, which eventually runs out, but a standing capability to produce — one that the region itself owns and controls.",
      ),
      bodyImage(img, "Sterile pharmaceutical manufacturing facility"),
      heading("What we are building"),
      para(
        "The initiative centres on a manufacturing base capable of producing sterile injectables and essential generics to the standards that international regulators and regional health systems demand. That means validated cleanrooms, isolator-based filling, rigorous quality control laboratories, and the documented quality systems that let a regulator trust the output without reservation. It is deliberately focused on the categories where local production delivers the most resilience per dollar.",
      ),
      ...bullets([
        "Validated sterile fill-finish capacity for injectable medicines.",
        "Quality control laboratories for release and stability testing.",
        "Quality systems built to international regulatory expectations.",
        "A focused portfolio of essential, supply-fragile medicines.",
      ]),
      heading("Sovereignty means regional"),
      para(
        "A single island is too small to sustain sterile manufacturing on its own demand alone. That is why this initiative is regional in conception, not national. It depends on pooling the needs of multiple Caribbean territories so that a single, well-run facility reaches the volumes that make production economic — and on the harmonized regulation and coordinated procurement that let those territories rely on one another. Sovereignty here is something the region builds together or not at all.",
      ),
      para(
        "BPI's role is to be the working core of that effort: an operating manufacturer that gives the regional ambition a concrete centre of gravity rather than leaving it as a discussion among governments.",
      ),
      quote(
        "Sovereignty is not a stockpile that runs out. It is the standing ability to make what you need, owned and controlled by the people who need it.",
      ),
      heading("Milestones along the way"),
      para(
        "Each milestone also functions as a decision point. Reaching one is an occasion to ask whether the next step still makes sense, whether the market has shifted, and whether resources should be redirected. This is how a long programme avoids the trap of momentum for its own sake — by building in moments to reassess rather than simply pressing forward. The goal is not to complete a fixed checklist but to build genuine capability, and genuine capability sometimes means changing the plan when the evidence says so. That flexibility, paradoxically, is what keeps a long programme on course: a route that can be corrected is far more likely to reach its destination than one held rigidly to a map drawn years before the terrain was fully known.",
      ),
      para(
        "A project this large is only credible if it is broken into milestones that can be seen and checked. The early markers are concrete: cleanrooms qualified, sterile lines validated, first commercial campaigns completed, and products registered across multiple territories. Each is a discrete, verifiable step rather than a vague gesture toward progress, and each builds the evidence base that the next stage depends on.",
      ),
      para(
        "Measuring against these milestones also keeps the initiative honest. Ambition is cheap; demonstrated capability is not. By holding itself to specific, observable achievements, BPI invites scrutiny rather than asking for faith — which is exactly the posture a project asking a region to trust its own medicines should take.",
      ),
      heading("More than vials"),
      para(
        "The initiative produces more than medicine. It builds a pool of skilled pharmaceutical workers in the region, develops supplier relationships and technical capabilities that spill into the wider economy, and demonstrates — to the Caribbean and to itself — that complex, high-value industry can take root here and be run by its own people. Those second-order effects may, over time, prove as valuable as the products themselves.",
      ),
      para(
        "Every operator trained, every process validated, and every regulatory dossier completed is a deposit in a regional bank of expertise that compounds far beyond any single product line.",
      ),
      heading("The long arc"),
      para(
        "This is a long-term undertaking, measured in years and built capability by capability rather than in a single grand opening. The near-term milestones are concrete — validated lines, first commercial campaigns, products registered across multiple markets. The longer arc is a Caribbean that increasingly makes, regulates, and distributes its own essential medicines, and that never again finds itself at the back of the global queue when supply tightens. The Sovereign Manufacturing Initiative is how BPI intends to help get there.",
      ),
    ],
  },
  {
    id: "seedInit-cold-chain-network",
    slug: "caribbean-cold-chain-network",
    title: "Caribbean Cold-Chain Network",
    subtitle: "Keeping medicines viable from factory to clinic",
    order: 2,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1519389950473-47ba0277781c",
    inlinePhoto: "1531973576160-7125cd663d86",
    daysAgo: 12,
    excerpt:
      "A regional initiative to strengthen the temperature-controlled logistics that keep vaccines and biologics viable across dozens of islands.",
    body: (img) => [
      para(
        "Making a medicine is only half the promise; delivering it intact is the other. The Caribbean Cold-Chain Network is BPI's initiative to strengthen the temperature-controlled logistics that carry sensitive medicines — vaccines, biologics, and many injectables — from the factory floor to the clinic shelf without ever straying outside the narrow temperature band that keeps them effective.",
      ),
      heading("Why the cold chain is fragile here"),
      para(
        "The region's geography conspires against the cold chain. Medicines arrive at a port, move to a central warehouse, travel by road to district facilities, and finally reach clinics that may sit at the end of a long, hot drive. Every transfer is a chance for the temperature to drift, and the ambient heat is relentless. Spread that across dozens of islands with varying grid reliability, and the cold chain becomes not one chain but hundreds of small ones, each only as strong as its weakest link.",
      ),
      bodyImage(img, "Refrigerated medical storage and monitoring"),
      heading("What the network builds"),
      para(
        "The initiative invests in the practical machinery of reliability: insulated packaging engineered to hold temperature through power interruptions, data loggers that travel with every sensitive shipment, backup power and solar-assisted refrigeration at storage sites, and the clear procedures that decide what to quarantine and what to release when a reading drifts. None of it is glamorous. All of it is the difference between a medicine that works and a vial of expensive, useless liquid.",
      ),
      ...bullets([
        "Continuous data loggers on every temperature-sensitive shipment.",
        "Phase-change packaging that holds the cold band through outages.",
        "Backup and solar-assisted refrigeration at key storage sites.",
        "Trained staff and simple procedures for handling excursions.",
      ]),
      heading("From detection to prediction"),
      para(
        "The network's ambition is to move beyond simply detecting temperature failures toward anticipating them. Real-time telemetry lets a logistics team watch a shipment as it moves and intervene before a drift becomes a spoiled batch. Paired with demand forecasting, inventory can be positioned closer to where it will be needed, cutting both stockouts and the waste of expired product. The cold chain becomes a managed system rather than a series of hopeful handoffs.",
      ),
      para(
        "Visibility is the foundation. You cannot manage what you cannot see, and the first task of the network is to make the temperature history of every shipment legible, recorded, and reviewed.",
      ),
      quote(
        "The cold chain is the part of medicine no patient ever sees, and the part that quietly decides whether their medicine works at all.",
      ),
      heading("Strength through standards"),
      para(
        "Shared standards have a second, subtler benefit: they make the whole network legible to outsiders. A health ministry, a regulator, or a donor can look at a standardized chain and understand exactly how a product is protected from factory to clinic. That legibility builds confidence, and confidence is what unlocks the partnerships and funding the network needs to grow. A patchwork of incompatible local practices, by contrast, is opaque and hard to trust — and trust, here as everywhere in medicine, is the currency that matters most.",
      ),
      para(
        "A network is only as reliable as its weakest handover, which is why shared standards matter as much as equipment. When every participant follows the same procedures for packing, monitoring, and accepting shipments, a product can move across organizational and territorial boundaries without losing the chain of assurance. Standardization turns a patchwork of individual efforts into a single dependable system.",
      ),
      para(
        "Those standards also make improvement measurable. With consistent monitoring across the network, excursions can be analyzed, root causes identified, and weak points strengthened deliberately rather than anecdotally. The network thus gets better over time not by chance but by design — each problem surfaced becoming the basis for the next improvement.",
      ),
      heading("People hold the chain together"),
      para(
        "As with everything in pharmaceuticals, technology is only half the answer. A data logger is useless if no one reads it; a backup generator is useless if no one tests it. The most common cause of spoilage is not exotic equipment failure but a fridge left open or a shipment left on a hot dock. The network therefore invests as heavily in training and accountability as in hardware, because the chain holds only if every person who touches it understands their part.",
      ),
      para(
        "Procedures are designed to be followed correctly at the end of a long shift, not just to look rigorous on paper. Simplicity, here, is a safety feature.",
      ),
      heading("Why it matters"),
      para(
        "A dependable cold chain quietly expands what the region's health systems can do — making ambitious vaccination campaigns feasible, letting clinics stock biologics that were previously too risky to handle, and cutting the financial bleed of expired stock. It is the indispensable partner to local manufacturing: a factory and a distribution network are two halves of one promise, and the Caribbean Cold-Chain Network exists to make sure the second half is as strong as the first.",
      ),
      para(
        "The reward, when it all works, is simple and profound: when a patient needs a medicine, it is there — and it works.",
      ),
    ],
  },
  {
    id: "seedInit-generic-access",
    slug: "generic-medicines-access-program",
    title: "Generic Medicines Access Program",
    subtitle: "Affordable essentials, made to international standards",
    order: 3,
    featured: true,
    hasDetailPage: true,
    coverPhoto: "1587854692152-cbe660dbde88",
    inlinePhoto: "1628595351029-c2bf17511435",
    daysAgo: 18,
    excerpt:
      "Expanding access to affordable, high-quality generic medicines across the region — proving that 'affordable' and 'world-class' belong in the same sentence.",
    body: (img) => [
      para(
        "Generic medicines are one of healthcare's great equalizers: the same therapeutic benefit as a brand-name drug, at a fraction of the cost. The Generic Medicines Access Program is BPI's commitment to making those affordable essentials abundantly available across the Caribbean — and to dismantling the false idea that locally made and world-class cannot describe the same product.",
      ),
      heading("Why generics matter most here"),
      para(
        "In health systems with constrained budgets, the price of medicine is not an abstraction — it directly determines how many patients can be treated. Every dollar saved on a generic is a dollar available for another patient, another clinic, another course of treatment. Affordable generics are therefore not a budget compromise; they are the mechanism through which a public health system stretches finite resources to cover as many people as possible.",
      ),
      para(
        "When those generics must be imported through long and fragile supply chains, however, their affordability is perpetually at risk from shortages, currency swings, and the simple indifference of distant suppliers. Producing them regionally stabilizes both the price and the supply.",
      ),
      bodyImage(img, "Generic medicines and pharmaceutical tablets"),
      heading("Quality is non-negotiable"),
      para(
        "The program rests on a principle that BPI treats as absolute: affordability can never come at the expense of quality. Every generic the company produces must demonstrate bioequivalence to its reference product — proving, through rigorous clinical and analytical evidence, that it behaves the same way in the body — and must be manufactured under the same quality systems as any premium product. A cheaper price tag reflects a leaner supply chain and the economics of generics, never a lower standard.",
      ),
      ...bullets([
        "Bioequivalence demonstrated against the reference product.",
        "Manufactured under international-standard quality systems.",
        "Independent quality control testing before any batch is released.",
        "Full regulatory registration in each market served.",
      ]),
      heading("Focused on essentials"),
      para(
        "The program concentrates on the essential medicines that health systems cannot function without — the everyday drugs whose absence causes the most immediate harm. These are also, often, the products most exposed to global shortages, which makes local production doubly valuable: it lowers the price and secures the supply at the same time. Strategic focus, rather than an attempt to replicate the entire pharmacopoeia, is what makes the economics work.",
      ),
      para(
        "By pooling the demand of multiple territories, the program reaches the volumes that make affordable local production viable. No single market is large enough on its own; the region, acting together, is.",
      ),
      quote(
        "Affordable and world-class are not opposites. A well-made generic is proof that they belong in the same sentence.",
      ),
      heading("Affordability that lasts"),
      para(
        "Sustained affordability also depends on volume, which is why the program is inseparable from the broader push for regional cooperation. A generic made at scale for many territories can be priced far lower than one made in small batches for a single market. Pooling demand is therefore not just an efficiency; it is the mechanism that makes low prices possible in the first place. Every territory that joins strengthens the economics for all the others — a virtuous circle that turns regional solidarity directly into cheaper medicine at the pharmacy counter.",
      ),
      para(
        "A low launch price means little if it cannot be sustained. The program is built for durability: regional production that insulates prices from currency swings and distant shortages, efficient processes that keep costs genuinely low rather than temporarily subsidized, and supply reliability that prevents the scarcity-driven price spikes which so often punish patients. Affordability, to be real, has to hold year after year.",
      ),
      para(
        "That durability is what distinguishes a structural solution from a gesture. Donated or discounted medicines can relieve a moment; a standing capacity to produce essentials affordably changes the baseline permanently. The Generic Medicines Access Program aims squarely at the second kind of impact — lasting access built into the supply chain rather than dependent on anyone's continued goodwill.",
      ),
      heading("Access as the real goal"),
      para(
        "Producing affordable medicines is only half the mission; getting them to patients is the other. The program works hand in hand with regional procurement bodies and the cold-chain and distribution networks that carry products the last mile. A cheap medicine sitting in a warehouse helps no one; the measure of success is the medicine in the patient's hand, at a price their health system can sustain.",
      ),
      para(
        "That end-to-end view — from formulation through manufacturing, registration, distribution, and finally the pharmacy counter — is what separates a genuine access program from a mere production line.",
      ),
      heading("The bigger picture"),
      para(
        "The Generic Medicines Access Program is where BPI's manufacturing capability meets its social purpose most directly. Every affordable, high-quality generic it puts into circulation widens access to treatment, eases the strain on public health budgets, and demonstrates that the region can supply its own essentials without sacrificing standards. It is, in the most practical sense, what all the investment in sterile suites and quality systems is ultimately for.",
      ),
      para(
        "Affordable medicine, made well and made nearby, is not a lesser version of healthcare. For millions of people, it is the version that makes healthcare possible at all.",
      ),
    ],
  },
  {
    id: "seedInit-talent-pipeline",
    slug: "pharmaceutical-talent-pipeline",
    title: "Pharmaceutical Talent Pipeline",
    subtitle: "Growing the scientists and technicians the region needs",
    order: 4,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1556761175-b413da4baf72",
    inlinePhoto: "1497366216548-37526070297c",
    daysAgo: 25,
    excerpt:
      "An initiative to develop the chemists, microbiologists, engineers, and technicians a regional pharmaceutical industry depends on — and to keep that talent at home.",
    body: (img) => [
      para(
        "Equipment can be ordered and delivered in weeks. The expertise to run it takes years to grow. The Pharmaceutical Talent Pipeline is BPI's initiative to confront that asymmetry head-on, developing the chemists, microbiologists, engineers, and technicians that a regional pharmaceutical industry cannot exist without — and creating reasons for that talent to build its career in the Caribbean rather than abroad.",
      ),
      heading("The constraint that matters most"),
      para(
        "Across every conversation about regional manufacturing, one constraint surfaces more than any other: people. Pharmaceutical production demands an unusually broad and deep set of skills, from analytical chemistry and microbiology to process engineering, quality systems, and the hard-to-teach discipline of working cleanly in a sterile environment. These capabilities are scarce everywhere, and especially scarce in a region that has not historically had an industry to develop them.",
      ),
      para(
        "Without a deliberate effort to grow this talent, a young industry is forced to import expertise at great expense or train painstakingly from scratch — and neither builds the durable local capability that makes regional manufacturing worth having in the first place.",
      ),
      bodyImage(img, "Students learning in a laboratory setting"),
      heading("How the pipeline works"),
      para(
        "The initiative engages talent at every stage of its development. It partners with regional universities to align coursework with the realities of modern manufacturing, opens BPI's facilities for internships and placements that put students on real production and quality-control work, and brings working scientists into classrooms to teach the parts of the job that textbooks miss. The aim is graduates who arrive already fluent in the language and habits of the industry.",
      ),
      ...bullets([
        "University partnerships that align curricula with industry practice.",
        "Internships and placements on genuine production and QC work.",
        "In-house training in aseptic technique and quality systems.",
        "Sponsored research projects tied to real company problems.",
      ]),
      heading("Training never stops"),
      para(
        "Recruitment is only the beginning. Pharmaceutical work demands continuous training — in aseptic technique, in quality systems, in the specific processes of each product — and that training is itself a discipline. BPI re-qualifies operators on critical skills, rehearses interventions until the motions are deliberate and economical, and treats the development of its people as an ongoing investment rather than a one-time onboarding cost. The result is a workforce that grows more capable every year.",
      ),
      para(
        "Every skilled person developed this way carries their knowledge into the next line, the next facility, and the next generation of trainees. Expertise, once seeded, compounds.",
      ),
      quote(
        "The most important thing we are building is not a product line. It is a generation of people who know how to make medicines, and who chose to do it here.",
      ),
      heading("Careers, not just jobs"),
      para(
        "The initiative also looks beyond BPI's own walls. The skills it develops — in chemistry, engineering, quality, and regulation — are valuable across the wider economy, and some who train here will move into other industries, government, or academia. That mobility is not a loss but a contribution: it spreads pharmaceutical-grade discipline and technical capability through the region. A talent pipeline that enriches the whole economy, not just one company, is exactly the kind of public good a young industry should aspire to create.",
      ),
      para(
        "The pipeline is designed to offer careers rather than mere employment. A technician who joins as a trainee should be able to see a path toward senior operator, supervisor, quality specialist, or scientist — with the training and mentorship to make that progression real. People invest their futures in industries that offer a future, and a credible ladder of advancement is what turns a job into a reason to stay.",
      ),
      para(
        "That progression also deepens the region's capability over time. As individuals advance, they accumulate the hard-won judgment that no course can teach, and they become the mentors and leaders who develop the next generation. A pipeline that grows people into senior roles is, in effect, building the region's future technical leadership from within.",
      ),
      heading("Reversing the brain drain"),
      para(
        "Small economies suffer a stubborn pattern: their brightest graduates leave, drawn abroad by opportunities home cannot match. A credible, ambitious local industry is one of the few forces that can reverse it. When a chemistry or engineering graduate can find challenging, well-paid, internationally relevant work without emigrating, the calculus changes — talent that would have left, stays, and talent that already left sometimes returns. Each retained scientist strengthens the foundation for whatever the region builds next.",
      ),
      para(
        "That retention is a form of development in its own right, and arguably the most lasting one the initiative produces.",
      ),
      heading("A deliberate long game"),
      para(
        "The Pharmaceutical Talent Pipeline pays off in years, not quarters. It is a deliberate long game, premised on the conviction that the binding constraint on regional industry is human capability, and that human capability is grown rather than bought. BPI is investing accordingly — in classrooms, internships, and the slow, patient work of turning bright students into the scientists and technicians a sovereign pharmaceutical industry depends on. It is, quite literally, an investment in the people who will run the region's future factories.",
      ),
    ],
  },
  {
    id: "seedInit-regulatory-harmonization",
    slug: "regional-regulatory-harmonization",
    title: "Regional Regulatory Harmonization",
    subtitle: "One rigorous review, recognized across the region",
    order: 5,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1486406146926-c627a92ad1ab",
    inlinePhoto: "1454165804606-c3d57bc86b40",
    daysAgo: 31,
    excerpt:
      "Working toward a harmonized regulatory pathway so a medicine reviewed rigorously once can reach patients across the whole region — without lowering standards.",
    body: (img) => [
      para(
        "One of the quietest but most powerful obstacles to regional pharmaceutical supply is regulatory fragmentation. A medicine approved in one Caribbean territory must often run the registration gauntlet again, from scratch, in the next — and the next. The Regional Regulatory Harmonization initiative is BPI's effort, alongside regional partners, to replace that costly duplication with a pathway where one rigorous review can be recognized across many markets.",
      ),
      heading("The cost of doing it many times over"),
      para(
        "Registering a medicine is a slow, evidence-heavy process, and rightly so — it is how a regulator protects the public. But when that same process must be repeated in every small market, each with its own forms, timelines, and idiosyncrasies, the cumulative friction becomes enormous. Months stack on months; costs multiply; and manufacturers, weighing the effort against the size of each small market, often simply decline to bother with the smaller ones at all.",
      ),
      para(
        "The patients in those overlooked markets pay the price, in narrower choice and more frequent shortages. Fragmented regulation, however well-intentioned in each jurisdiction, adds up to a region that is harder and less attractive to supply.",
      ),
      bodyImage(img, "Regulatory documents and compliance review"),
      heading("Harmonization, not deregulation"),
      para(
        "It is essential to be precise about what this initiative is and is not. Harmonization does not mean lowering standards or waving products through. It means agreeing on common, rigorous requirements and building mutual recognition, so that a thorough review conducted in one jurisdiction can be trusted and relied upon by others rather than pointlessly repeated. The bar stays high; it simply stops being cleared a dozen separate times.",
      ),
      ...bullets([
        "Common technical requirements aligned to international standards.",
        "Mutual recognition of rigorous reviews between jurisdictions.",
        "A shared dossier format accepted across participating markets.",
        "Coordinated post-market safety monitoring across the region.",
      ]),
      heading("Why it unlocks everything else"),
      para(
        "Regulatory harmonization is the keystone that makes the rest of regional manufacturing viable. Local production only pays off at scale, and scale only exists when a product can move freely across the region's combined market. As long as each border means starting registration over, that combined market remains theoretical. Harmonization turns it into something real — a single market large enough to justify the investment in local manufacturing.",
      ),
      para(
        "For BPI specifically, it is the difference between a product that can reach patients across the Caribbean and one trapped, by paperwork, in a handful of territories.",
      ),
      quote(
        "Harmonization is not about lowering the bar. It is about clearing the same high bar once, instead of a dozen times over.",
      ),
      heading("Trust between regulators"),
      para(
        "Building this trust often starts small, with joint training, shared inspections, and the gradual exchange of information that lets regulators see one another work. Each successful collaboration makes the next a little easier, until reliance on a partner's review feels less like a leap of faith and more like ordinary practice. It is slow, and it cannot be rushed by decree — trust earned through demonstrated competence is the only kind that lasts. But once established, it becomes one of the region's most valuable and durable regulatory assets. Unlike a building or a piece of equipment, it does not depreciate; handled well, the trust between the region's regulators only deepens with each year and each successful collaboration that passes.",
      ),
      para(
        "At its core, harmonization is an exercise in building trust between regulators. For one jurisdiction to rely on another's review, it must have confidence in that review's rigour — in the competence, independence, and standards of the body that conducted it. Building that mutual confidence is slow, relationship-driven work, and it is the real substance beneath the technical machinery of shared dossiers and common requirements.",
      ),
      para(
        "Where that trust takes hold, the payoff compounds. Regulators can specialize, share workloads, and learn from one another rather than each duplicating the same scrutiny in isolation. A region whose regulators trust one another is not only more efficient but more capable — better able, collectively, to oversee the safety of the medicines its people depend on.",
      ),
      heading("Safety after approval, too"),
      para(
        "Harmonization extends beyond the moment of approval. Coordinated post-market surveillance — sharing safety signals and adverse-event data across borders — lets the region spot and respond to problems faster than any single small market could alone. A safety signal that might be invisible in one territory's limited data becomes clear when the region's information is pooled. In this way, harmonization can make regional regulation not just more efficient but genuinely more protective.",
      ),
      para(
        "Stronger collective oversight is one of the underappreciated benefits of acting as a region rather than as a scattering of isolated regulators.",
      ),
      heading("Patient work, lasting payoff"),
      para(
        "Building harmonized regulation is slow, institutional work — aligning requirements, negotiating recognition, and building the trust that lets jurisdictions rely on one another's judgment. It lacks the visible drama of a new factory or a product launch. But it may ultimately matter more, because it is the framework within which all of those things become possible at regional scale. BPI is committed to this unglamorous, foundational effort precisely because so much else depends on it.",
      ),
    ],
  },
  {
    id: "seedInit-green-pharma",
    slug: "green-pharma-sustainable-production",
    title: "Green Pharma & Sustainable Production",
    subtitle: "Manufacturing responsibly on a small island",
    order: 6,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1473341304170-971dccb5ac1e",
    inlinePhoto: "1497215728101-856f4ea42174",
    daysAgo: 38,
    excerpt:
      "An initiative to reduce the water, energy, and waste footprint of pharmaceutical manufacturing — because building this industry responsibly is the only way worth doing it.",
    body: (img) => [
      para(
        "Pharmaceutical manufacturing is resource-hungry by nature, and Barbados is a small island with finite water and a grid still working to free itself from imported fuel. The Green Pharma & Sustainable Production initiative is BPI's commitment to building this industry in a way the island can actually sustain — reducing the water, energy, and waste footprint of every medicine made, not as an afterthought but as a design principle.",
      ),
      heading("Why this is not optional here"),
      para(
        "On a small island, the environmental cost of industry is not abstract or distant — it is local and immediate. Water drawn for manufacturing is water unavailable elsewhere; power burned is fuel imported at cost and carbon; waste generated must be handled within a confined geography. Building a pharmaceutical industry responsibly is therefore not a public-relations gesture but a basic condition of being allowed to operate at all, and of leaving the island better able to support the next industry rather than worse.",
      ),
      bodyImage(img, "Renewable energy and sustainable operations"),
      heading("Water, the island's tightest constraint"),
      para(
        "Barbados is classified as a water-scarce country, and pharmaceutical-grade water is among the most demanding utilities a facility produces. The initiative engineers recovery and reuse into water systems wherever validation allows, recovers reverse-osmosis reject water for non-product uses, and meters consumption per batch so efficiency gains are visible and accountable rather than vague. Reducing the water intensity of each unit produced is treated as both an environmental duty and a precondition of responsible operation.",
      ),
      ...bullets([
        "Per-batch water consumption tracked as a core operating metric.",
        "Reverse-osmosis reject water recovered for non-product uses.",
        "Closed-loop cooling to minimize fresh-water draw.",
        "Network-wide metering and leak detection.",
      ]),
      heading("Energy and the grid"),
      para(
        "Cleanrooms never sleep — the air-handling systems that keep manufacturing sterile run continuously, making energy the largest environmental lever the initiative can pull. The approach works on two fronts at once: cutting demand through better controls and heat recovery, and greening supply through on-site solar generation and participation in the island's broader transition to renewable power. Every kilowatt-hour avoided or decarbonized lowers both the footprint and the exposure to volatile fuel prices.",
      ),
      para(
        "The initiative is candid that this is a journey rather than a destination. Current renewable share is a starting point, with explicit targets to raise it year over year and transparent reporting on progress, including where it falls short.",
      ),
      quote(
        "Sustainability on a small island is concrete: whether the water you use and the power you burn leave the place stronger, or weaker, than you found it.",
      ),
      heading("Designing it in from the start"),
      para(
        "This early discipline pays a financial dividend as well as an environmental one. Water recovery, energy efficiency, and waste reduction all lower operating costs over a facility's lifetime, which means the responsible choice and the economical choice frequently coincide. Framing sustainability as a cost rather than a saving is one of the persistent errors in industrial planning. Designed in from the start, environmental efficiency is not a burden the business carries but an advantage it compounds, year after year, for as long as the facility runs.",
      ),
      para(
        "The cheapest and most effective sustainability gains are the ones designed into a facility before it is built, not retrofitted afterward. Equipment choices, water-system architecture, energy controls, and waste handling are all far easier to optimize on the drawing board than to correct once concrete is poured. Building a new industry offers a rare chance to embed efficiency from the foundation up.",
      ),
      para(
        "BPI intends to use that chance. Treating sustainability as a design parameter rather than a later obligation means each new capability is shaped, from its inception, to use less water, less energy, and fewer materials. The discipline is to ask the environmental question early and often — at the moment of design, when the answer is still cheap to act on.",
      ),
      heading("Waste and materials"),
      para(
        "Pharmaceutical operations generate several waste streams — solvents, packaging, single-use components, and the byproducts of cleaning and testing. The initiative follows the familiar hierarchy in earnest: reduce first, then reuse, then recycle, and only then dispose, with hazardous streams segregated and handled through licensed pathways. It also confronts honestly the genuine trade-offs, such as single-use technologies that improve sterility assurance and cut water use but generate plastic waste, reporting both sides rather than hiding behind the flattering framing.",
      ),
      para(
        "Packaging is a particular focus: designing it to use less material without compromising the protection a medicine requires is an ongoing engineering challenge the initiative takes seriously.",
      ),
      heading("Sustainability is also social"),
      para(
        "A sustainable enterprise is one that strengthens the community hosting it. Beyond its environmental footprint, the initiative counts the skilled jobs created, the talent retained in the region, and the spending directed to local suppliers as part of what makes BPI's presence sustainable in the fullest sense. The medicines matter; so does the livelihood, expertise, and environmental stewardship built while making them. Doing this responsibly is, in the end, the only way of doing it that is worth the effort at all.",
      ),
      para(
        "The targets the initiative sets — falling water and energy intensity, a rising renewable share, expanded local procurement — are commitments BPI intends to be measured against, year after year.",
      ),
    ],
  },
  {
    id: "seedInit-clinical-research",
    slug: "clinical-research-partnerships",
    title: "Clinical Research Partnerships",
    subtitle: "Building regional capacity for rigorous studies",
    order: 7,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1582719478250-c89cae4dc85b",
    inlinePhoto: "1530026405186-ed1f139313f8",
    daysAgo: 44,
    excerpt:
      "Developing the region's capacity to conduct rigorous, ethical clinical research — from bioequivalence studies to partnerships with regional health institutions.",
    body: (img) => [
      para(
        "A pharmaceutical industry needs more than the ability to manufacture; it needs the ability to generate evidence. The Clinical Research Partnerships initiative is BPI's effort to build, within the region, the capacity to conduct rigorous and ethical clinical studies — the kind of independent evidence that underwrites trust in every medicine the company makes.",
      ),
      heading("Why evidence is the foundation"),
      para(
        "Trust in a medicine ultimately rests on evidence. For the generics that form the backbone of BPI's portfolio, the critical evidence is bioequivalence — the demonstration, through carefully designed human studies, that a generic behaves in the body just as its reference product does. This evidence is not optional polish; it is the objective, internationally recognized standard that lets a regulator register a product and a clinician prescribe it with confidence.",
      ),
      para(
        "Historically, much of this research has had to be conducted abroad, at significant cost and with little benefit retained in the region. Building the capacity to do it here keeps both the expertise and the economic value at home.",
      ),
      bodyImage(img, "Clinical research and laboratory analysis"),
      heading("What the partnerships build"),
      para(
        "The initiative works with regional universities, hospitals, and health institutions to develop the infrastructure and expertise that rigorous clinical research demands — trained investigators, ethical review capacity, the analytical laboratories that measure drug concentrations, and the data-management discipline that turns a study into credible evidence. Each partnership both serves BPI's immediate needs and leaves behind capability that the wider regional research community can draw on.",
      ),
      ...bullets([
        "Bioequivalence studies designed and analyzed to international standards.",
        "Partnerships with regional hospitals and universities.",
        "Investment in ethical review and good-clinical-practice capacity.",
        "Analytical laboratories for pharmacokinetic measurement.",
      ]),
      heading("Ethics at the centre"),
      para(
        "Clinical research involves human volunteers, and that places ethics at the absolute centre of the work. The initiative is built around the principles of good clinical practice: informed consent, independent ethical review, participant safety, and scientific rigour that ensures studies are worth conducting in the first place. Building research capacity means building ethical capacity in equal measure — the review boards, the oversight, and the culture that protect the people who make the evidence possible.",
      ),
      para(
        "Cutting corners here is not merely wrong; it is self-defeating, because evidence produced without integrity is evidence no regulator or clinician will trust.",
      ),
      quote(
        "Evidence is what turns a manufactured product into a trusted medicine. Building the capacity to generate it, ethically and rigorously, is building the foundation of trust itself.",
      ),
      heading("Evidence that travels"),
      para(
        "There is a national-pride dimension worth acknowledging too. For a region long treated as a consumer of others' science, the ability to generate world-class clinical evidence is a quiet assertion of capability — proof that the Caribbean can not only make medicines but rigorously evaluate them. That confidence matters, both for the scientists who build their careers here and for the institutions that host them. Evidence made in the region, trusted everywhere, is as much a statement about what the Caribbean can do as it is a technical deliverable. Each rigorous study completed here chips away at an old and limiting assumption — that serious pharmaceutical science happens only somewhere else — and replaces it with proof to the contrary.",
      ),
      para(
        "Evidence is only valuable if others trust it, which is why the initiative insists on international standards rather than local convenience. A bioequivalence study conducted to globally recognized norms can support registration not just at home but abroad, opening markets and building credibility that a parochially designed study never could. Rigour is what lets evidence cross borders.",
      ),
      para(
        "Building that capability regionally also keeps the expertise where it is needed. Each study designed, conducted, and analyzed in the Caribbean develops investigators, strengthens institutions, and deepens a base of research skill that compounds. Over time the region gains not just the evidence for its own medicines but a genuine voice in the science behind them.",
      ),
      heading("A research culture that compounds"),
      para(
        "Beyond any single study, the initiative seeds something larger: a regional research culture oriented toward pharmaceutical science. Trained investigators, functioning ethics committees, and capable laboratories are durable assets that outlast any individual project. Over time they form a base of expertise and curiosity that compounds — attracting further research, developing more scientists, and giving the region a genuine voice in the science behind its own medicines.",
      ),
      para(
        "Student and graduate research projects tied to real questions are a deliberate part of this, giving emerging scientists the rare experience of rigorous inquiry with a tangible endpoint.",
      ),
      heading("Evidence made here"),
      para(
        "The Clinical Research Partnerships initiative reflects a simple conviction: a region that aspires to make its own medicines should also be able to generate the evidence that those medicines deserve. Doing so keeps expertise and economic value in the Caribbean, strengthens the credibility of locally made products, and builds a research capacity that serves the region's health far beyond BPI's own portfolio. Evidence made here, to standards that travel anywhere, is the goal.",
      ),
      para(
        "It is the natural complement to local manufacturing — the part that ensures the region not only makes its medicines, but understands and stands behind them.",
      ),
    ],
  },
  {
    id: "seedInit-api-localization",
    slug: "api-localization",
    title: "Active Pharmaceutical Ingredient (API) Localization",
    subtitle: "Securing the supply behind the supply",
    order: 8,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1559757148-5c350d0d3c56",
    inlinePhoto: "1565008447742-97f6f38c985c",
    daysAgo: 51,
    excerpt:
      "Exploring how the region can reduce its dependence on distant suppliers of active pharmaceutical ingredients — the raw material behind every finished medicine.",
    body: (img) => [
      para(
        "Behind every finished medicine lies a more fundamental supply chain: the one for active pharmaceutical ingredients, the chemical substances that actually do the therapeutic work. The API Localization initiative confronts an often-overlooked vulnerability — that even a region able to manufacture finished medicines remains dependent if the active ingredients themselves all come from a handful of distant suppliers.",
      ),
      heading("The supply behind the supply"),
      para(
        "Global API production is remarkably concentrated, with a small number of countries supplying the active ingredients for much of the world's medicine. That concentration creates a hidden single point of failure: a disruption at the API level — a factory shutdown, an export restriction, a quality crisis — can ripple outward and starve finished-medicine manufacturers everywhere of their essential raw material. A region that imports all of its APIs has, in effect, outsourced the deepest layer of its drug security.",
      ),
      para(
        "Building finished-dose manufacturing without considering API supply addresses the visible half of the problem while leaving the foundation exposed. True resilience means looking one layer deeper.",
      ),
      bodyImage(img, "Chemical synthesis and ingredient production"),
      heading("A realistic ambition"),
      para(
        "API manufacturing is among the most complex and capital-intensive activities in the entire pharmaceutical chain, demanding sophisticated chemistry, significant scale, and substantial environmental controls. The initiative is therefore deliberately realistic. It does not propose to localize every ingredient — that would be neither economic nor sensible. Instead, it focuses on identifying where regional or near-regional API production could most meaningfully reduce the vulnerability of the most essential medicines.",
      ),
      ...bullets([
        "Mapping which essential medicines are most exposed to API concentration.",
        "Assessing the feasibility of regional or near-regional API production.",
        "Diversifying suppliers to reduce single-source dependence.",
        "Building strategic relationships and buffer stocks for critical inputs.",
      ]),
      heading("Diversification first"),
      para(
        "Before localization comes diversification — a faster, lower-cost first line of defence. Even where producing an API regionally is not yet feasible, dependence can be reduced by qualifying multiple suppliers across different countries, holding strategic buffer stocks of the most critical inputs, and building relationships that make the region a priority rather than an afterthought when supply tightens. These measures buy resilience while the longer-term feasibility of local production is assessed.",
      ),
      para(
        "Diversification and localization are complementary stages of the same strategy: reduce the risk now with multiple sources, and reduce it structurally over time where local production proves viable.",
      ),
      quote(
        "You have not secured your medicine supply until you have secured the supply behind it. The active ingredient is where resilience truly begins or ends.",
      ),
      heading("A staged, honest path"),
      para(
        "Realism about timelines is part of the honesty. Local API production, where it makes sense at all, is a long-horizon prospect requiring sustained investment, technical partnerships, and careful environmental planning. The initiative does not pretend otherwise. What it can deliver in the near term — visibility into vulnerabilities and a more diversified, buffered supply — is valuable on its own and lays the groundwork for the harder steps later. Promising overnight self-sufficiency would be both dishonest and counterproductive; steady, staged progress is the credible path.",
      ),
      para(
        "The initiative is explicit that localization is a staged journey, not a switch to be thrown. The first stage is visibility — knowing exactly which essential medicines depend on dangerously concentrated API sources. The second is diversification through multiple qualified suppliers and strategic stocks. Only the third, pursued selectively, is local production where the resilience gained genuinely justifies the considerable cost and complexity.",
      ),
      para(
        "Sequencing matters because each stage delivers value on its own. A region that has simply mapped its vulnerabilities and diversified its suppliers is already markedly more secure, even before a single API is made locally. Honest staging avoids both complacency and the opposite error of over-investing in capacity the region does not yet need.",
      ),
      heading("The economic and environmental reckoning"),
      para(
        "API production carries real costs that the initiative weighs honestly. It is capital-intensive, technically demanding, and environmentally significant, with waste and energy footprints that a small island must consider carefully. For these reasons, localization is approached as a selective, evidence-led question rather than a blanket aspiration — pursued only where the resilience gained genuinely justifies the investment and the environmental management can be done responsibly.",
      ),
      para(
        "This sober, case-by-case approach is what distinguishes a serious strategy from a slogan. Not everything should be localized; the work is in identifying precisely what should.",
      ),
      heading("Completing the picture"),
      para(
        "The API Localization initiative completes BPI's view of supply security. Sterile manufacturing, cold-chain logistics, and a credible quality system together secure the finished medicine; attention to active ingredients secures the foundation beneath it. By thinking through the entire chain — from chemical synthesis to the patient's hand — the region can build a resilience that is genuine rather than superficial, and avoid the trap of fortifying the visible parts of the supply chain while leaving its deepest layer exposed.",
      ),
      para(
        "It is the least visible link in the chain, and precisely for that reason one of the most important to get right.",
      ),
    ],
  },
  {
    id: "seedInit-emergency-preparedness",
    slug: "public-health-emergency-preparedness",
    title: "Public Health Emergency Preparedness",
    subtitle: "Ready before the next crisis arrives",
    order: 9,
    featured: false,
    hasDetailPage: true,
    coverPhoto: "1504384308090-c894fdcc538d",
    inlinePhoto: "1551288049-bebda4e38f71",
    daysAgo: 58,
    excerpt:
      "Building the manufacturing, stockpile, and coordination capacity to respond when the region faces a pandemic, hurricane, or sudden supply shock.",
    body: (img) => [
      para(
        "Crises do not announce themselves in advance. A pandemic, a hurricane season, a sudden global supply shock — each arrives with little warning and tests, immediately and unforgivingly, whether a region prepared for it in the calm beforehand. The Public Health Emergency Preparedness initiative is BPI's commitment to building the manufacturing, stockpile, and coordination capacity that lets the Caribbean respond from a position of readiness rather than scramble from one of dependence.",
      ),
      heading("The lesson the region already learned"),
      para(
        "The pandemic years delivered a hard education in what dependence costs. When global supply tightened, large and wealthy markets secured what they needed first, and small distant ones waited — for medicines, for equipment, for the basic supplies that sustain a health system through a crisis. The vulnerability was not hypothetical; it was lived, and its lesson was unambiguous: a region that cannot produce or stockpile its own essentials is a region at the mercy of others precisely when mercy is in shortest supply.",
      ),
      para(
        "Preparedness is the deliberate refusal to relearn that lesson the hard way. It is the work done in quiet times that determines how a crisis unfolds when the quiet ends.",
      ),
      bodyImage(img, "Emergency medical supplies and logistics"),
      heading("What preparedness requires"),
      para(
        "Genuine preparedness is built from several reinforcing capabilities. It means having local manufacturing that can be redirected toward critical products when imports fail; maintaining strategic stockpiles of essential medicines and supplies, rotated so they never expire on the shelf; and establishing, in advance, the coordination protocols that let territories pool resources and act together when a crisis hits. Each element is far easier to build before an emergency than to improvise during one.",
      ),
      ...bullets([
        "Local manufacturing capacity that can pivot to critical products.",
        "Rotated strategic stockpiles of essential medicines and supplies.",
        "Pre-agreed coordination protocols across territories.",
        "Surge plans for production, distribution, and cold chain.",
      ]),
      heading("Why local manufacturing changes the equation"),
      para(
        "Local manufacturing transforms what preparedness can mean. A stockpile, however well-managed, is finite — it depletes, and once exhausted it leaves the region exposed again. A standing ability to produce is renewable: it can be redirected, scaled, and sustained through a prolonged crisis in ways no warehouse of pre-positioned supplies ever could. This is why the Sovereign Manufacturing Initiative and emergency preparedness are so tightly bound; the factory is, among other things, the region's most durable insurance policy.",
      ),
      para(
        "Stockpiles buy time; manufacturing buys staying power. A serious preparedness strategy needs both, working together.",
      ),
      quote(
        "Preparedness is everything you do in the calm that decides how the storm goes. By the time the crisis arrives, the window to prepare has already closed.",
      ),
      heading("Rehearsal is preparation"),
      para(
        "Rehearsals also build something no plan can capture on paper: the human familiarity that lets people act fast under pressure. When the teams who would respond to a crisis have already worked together in a drill, they know one another's roles, judgment, and contact details before the emergency demands them. That familiarity shaves precious hours off a real response. Preparedness, in the end, is as much about relationships rehearsed as protocols written — and both are built in the calm, long before they are needed.",
      ),
      para(
        "A plan that has never been rehearsed is little more than a hope. Genuine preparedness requires exercising the protocols — simulating a supply shock, testing how stockpiles are released, confirming that surge plans and coordination actually function under pressure. The failures revealed in a drill are gifts; they are the problems found while there is still time, and at no cost, to fix them.",
      ),
      para(
        "This is why preparedness is a practice rather than a document. Stockpiles are rotated, plans are rehearsed, and lessons are folded back into the next iteration. The region that drills in calm weather is the one that responds with competence in the storm — not because it improvises well, but because it has already practised the things that count.",
      ),
      heading("Coordination is half the battle"),
      para(
        "In an emergency, the difference between chaos and competence is often coordination decided in advance. Who holds which stockpile; how shortages are shared; which facility surges which product; how the cold chain is protected when the grid fails — these questions are answered far better in a planning room than in the middle of a hurricane. The initiative therefore invests heavily in the protocols and relationships that let the region act as a coordinated whole when every hour counts.",
      ),
      para(
        "This coordination is most effective at regional scale, where pooled resources and shared plans turn a collection of vulnerable small states into a more resilient collective.",
      ),
      heading("Readiness as a standing commitment"),
      para(
        "Preparedness is not a project that completes; it is a posture that must be maintained. Stockpiles must be rotated, plans rehearsed, and capabilities kept current against threats that themselves keep changing. The Public Health Emergency Preparedness initiative reflects BPI's commitment to that ongoing discipline — to ensuring that when the region next faces a crisis, it meets it with manufacturing, stockpiles, and coordination already in place. The next emergency will come unannounced. The point of this work is to make sure the region is no longer caught unready when it does.",
      ),
    ],
  },
  {
    id: "seedInit-women-in-stem",
    slug: "women-in-stem-at-bpi",
    title: "Women in STEM at BPI",
    subtitle: "Building an industry that reflects the region",
    order: 10,
    featured: true,
    hasDetailPage: true,
    coverPhoto: "1607619056574-7b8d3ee536b2",
    inlinePhoto: "1581094794329-c8112a89af12",
    daysAgo: 66,
    excerpt:
      "Advancing the women scientists, engineers, and leaders building the region's pharmaceutical industry — because the industry should reflect the society it serves.",
    body: (img) => [
      para(
        "An industry is shaped by the people who build it, and the people who build it should reflect the society it serves. Women in STEM at BPI is the company's initiative to advance the women scientists, engineers, technicians, and leaders who are helping to create the region's pharmaceutical industry — ensuring that, as this industry takes root, it does so as one that draws fully on the region's whole pool of talent.",
      ),
      heading("Why representation matters here"),
      para(
        "Pharmaceutical science depends on the broadest possible base of talent, and any industry that overlooks half of its potential workforce is competing with one hand tied behind its back. Beyond the practical logic, there is a question of fairness and of example. A young woman deciding whether to pursue chemistry or engineering is influenced, profoundly, by whether she can see people like herself thriving in those fields. Visible representation is not a soft benefit; it is one of the most powerful forces shaping who enters the pipeline at all.",
      ),
      para(
        "For a new industry being built from the ground up, this is a rare opportunity — the chance to build inclusively from the start, rather than trying to retrofit it onto established and unequal structures years later.",
      ),
      bodyImage(img, "Women scientists working in a laboratory"),
      heading("What the initiative does"),
      para(
        "Women in STEM at BPI works across the full arc of a career. It supports outreach that brings science to girls early, partners with schools and universities to encourage women into relevant fields, ensures fair and unbiased recruitment, and invests in the mentorship and development that help women advance into senior scientific and leadership roles. The aim is not a single gesture but a sustained effort that touches recruitment, retention, and promotion alike.",
      ),
      ...bullets([
        "Outreach that brings science to girls early.",
        "Partnerships encouraging women into STEM fields of study.",
        "Fair, unbiased recruitment and advancement practices.",
        "Mentorship and development toward senior and leadership roles.",
      ]),
      heading("Leadership, not just entry"),
      para(
        "It is not enough to bring women into an industry only to see them plateau below its senior ranks. This initiative pays particular attention to advancement — to ensuring that women move into the scientific leadership, management, and decision-making roles where the industry's direction is actually set. Mentorship, sponsorship, and a deliberate look at who is being developed and promoted are central to making representation real at every level, not just at the entry point.",
      ),
      para(
        "An industry led inclusively makes better decisions and sends a clearer signal to the next generation about what is genuinely possible for them.",
      ),
      quote(
        "An industry built from the ground up has a rare chance: to be inclusive by design, rather than inclusive by belated correction.",
      ),
      heading("Measuring what matters"),
      para(
        "Transparency reinforces the discipline. By reporting its representation figures openly, the initiative invites accountability from the very people it aims to support and from the wider community watching its progress. Published numbers are harder to ignore than private intentions, and they create a healthy pressure to keep improving. The aim is not a single flattering statistic but a sustained trajectory — visible, measured, and honestly reported, including in the years when the numbers reveal how much work still remains to be done.",
      ),
      para(
        "Good intentions are not self-executing, which is why the initiative measures itself. Tracking the share of women in technical and leadership roles, in recruitment pipelines, and in development programs turns aspiration into something accountable. Numbers reveal where progress is real and where it stalls, and they keep the commitment honest in years when it would be easy to coast.",
      ),
      para(
        "Measurement also guards against the quiet plateau, where women enter an industry but rarely rise within it. By watching advancement and not just entry, the initiative can act when the data shows talent getting stuck — adjusting mentorship, sponsorship, and development so that representation becomes real at every level, including the ones where the industry's direction is actually decided.",
      ),
      heading("A signal to the next generation"),
      para(
        "Perhaps the initiative's most lasting effect is the example it sets. Every woman who builds a successful career as a scientist, engineer, or leader at BPI becomes a visible proof point for the girls and young women watching — evidence that these paths are open, achievable, and rewarding. That example feeds back into the pipeline, drawing more women into STEM and, over time, making the industry's inclusivity self-sustaining. Representation, once established, helps create more of itself.",
      ),
      para(
        "This is how a single generation's deliberate effort becomes the next generation's normal.",
      ),
      heading("An industry that reflects its region"),
      para(
        "Women in STEM at BPI rests on a straightforward conviction: the pharmaceutical industry the Caribbean is building should reflect the Caribbean itself, drawing on all of its talent and opening its opportunities to all of its people. Doing so is both the right thing and the smart thing — fairer, and stronger for it. As BPI builds the medicines, the factories, and the expertise of a sovereign regional industry, it is determined to build, alongside them, an industry that genuinely belongs to everyone it serves.",
      ),
    ],
  },
];

// ── build & run ────────────────────────────────────────────────────────────────
const clean = process.argv.includes("--clean");

const allIds = [
  ...TAGS.map((t) => `seedTag-${t.slug}`),
  ...POSTS.map((p) => p.id),
  ...INITIATIVES.map((i) => i.id),
];

const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

async function run() {
  console.log(
    `${clean ? "Cleaning" : "Seeding"} posts + initiatives → project ${projectId}, dataset "${dataset}"\n`,
  );

  if (clean) {
    for (const id of allIds) {
      try {
        await client.delete(id);
      } catch {
        /* ignore missing */
      }
    }
    console.log(`Deleted ${allIds.length} seed documents.`);
    return;
  }

  // 1. Tags
  console.log("Tags:");
  for (const t of TAGS) {
    await client.createOrReplace(tagDoc(t));
    console.log(`  ${t.title}`);
  }

  // 2. Images (covers + inline), de-duped
  const photoIds = new Set();
  for (const d of [...POSTS, ...INITIATIVES]) {
    photoIds.add(d.coverPhoto);
    photoIds.add(d.inlinePhoto);
  }
  console.log(`\nImages (${photoIds.size} unique):`);
  for (const id of photoIds) {
    await uploadImage(id);
  }

  // 3. Posts
  console.log("\nPosts:");
  let minPostWords = Infinity;
  for (const p of POSTS) {
    const coverAsset = assetCache.get(p.coverPhoto);
    const inlineAsset = assetCache.get(p.inlinePhoto);
    const body = p.body(inlineAsset);
    const words = wordsIn(body);
    minPostWords = Math.min(minPostWords, words);
    const doc = {
      _id: p.id,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      excerpt: p.excerpt,
      publishedAt: isoDaysAgo(p.daysAgo),
      contentType: p.contentType,
      tags: (p.tags || []).map(tagRef),
      wideTile: !!p.wideTile,
      coverImage: cover(coverAsset, p.title),
      ...(p.externalLink ? { externalLink: p.externalLink } : {}),
      showInInitiatives: !!p.showInInitiatives,
      ...(p.initiativeEyebrow ? { initiativeEyebrow: p.initiativeEyebrow } : {}),
      ...(p.initiativeTileSize
        ? { initiativeTileSize: p.initiativeTileSize }
        : {}),
      ...(p.initiativeTileAccent ? { initiativeTileAccent: true } : {}),
      body,
    };
    await client.createOrReplace(doc);
    console.log(`  ${p.title}  [${p.contentType}, ${words} words]`);
  }

  // 4. Initiatives
  console.log("\nInitiatives:");
  let minInitWords = Infinity;
  for (const it of INITIATIVES) {
    const coverAsset = assetCache.get(it.coverPhoto);
    const inlineAsset = assetCache.get(it.inlinePhoto);
    const body = it.body(inlineAsset);
    const words = wordsIn(body);
    minInitWords = Math.min(minInitWords, words);
    const doc = {
      _id: it.id,
      _type: "initiative",
      title: it.title,
      slug: { _type: "slug", current: it.slug },
      subtitle: it.subtitle,
      excerpt: it.excerpt,
      publishedAt: isoDaysAgo(it.daysAgo),
      order: it.order,
      featured: !!it.featured,
      hasDetailPage: it.hasDetailPage !== false,
      coverImage: cover(coverAsset, it.title),
      ...(it.externalLink ? { externalLink: it.externalLink } : {}),
      body,
    };
    await client.createOrReplace(doc);
    console.log(
      `  ${it.featured ? "★ " : "  "}${it.title}  [${words} words]`,
    );
  }

  console.log(
    `\nDone. ${TAGS.length} tags, ${POSTS.length} posts, ${INITIATIVES.length} initiatives.`,
  );
  console.log(
    `Minimum body length — posts: ${minPostWords} words, initiatives: ${minInitWords} words.`,
  );
  if (minPostWords < 800 || minInitWords < 800) {
    console.warn("WARNING: at least one body is under 800 words.");
  }
}

run().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
