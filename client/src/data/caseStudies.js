export const caseStudies = [
  {
    slug: "ai-operations-platform",
    title: "AI Operations Platform",
    problem: "Manual, multi-step operational workflows consuming hours of skilled staff time every week.",
    solution: "An agentic workflow automation platform that plans, executes, and hands off multi-step operational tasks with human approval at key checkpoints.",
    technology: ["LLMs", "RAG", "Node.js", "Python", "MongoDB"],
    outcome: "Automated multi-step operational processes that previously required manual coordination across systems.",
  },
  {
    slug: "support-knowledge-assistant",
    title: "Support Knowledge Assistant",
    problem: "Support documentation scattered across a wiki, ticket history, and internal tools nobody could search at once.",
    solution: "A retrieval-augmented assistant grounded in the existing knowledge base, with tool access to check ticket status and escalate when it's uncertain.",
    technology: ["RAG", "Vector database", "React", "Express"],
    outcome: "A single interface for support staff to query documentation and live ticket context together.",
  },
  {
    slug: "visual-inspection-pipeline",
    title: "Visual Inspection Pipeline",
    problem: "Manual visual quality checks that didn't scale with production volume.",
    solution: "A computer vision pipeline trained on the specific inspection criteria, deployed at the edge for low-latency flagging.",
    technology: ["Computer vision", "Python", "Edge deployment"],
    outcome: "Automated flagging of visual anomalies for human review, in place of a fully manual process.",
  },
];
