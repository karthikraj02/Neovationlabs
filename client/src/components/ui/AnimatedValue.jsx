import { motion } from "framer-motion";

export default function AnimatedValue({ value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-line pt-5"
    >
      <div className="font-display text-2xl font-medium text-ink sm:text-3xl">{value}</div>
      <div className="mt-1.5 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
        {label}
      </div>
    </motion.div>
  );
}
