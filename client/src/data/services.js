export const services = [
  {
    index: "01",
    slug: "generative-ai",
    name: "Generative AI & LLM Applications",
    short:
      "Intelligent applications powered by modern foundation models, retrieval systems, and conversational interfaces.",
    description:
      "We build intelligent applications powered by modern foundation models, retrieval systems, conversational interfaces, and automated content generation — designed to integrate directly into how your team already works.",
    capabilities: [
      "AI chatbots & virtual assistants",
      "Retrieval-augmented generation (RAG)",
      "Prompt engineering & evaluation",
      "Model fine-tuning",
      "Automated content generation",
      "OpenAI & Anthropic integrations",
      "Open-source models — Llama, Mistral",
    ],
    problem:
      "Most teams have unstructured knowledge locked in documents, tickets, and internal tools that nobody can query directly.",
    solution:
      "We connect foundation models to your real data through retrieval pipelines and tool use, so answers are grounded, current, and auditable.",
    useCases: [
      "Internal knowledge assistants for support and engineering teams",
      "Customer-facing chat that resolves tickets without a human handoff",
      "Automated drafting for reports, summaries, and structured content",
    ],
  },
  {
    index: "02",
    slug: "custom-software",
    name: "Custom Software Solutions",
    short:
      "Scalable web and mobile applications with intelligent capabilities embedded directly into the product experience.",
    description:
      "We design and build scalable web and mobile applications with intelligent capabilities embedded directly into the product experience — not bolted on as an afterthought.",
    capabilities: [
      "Full-stack web applications",
      "SaaS platform architecture",
      "Mobile applications",
      "API & microservice design",
      "Real-time applications",
      "Intelligent automation layers",
      "Embedded ML features",
    ],
    problem:
      "Off-the-shelf software rarely fits an operating model precisely, and generic AI add-ons feel disconnected from the core product.",
    solution:
      "We architect software from the ground up with intelligence as a first-class part of the system, not a plugin.",
    useCases: [
      "SaaS products with AI features built into the core workflow",
      "Internal tools that replace spreadsheets and manual handoffs",
      "Customer platforms that need to scale past their first thousand users",
    ],
  },
  {
    index: "03",
    slug: "computer-vision",
    name: "Computer Vision Systems",
    short:
      "Real-time computer vision and automated visual analysis that turns visual data into actionable intelligence.",
    description:
      "We turn visual data into actionable intelligence through real-time computer vision and automated visual analysis, built for the specific conditions of your environment.",
    capabilities: [
      "Object detection & tracking",
      "Image classification",
      "Video analytics",
      "Automated visual inspection",
      "Spatial & feature recognition",
      "Edge AI deployment",
    ],
    problem:
      "Manual visual inspection doesn't scale, and generic vision models often underperform in real operating conditions.",
    solution:
      "We train and deploy vision systems tuned to your specific cameras, lighting, and inspection criteria, with edge deployment where latency matters.",
    useCases: [
      "Automated quality inspection on a production line",
      "Real-time counting and tracking across video feeds",
      "Visual anomaly detection for safety and compliance",
    ],
  },
  {
    index: "04",
    slug: "agentic-workflows",
    name: "Agentic Workflows",
    short:
      "Autonomous AI agents capable of reasoning through complex tasks, using tools, and executing multi-step workflows.",
    description:
      "We deploy autonomous AI agents capable of reasoning through complex tasks, using tools, interacting with systems, and executing multi-step workflows with a human in the loop where it counts.",
    capabilities: [
      "AI agent architecture",
      "Tool calling & function orchestration",
      "Multi-agent systems",
      "Workflow automation",
      "Autonomous operations",
      "Human-in-the-loop controls",
    ],
    problem:
      "Many operational workflows involve dozens of small decisions and system handoffs that consume hours of skilled time.",
    solution:
      "We design agents that plan, call the right tools, and execute multi-step operations, with clear checkpoints for human review.",
    useCases: [
      "Multi-step operational workflows across internal systems",
      "Research and reporting agents that compile from multiple sources",
      "Business process automation with built-in approval gates",
    ],
  },
  {
    index: "05",
    slug: "data-engineering",
    name: "Data Engineering & Pipelines",
    short:
      "Robust systems for ingestion, transformation, and warehousing that turn raw data into AI-ready datasets.",
    description:
      "We build robust systems for ingestion, ETL/ELT, cleaning, transformation, and warehousing, so downstream teams and models work from data they can trust.",
    capabilities: [
      "Ingestion & ETL/ELT pipelines",
      "Data cleaning & transformation",
      "Warehousing & data integration",
      "API-based ingestion",
      "AI-ready dataset preparation",
    ],
    problem:
      "AI and analytics initiatives stall when the underlying data is inconsistent, duplicated, or scattered across systems.",
    solution:
      "We build pipelines that consolidate data from CRMs, ERPs, APIs, and files into a single reliable source teams and models can depend on.",
    useCases: [
      "Consolidating data from multiple business systems",
      "Building a warehouse that supports both BI and ML",
      "Preparing clean, labeled datasets for model training",
    ],
  },
  {
    index: "06",
    slug: "mlops",
    name: "MLOps & Model Monitoring",
    short:
      "Deployment, versioning, monitoring, and observability for machine learning models in production.",
    description:
      "We provide the operational backbone for machine learning in production — deployment, versioning, monitoring, drift detection, and retraining pipelines.",
    capabilities: [
      "Model deployment & versioning",
      "Monitoring & observability",
      "Drift detection",
      "Audit trails",
      "Retraining pipelines",
      "CI/CD for machine learning",
    ],
    problem:
      "Models that perform well at launch silently degrade as real-world data shifts, often without anyone noticing until it's costly.",
    solution:
      "We put monitoring, versioning, and retraining pipelines in place so model performance is visible and maintainable over time.",
    useCases: [
      "Production monitoring for models already deployed",
      "CI/CD pipelines for continuous model delivery",
      "Governance and audit trails for regulated environments",
    ],
  },
  {
    index: "07",
    slug: "predictive-analytics",
    name: "Predictive Analytics",
    short:
      "Forecasting, risk assessment, and anomaly detection that turn historical data into decision-support systems.",
    description:
      "We turn historical and real-time data into forecasting, risk assessment, and anomaly detection systems that support faster, better-informed decisions.",
    capabilities: [
      "Forecasting models",
      "Risk assessment",
      "Trend analysis",
      "Anomaly detection",
      "Business intelligence integration",
      "Decision-support systems",
    ],
    problem:
      "Decisions about demand, risk, and operations are often made on gut feel or backward-looking reports.",
    solution:
      "We build predictive models that surface forward-looking signals directly inside the tools decision-makers already use.",
    useCases: [
      "Demand and revenue forecasting",
      "Credit or operational risk scoring",
      "Early anomaly detection across transactions or sensors",
    ],
  },
];

export const getServiceBySlug = (slug) => services.find((s) => s.slug === slug);
