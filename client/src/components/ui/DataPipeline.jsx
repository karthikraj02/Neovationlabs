import { motion } from "framer-motion";

const sources = ["CRM", "ERP", "APIs", "Databases", "Files", "Streams"];
const stages = ["Ingestion", "Processing", "Data Lake / Warehouse", "Feature Engineering", "AI / ML", "Business Intelligence"];

export default function DataPipeline() {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
          Data sources
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink-dim"
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="relative flex min-w-max items-center gap-0">
          {stages.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="w-[168px] shrink-0 rounded-xl border border-line bg-surface px-4 py-4 text-center"
              >
                <span className="font-mono text-xs text-ink">{stage}</span>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="relative h-px w-8 shrink-0 bg-line md:w-12">
                  <motion.div
                    className="absolute inset-y-0 left-0 w-3 bg-signal"
                    animate={{ x: ["0%", "260%"] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
