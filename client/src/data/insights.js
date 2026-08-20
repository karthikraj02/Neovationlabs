export const insights = [
  {
    slug: "rag-vs-fine-tuning",
    category: "Generative AI",
    title: "RAG vs. fine-tuning: choosing the right approach for your data",
    excerpt:
      "Most teams reach for fine-tuning first. In practice, retrieval usually gets you further, faster — here's how to decide.",
    date: "2026-06-02",
    readingTime: "6 min read",
    author: "NeovationLabs Engineering",
    content: [
      "When a team decides they want an AI system that \"knows\" their internal data, the first instinct is almost always the same: fine-tune a model on it. It has intuitive appeal — teach the model your documents the way you'd teach a new hire. In practice, this is rarely the right first move, and understanding why comes down to what fine-tuning actually changes versus what most teams actually need.",
      "Fine-tuning adjusts a model's weights based on examples. It's genuinely useful for teaching a model a style, a format, or a narrow skill — writing in your brand voice, extracting fields in a specific structure, or following a particular reasoning pattern. What it's not good at is teaching a model facts it should recall precisely. Weights encode statistical patterns, not a lookup table, so a fine-tuned model can still misstate a number from a document it was trained on, and there's no reliable way to trace an answer back to its source.",
      "Retrieval-augmented generation solves a different problem: instead of baking knowledge into weights, it fetches the relevant passages at query time and hands them to the model as context. The model's job shifts from \"recall this fact\" to \"read this passage and answer based on it\" — a task foundation models are already very good at. The practical benefits follow directly: answers can cite their source, the knowledge base can be updated by editing a document rather than retraining a model, and access control can be enforced at the retrieval layer.",
      "This is why we default to RAG for the large majority of \"our AI should know about our data\" requests. The knowledge is usually specific, it usually changes over time, and the ability to point to a source is usually a requirement — even when nobody states it explicitly, it becomes one the first time a stakeholder asks \"how do you know that's right?\"",
      "None of this makes fine-tuning obsolete. The two techniques solve different problems and combine well: fine-tune a model to follow your output format and tone, then use RAG to ground its answers in current, specific information. We've found the decision gets easier once you stop asking \"RAG or fine-tuning\" and start asking two separate questions instead — does the model need to behave differently, or does it need to know something specific? The first points to fine-tuning. The second, almost always, points to retrieval.",
      "The practical failure mode we see most often is teams skipping straight to fine-tuning because it feels like the more serious, more \"real\" AI engineering move, then discovering months later that the model still hallucinates facts and nobody can explain why a given answer was given. Retrieval isn't the less rigorous choice — it's usually the more precise one for exactly the kind of problem \"make our AI know our data\" describes.",
    ],
  },
  {
    slug: "agentic-workflows-human-in-the-loop",
    category: "Agentic AI",
    title: "Why every agentic workflow needs a human-in-the-loop checkpoint",
    excerpt:
      "Full autonomy sounds appealing until an agent makes an expensive mistake at 2am. Here's how we design approval gates that don't slow teams down.",
    date: "2026-05-14",
    readingTime: "5 min read",
    author: "NeovationLabs Engineering",
    content: [
      "The pitch for agentic AI is usually framed around removing humans from a workflow entirely — an agent that plans, executes, and reports back, with nobody in the loop until it's done. That framing is useful for demos and dangerous for production systems, because it optimizes for the wrong thing. The actual goal isn't zero human involvement; it's spending human attention only where it changes the outcome.",
      "Every agentic workflow we build starts with the same exercise: map out the individual decisions the agent will make, and sort them by two questions. First, how reversible is this action — can it be undone cheaply if it turns out wrong? Second, how confident can the agent realistically be, given the information available at that step? Actions that are both reversible and high-confidence — drafting a summary, querying a read-only API, proposing an outline — can run fully autonomously. Actions that are irreversible, high-stakes, or genuinely ambiguous get a checkpoint.",
      "A checkpoint doesn't have to mean a slow, blocking approval queue. The best ones we've built are narrow and specific: not \"approve this entire workflow\" but \"approve this one irreversible step, with full context on what led up to it and what happens next.\" An agent that's been reasoning through a multi-step operational task for ten minutes can present a single, well-scoped decision — \"send this refund,\" \"delete these records,\" \"page the on-call engineer\" — rather than dumping its entire chain of thought on a reviewer and asking them to re-derive trust in the whole thing.",
      "This is also where a lot of agent designs quietly fail: they either checkpoint everything, which trains reviewers to rubber-stamp without reading, or they checkpoint nothing, which is fine until the one time it isn't. Calibrating the checkpoint boundary correctly is most of the actual engineering work in building a production agent — the reasoning and tool-calling infrastructure is comparatively well-trodden at this point.",
      "There's a second reason human-in-the-loop checkpoints matter beyond safety: they're where an agent's failure modes actually surface. An agent that's never paused for review will fail silently in ways nobody notices until the downstream damage is done. An agent with well-placed checkpoints generates a visible trail of the decisions a human actually cared about, which becomes the dataset you use to figure out where the agent's judgment is reliable and where it isn't — informing both prompt and tooling changes going forward.",
      "None of this requires giving up on autonomy as a goal. It requires being honest about which parts of a workflow actually need it. In our experience, a workflow with two or three well-placed checkpoints, each genuinely load-bearing, ends up faster and more trusted in practice than one designed to look fully autonomous on a slide.",
    ],
  },
  {
    slug: "mlops-drift-detection-basics",
    category: "MLOps",
    title: "The quiet failure mode: model drift and how to catch it early",
    excerpt:
      "Models that perform well at launch degrade silently as real-world data shifts. A practical monitoring setup catches it before customers do.",
    date: "2026-04-28",
    readingTime: "7 min read",
    author: "NeovationLabs Engineering",
    content: [
      "A model doesn't usually fail all at once. It fails a little at a time, in ways that are individually easy to explain away — a slightly odd prediction here, a customer complaint there — until enough of them accumulate that someone finally asks how long this has been happening. The honest answer is often \"since shortly after launch,\" because the input data started shifting the moment the model went live and nobody was watching for it.",
      "This is what practitioners mean by drift, and it comes in two flavors worth distinguishing. Data drift is a change in the input distribution — your customers, sensors, or documents start looking statistically different from what the model was trained on, even if the underlying relationship between inputs and correct outputs hasn't changed. Concept drift is the deeper problem: the relationship itself changes, so the same input that used to map to one correct answer now maps to another. A fraud model trained before a new attack pattern emerged is a concept drift problem. A recommendation model facing an audience shift after a marketing campaign is closer to a data drift problem. Both degrade accuracy; they call for different fixes.",
      "The reason drift is dangerous rather than merely inconvenient is that most teams have no visibility into it by default. A model deployed behind an API doesn't announce that its accuracy has dropped — it just keeps returning predictions, confidently, on data it was never really suited for. Without monitoring, the first signal is usually a business metric moving in the wrong direction weeks after the actual cause.",
      "A practical monitoring setup doesn't need to be elaborate to catch the bulk of this. At minimum, we track the statistical distribution of key input features over time and alert when they move meaningfully away from the training distribution — a straightforward comparison that catches most data drift early. Where ground truth eventually becomes available, even on a delay, we compare it against the model's historical predictions to catch concept drift directly rather than inferring it. And we log enough of each prediction, with its inputs, to make root-causing a flagged period possible after the fact rather than guessing.",
      "The organizational piece matters as much as the technical one. Drift alerts are only useful if someone owns responding to them, and if there's an established path from \"the monitor fired\" to \"the model gets retrained or rolled back.\" We build that path — versioned models, a retraining pipeline that can run on demand, and a rollback option that doesn't require an emergency deploy — before a model goes to production, not after the first incident makes it obvious it was missing.",
      "The teams that handle this well don't treat monitoring as an afterthought bolted onto a finished model. They treat the model as one component in a system that's expected to change, and they build the visibility to notice when it does — because a model that quietly stops being right is a much harder problem to catch than one that fails loudly.",
    ],
  },
];

export const getInsightBySlug = (slug) => insights.find((i) => i.slug === slug);
