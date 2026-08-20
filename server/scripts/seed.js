/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const { mongodbUri } = require("../src/config/env");
const Service = require("../src/models/Service");
const Insight = require("../src/models/Insight");

const services = [
  { name: "Generative AI & LLM Applications", slug: "generative-ai", order: 1,
    shortDescription: "Intelligent applications powered by modern foundation models, retrieval systems, and conversational interfaces.",
    description: "We build intelligent applications powered by modern foundation models, retrieval systems, conversational interfaces, and automated content generation.",
    capabilities: ["AI chatbots & virtual assistants", "Retrieval-augmented generation (RAG)", "Prompt engineering & evaluation", "Model fine-tuning"],
    technologies: ["OpenAI", "Anthropic", "Llama", "Mistral"] },
  { name: "Custom Software Solutions", slug: "custom-software", order: 2,
    shortDescription: "Scalable web and mobile applications with intelligent capabilities embedded directly into the product experience.",
    description: "We design and build scalable web and mobile applications with intelligent capabilities embedded directly into the product experience.",
    capabilities: ["Full-stack applications", "SaaS platforms", "APIs & microservices", "Embedded ML"],
    technologies: ["React", "Node.js", "MongoDB"] },
  { name: "Computer Vision Systems", slug: "computer-vision", order: 3,
    shortDescription: "Real-time computer vision and automated visual analysis that turns visual data into actionable intelligence.",
    description: "We turn visual data into actionable intelligence through real-time computer vision and automated visual analysis.",
    capabilities: ["Object detection", "Image classification", "Video analytics", "Edge AI"],
    technologies: ["Python", "OpenCV", "PyTorch"] },
  { name: "Agentic Workflows", slug: "agentic-workflows", order: 4,
    shortDescription: "Autonomous AI agents capable of reasoning through complex tasks, using tools, and executing multi-step workflows.",
    description: "We deploy autonomous AI agents capable of reasoning through complex tasks, using tools, interacting with systems, and executing multi-step workflows.",
    capabilities: ["Tool calling", "Multi-agent systems", "Workflow automation", "Human-in-the-loop"],
    technologies: ["LangChain", "Node.js", "Python"] },
  { name: "Data Engineering & Pipelines", slug: "data-engineering", order: 5,
    shortDescription: "Robust systems for ingestion, transformation, and warehousing that turn raw data into AI-ready datasets.",
    description: "We build robust systems for ingestion, ETL/ELT, cleaning, transformation, and warehousing.",
    capabilities: ["ETL/ELT pipelines", "Data warehousing", "API ingestion"],
    technologies: ["Python", "Airflow", "PostgreSQL"] },
  { name: "MLOps & Model Monitoring", slug: "mlops", order: 6,
    shortDescription: "Deployment, versioning, monitoring, and observability for machine learning models in production.",
    description: "We provide the operational backbone for machine learning in production.",
    capabilities: ["Model deployment", "Drift detection", "CI/CD for ML"],
    technologies: ["MLflow", "Docker", "Kubernetes"] },
  { name: "Predictive Analytics", slug: "predictive-analytics", order: 7,
    shortDescription: "Forecasting, risk assessment, and anomaly detection that turn historical data into decision-support systems.",
    description: "We turn historical and real-time data into forecasting, risk assessment, and anomaly detection systems.",
    capabilities: ["Forecasting models", "Risk scoring", "Anomaly detection"],
    technologies: ["Python", "scikit-learn"] },
];

const insights = [
  {
    title: "RAG vs. fine-tuning: choosing the right approach for your data",
    slug: "rag-vs-fine-tuning",
    excerpt: "Most teams reach for fine-tuning first. In practice, retrieval usually gets you further, faster.",
    content: "Full article content goes here.",
    category: "Generative AI",
    author: "NeovationLabs Engineering",
    readingTime: "6 min read",
    tags: ["RAG", "LLM", "fine-tuning"],
  },
  {
    title: "Why every agentic workflow needs a human-in-the-loop checkpoint",
    slug: "agentic-workflows-human-in-the-loop",
    excerpt: "Full autonomy sounds appealing until an agent makes an expensive mistake at 2am.",
    content: "Full article content goes here.",
    category: "Agentic AI",
    author: "NeovationLabs Engineering",
    readingTime: "5 min read",
    tags: ["agents", "automation"],
  },
  {
    title: "The quiet failure mode: model drift and how to catch it early",
    slug: "mlops-drift-detection-basics",
    excerpt: "Models that perform well at launch degrade silently as real-world data shifts.",
    content: "Full article content goes here.",
    category: "MLOps",
    author: "NeovationLabs Engineering",
    readingTime: "7 min read",
    tags: ["mlops", "monitoring"],
  },
];

async function seed() {
  if (!mongodbUri) {
    console.error("MONGODB_URI is not set. Add it to server/.env before seeding.");
    process.exit(1);
  }

  await mongoose.connect(mongodbUri);
  console.log("Connected to MongoDB. Seeding...");

  for (const service of services) {
    await Service.findOneAndUpdate({ slug: service.slug }, service, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded ${services.length} services.`);

  for (const insight of insights) {
    await Insight.findOneAndUpdate({ slug: insight.slug }, insight, {
      upsert: true,
      new: true,
    });
  }
  console.log(`Seeded ${insights.length} insights.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
