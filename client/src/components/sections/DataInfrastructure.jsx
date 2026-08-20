import { motion } from "framer-motion";
import { Database, Gauge, LineChart } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import GlowCard from "../ui/GlowCard";
import DataPipeline from "../ui/DataPipeline";

const items = [
  {
    icon: Database,
    title: "Data Engineering & Pipelines",
    points: ["Ingestion & ETL/ELT", "Cleaning & transformation", "Warehousing", "AI-ready datasets"],
  },
  {
    icon: Gauge,
    title: "MLOps & Model Monitoring",
    points: ["Deployment & versioning", "Drift detection", "Audit trails", "CI/CD for ML"],
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    points: ["Forecasting", "Risk assessment", "Anomaly detection", "Decision support"],
  },
];

export default function DataInfrastructure() {
  return (
    <section className="border-t border-line bg-void py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Data & Infrastructure"
          title="From Raw Data to Production Intelligence."
          description="Models are only as good as the data underneath them. We build the pipelines, monitoring, and forecasting layers that keep intelligence reliable long after launch."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map(({ icon: Icon, title, points }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlowCard>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-void">
                  <Icon size={18} className="text-signal" />
                </div>
                <h3 className="mt-5 font-display text-lg font-medium text-ink">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                      {p}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-surface/50 p-6 md:p-8">
          <div className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-signal">
            From raw data to production intelligence
          </div>
          <DataPipeline />
        </div>
      </Container>
    </section>
  );
}
