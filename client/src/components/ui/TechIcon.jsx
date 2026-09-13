import {
  siAnthropic, siGooglegemini, siMistralai, siMeta, siOllama, siHuggingface,
  siLangchain, siTensorflow, siScikitlearn, siReact, siNextdotjs, siTypescript,
  siTailwindcss, siNodedotjs, siExpress, siPython, siFastapi, siOpenjdk,
  siSpringboot, siSwift, siKotlin, siFlutter, siPostgresql, siMongodb, siMysql,
  siRedis, siGooglecloud, siDocker, siKubernetes, siJenkins, siMlflow,
} from "simple-icons";
import { Activity, Cloud, Database, Sparkles, Telescope, Workflow } from "lucide-react";

// Brand logos come from simple-icons. OpenAI, AWS, Azure and MS SQL Server were
// removed from that set at the trademark owners' request, so they (and the
// generic entries) fall back to neutral lucide icons.
const brandIcons = {
  Anthropic: siAnthropic,
  Gemini: siGooglegemini,
  Mistral: siMistralai,
  Llama: siMeta,
  Ollama: siOllama,
  "Hugging Face": siHuggingface,
  LangChain: siLangchain,
  TensorFlow: siTensorflow,
  "scikit-learn": siScikitlearn,
  React: siReact,
  "Next.js": siNextdotjs,
  TypeScript: siTypescript,
  "Tailwind CSS": siTailwindcss,
  "Node.js": siNodedotjs,
  Express: siExpress,
  Python: siPython,
  FastAPI: siFastapi,
  Java: siOpenjdk,
  "Spring Boot": siSpringboot,
  Swift: siSwift,
  Kotlin: siKotlin,
  "React Native": siReact,
  Flutter: siFlutter,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  MySQL: siMysql,
  Redis: siRedis,
  GCP: siGooglecloud,
  Docker: siDocker,
  Kubernetes: siKubernetes,
  Jenkins: siJenkins,
  MLflow: siMlflow,
};

const fallbackIcons = {
  OpenAI: Sparkles,
  AWS: Cloud,
  Azure: Cloud,
  "MS SQL Server": Database,
  "Vector databases": Database,
  "CI/CD": Workflow,
  "Model monitoring": Activity,
  Observability: Telescope,
};

export default function TechIcon({ name, size = 14 }) {
  const brand = brandIcons[name];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" className="shrink-0">
        <path d={brand.path} />
      </svg>
    );
  }

  const Fallback = fallbackIcons[name];
  return Fallback ? <Fallback size={size} strokeWidth={1.75} aria-hidden="true" className="shrink-0" /> : null;
}
