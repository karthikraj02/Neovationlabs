// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
// Product demo recordings shown on /demos. Video and poster assets live in
// client/public/demos and are referenced by absolute path so they resolve
// from any route depth.
export const demos = [
  {
    slug: "cross-camera-face-search",
    title: "Cross-Camera Face Search",
    tagline: "Find one person across every camera at once.",
    discipline: "Computer Vision",
    video: "/demos/face-finder.mp4",
    poster: "/demos/face-finder-poster.jpg",
    width: 1280,
    height: 808,
    duration: "0:40",
    tags: ["Face recognition", "Multi-camera", "Real-time search"],
    summary:
      "Upload one reference photo and every connected camera feed is searched at the same time — the system reports which camera saw the person, when, and with what confidence, instead of a team scrubbing through hours of footage.",
    problem:
      "Buildings, campuses, and retail sites run several cameras covering entrances, hallways, counters, and lots. When something needs review, staff open each feed separately, watch long stretches of video, and search from a vague description. A human reviewer can only watch one feed at a time, so the work gets harder with every camera added.",
    approach:
      'The demo treats "find this person" as a search problem rather than a manual review problem. A reference face becomes a numerical signature, and every feed is matched against it continuously.',
    steps: [
      {
        title: "Enrol a reference photo",
        body: "A single photo of the person you are looking for is all the system needs to start.",
      },
      {
        title: "Encode a faceprint",
        body: "The reference face is converted into a numerical signature representing its facial geometry.",
      },
      {
        title: "Search every feed at once",
        body: "As people appear on each connected camera, their faces are compared against that signature in real time.",
      },
      {
        title: "Report the match",
        body: "On a hit, the system surfaces the camera, timestamp, confidence score, and a snapshot — immediately.",
      },
    ],
    useCases: [
      {
        title: "Security operations",
        body: "Locate a person of interest across a mall, campus, office, or airport without checking each camera by hand.",
      },
      {
        title: "Missing person search",
        body: "Find a lost child, elderly relative, or patient across a large venue's camera network in seconds.",
      },
      {
        title: "Loss prevention",
        body: "Flag a previously identified individual the moment they re-enter any monitored area.",
      },
      {
        title: "Access review",
        body: "Confirm where and when a specific person moved through a monitored space.",
      },
    ],
    differentiator:
      "A single camera watching one door can only tell you that someone matching a description walked through. This correlates identity across multiple independent camera views — answering where a person is across the whole property, not just whether they passed one spot.",
    roadmap: [
      'Plain-language search — describe the person ("red jacket, black backpack") instead of enrolling a photo first.',
      "Full movement paths across a facility over time, rather than isolated per-camera detections.",
      "Search across historical recorded footage, not only live feeds.",
      "Automatic alerting the instant a match occurs, with no operator watching.",
    ],
    responsibleUse: [
      "Only run on camera systems the operator owns or is authorised to monitor.",
      "Post clear notice that facial recognition is in use, in line with local law.",
      "Comply with biometric privacy regulation — several regions require documented consent or a specific lawful basis before facial data is stored or matched.",
      "Keep a human reviewer in the loop: the system is built to flag and assist, never to decide about a person automatically.",
    ],
    note: "Recorded against sample footage for demonstration purposes.",
  },
  {
    slug: "retail-footfall-heatmap",
    title: "Retail Footfall Heatmap",
    tagline: "Turn store cameras into a floor-layout instrument.",
    discipline: "Computer Vision",
    video: "/demos/retail-heatmap.mp4",
    poster: "/demos/retail-heatmap-poster.jpg",
    width: 1600,
    height: 600,
    duration: "0:36",
    tags: ["Footfall analytics", "Density mapping", "RTSP ingest"],
    summary:
      "Standard surveillance feeds become spatial density maps: shopper movement is tracked at floor level and accumulated over time, so managers can see which aisles pull traffic and which sit dead.",
    problem:
      "Store layout decisions are usually made on intuition and till data — neither of which shows where shoppers actually walked, lingered, or never went at all. Dead zones stay invisible, and the value of a promotional endcap is guesswork.",
    approach:
      "Each shopper is localised on the ground plane rather than by bounding-box centre, then splatted into a calibrated density grid with smooth Gaussian decay. The output is a side-by-side view: raw feed on the left, accumulated intelligence on the right.",
    steps: [
      {
        title: "Ingest the feed",
        body: "Reads standard RTSP store cameras at optimised frame intervals for lightweight processing.",
      },
      {
        title: "Ground-plane localisation",
        body: "Pins each shopper's actual standing position on the retail floor, not the centre of a detection box.",
      },
      {
        title: "Gaussian spatial splatting",
        body: "Accumulates density into a calibrated grid with smooth decay, so dwell time and traffic corridors read accurately.",
      },
      {
        title: "Adaptive normalisation",
        body: "Dynamic scaling keeps a brief crowding spike from washing out the historical pattern.",
      },
      {
        title: "Analytics rendering",
        body: "Exports a synchronised side-by-side report with live counts and heatmap overlay embedded.",
      },
    ],
    useCases: [
      {
        title: "Eliminating dead zones",
        body: "Surface the aisles and endcaps shoppers consistently bypass, then redesign flow to route them through.",
      },
      {
        title: "Product placement",
        body: "Move high-margin impulse items directly into the traffic paths the density map proves exist.",
      },
      {
        title: "Promotional effectiveness",
        body: "A/B test seasonal displays by measuring the foot traffic each one actually generated.",
      },
      {
        title: "Retail media proof",
        body: "Give suppliers verifiable shopper-exposure data behind premium shelf placements.",
      },
      {
        title: "Queue management",
        body: "Spot congestion near registers and counters early, and staff against it before wait times build.",
      },
    ],
    differentiator:
      "Instantaneous shopper counts and cumulative footfall are tracked separately, so peak-hour behaviour and long-run traffic patterns can be read independently rather than blurred into one number.",
    note: "Recorded against sample retail footage for demonstration purposes.",
  },
  {
    slug: "offline-document-qa",
    title: "DocQuery — Offline Document Q&A",
    tagline: "Ask questions of sensitive documents without them leaving the machine.",
    discipline: "Generative AI",
    video: "/demos/docquery.mp4",
    poster: "/demos/docquery-poster.jpg",
    width: 1600,
    height: 826,
    duration: "1:04",
    tags: ["Local inference", "Retrieval", "Zero data egress"],
    summary:
      "Drop in a PDF, text, or Markdown file and query it in plain language. Indexing, retrieval, and generation all run locally — nothing is transmitted, so confidential material never reaches a third-party service.",
    problem:
      "The documents most worth querying — contracts, filings, medical records, internal financials — are exactly the ones that cannot be pasted into a hosted assistant. Confidentiality obligations and data-protection rules rule out the usual tooling, so the material gets read manually instead.",
    approach:
      "The whole pipeline runs on the user's own machine with no cloud connectivity. Uploaded files are chunked and indexed locally, and answers are generated against those local chunks.",
    steps: [
      {
        title: "Load a document",
        body: "Drag and drop a PDF, .txt, or .md file straight into the local knowledge base.",
      },
      {
        title: "Index locally",
        body: "The file is chunked and indexed on device — in this recording, a 707-chunk constitution PDF in under 17 seconds.",
      },
      {
        title: "Get suggested questions",
        body: "The content is analysed to generate relevant, clickable starting questions, so exploration begins immediately.",
      },
      {
        title: "Ask in plain language",
        body: "Questions are answered from the indexed document, with processing feedback shown in real time.",
      },
    ],
    useCases: [
      {
        title: "Legal and contract review",
        body: "Analyse confidential agreements, NDAs, and filings without breaching client confidentiality.",
      },
      {
        title: "Proprietary business intelligence",
        body: "Interrogate internal financials, SOPs, strategy documents, and customer data safely offline.",
      },
      {
        title: "Personal records",
        body: "Query medical records, tax filings, and private notes without uploading them anywhere.",
      },
    ],
    differentiator:
      "Privacy here is architectural rather than a policy promise: with no outbound connection in the pipeline, there is no request to audit, no retention setting to trust, and no third-party processor to add to a compliance review.",
    note: "Recorded on a local machine with no network connection in the pipeline.",
  },
];

export function getDemoBySlug(slug) {
  return demos.find((d) => d.slug === slug);
}
