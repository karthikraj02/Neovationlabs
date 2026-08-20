import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { process } from "../../data/tech";

export default function Process() {
  return (
    <section className="border-t border-line bg-surface/40 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="From Problem to Production."
          description="Six stages, one continuous loop — the last stage feeds back into the first as real usage informs what comes next."
        />

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {process.map((step, i) => (
            <motion.div
              key={step.index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-void p-7 transition-colors duration-500 hover:bg-surface"
            >
              <span className="font-mono text-2xl text-ink-faint transition-colors duration-500 group-hover:text-signal">
                {step.index}
              </span>
              <h3 className="mt-4 font-display text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
