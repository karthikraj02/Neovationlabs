import { motion } from "framer-motion";
import Container from "./Container";

export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-void pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <Container className="relative max-w-2xl">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            {eyebrow}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-balance text-lg leading-relaxed text-ink-dim"
          >
            {description}
          </motion.p>
        )}
      </Container>
    </section>
  );
}
