import { motion } from "framer-motion";

export default function FlowDiagram({ steps }) {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line md:left-1/2 md:w-px" aria-hidden="true">
        <motion.div
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-signal to-transparent"
          animate={{ y: ["0%", "600%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <ol className="relative flex flex-col gap-6">
        {steps.map((step, i) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-5 md:justify-center"
          >
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-signal-dim bg-void font-mono text-[11px] text-signal">
              {i + 1}
            </span>
            <span className="rounded-lg border border-line bg-surface px-4 py-2.5 font-mono text-sm text-ink md:min-w-[220px] md:text-center">
              {step}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
