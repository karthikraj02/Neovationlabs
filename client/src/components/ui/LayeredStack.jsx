import { motion } from "framer-motion";

const layers = ["Frontend", "API", "Backend", "AI / ML", "Database", "Infrastructure"];

export default function LayeredStack() {
  return (
    <div className="relative flex flex-col gap-2.5">
      <div
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-line"
        aria-hidden="true"
      />
      {layers.map((layer, i) => (
        <motion.div
          key={layer}
          initial={{ opacity: 0, scaleX: 0.92 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center rounded-lg border border-line bg-surface py-3.5"
          style={{ marginInline: `${i * 1.25}%` }}
        >
          <span className="font-mono text-sm text-ink">{layer}</span>
          {i === 3 && (
            <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_2px_rgba(94,234,212,0.6)]" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
