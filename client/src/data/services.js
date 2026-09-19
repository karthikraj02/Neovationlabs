// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
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
  {
    index: "08",
    slug: "networking",
    name: "Networking & Infrastructure",
    short:
      "Secure, resilient networks — from office LANs and Wi-Fi to cloud connectivity, VPNs, and round-the-clock monitoring.",
    description:
      "We design, deploy, and manage the networks your systems run on — wired and wireless LANs, secure site-to-site and cloud connectivity, and the monitoring that keeps them reliable as you grow.",
    capabilities: [
      "Network design & architecture",
      "LAN, WAN & enterprise Wi-Fi",
      "Firewalls & network security",
      "VPN & zero-trust remote access",
      "Cloud & hybrid connectivity",
      "Network monitoring & observability",
      "Structured cabling & site surveys",
    ],
    problem:
      "Networks tend to grow one device and one quick fix at a time, until slow connections, dead zones, and security gaps start costing real work — and nobody has a clear picture of how it all fits together.",
    solution:
      "We map what you have, design a segmented and documented architecture, and roll it out with monitoring and alerting from day one — so problems show up on a dashboard before users notice them.",
    useCases: [
      "Office and multi-site networks with secure site-to-site links",
      "Warehouse, campus, and factory Wi-Fi coverage without dead zones",
      "Secure remote and hybrid access to internal systems and the cloud",
    ],
    technologies: ["Cisco", "Ubiquiti", "Fortinet", "pfSense", "WireGuard", "AWS VPC", "Zabbix", "Grafana"],
    faqs: [
      {
        q: "Can you work with the network equipment we already have?",
        a: "Usually, yes. We start with an audit of your current hardware and configuration, keep what is sound, and only recommend replacing equipment that is end-of-life, unsupported, or the actual cause of the problem.",
      },
      {
        q: "Will the rollout disrupt day-to-day operations?",
        a: "Changes are planned in stages and scheduled into maintenance windows, with a tested rollback for each step, so critical systems stay online while the new network comes up.",
      },
      {
        q: "Do you support the network after it goes live?",
        a: "Yes. Every deployment ships with monitoring and full documentation, and we offer ongoing management — alert response, firmware and security updates, and capacity planning as you grow.",
      },
    ],
  },
  {
    index: "09",
    slug: "iot",
    name: "Internet of Things (IoT)",
    short:
      "Connected devices, sensors, and gateways that stream real-world data into dashboards, alerts, and AI models.",
    description:
      "We build end-to-end IoT systems — sensor and device integration, edge gateways, secure device-to-cloud messaging, and the dashboards and analytics that turn physical signals into decisions.",
    capabilities: [
      "Sensor & device integration",
      "Edge gateways & edge computing",
      "MQTT & device-to-cloud messaging",
      "Device provisioning & OTA updates",
      "Real-time dashboards & alerting",
      "Predictive maintenance models",
      "IoT security & fleet management",
    ],
    problem:
      "Equipment, environments, and assets produce valuable signals, but the data stays trapped on the device — or arrives in formats nothing downstream can use.",
    solution:
      "We connect devices through secure gateways, stream their data into a reliable pipeline, and put live dashboards, alerts, and predictive models on top — with provisioning and over-the-air updates so the fleet stays manageable.",
    useCases: [
      "Predictive maintenance for motors, pumps, and production equipment",
      "Cold-chain and environmental monitoring with instant alerts",
      "Asset and fleet tracking across multiple sites",
    ],
    technologies: ["ESP32", "Raspberry Pi", "MQTT", "AWS IoT Core", "Node-RED", "InfluxDB", "Grafana", "Python"],
    faqs: [
      {
        q: "Can you connect the equipment and sensors we already have?",
        a: "In most cases. Industrial equipment commonly speaks protocols like Modbus or OPC UA, and we bridge those through an edge gateway rather than replacing machinery that already works.",
      },
      {
        q: "What happens when a site loses its internet connection?",
        a: "Gateways buffer readings locally and sync once the connection returns, and time-critical rules run at the edge, so alerts and control logic don't depend on a live link to the cloud.",
      },
      {
        q: "How do you keep connected devices secure?",
        a: "Every device gets its own identity and certificate, traffic is encrypted end to end, and firmware is updated over the air — so one compromised device can't be used to reach the rest of your network.",
      },
    ],
  },
];

export const getServiceBySlug = (slug) => services.find((s) => s.slug === slug);
