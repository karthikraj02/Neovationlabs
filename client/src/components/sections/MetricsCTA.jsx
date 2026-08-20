import { motion } from "framer-motion";
import Container from "../ui/Container";
import Button from "../ui/Button";
import AnimatedValue from "../ui/AnimatedValue";

const metrics = [
  { value: "24/7", label: "AI-ready systems" },
  { value: "Multi-Model", label: "LLM architecture" },
  { value: "End-to-End", label: "Product engineering" },
  { value: "Production-Ready", label: "Infrastructure" },
];

export default function MetricsCTA() {
  return (
    <>
      <section className="border-t border-line bg-void py-20 md:py-24">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {metrics.map((m) => (
              <AnimatedValue key={m.label} value={m.value} label={m.label} />
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-t border-line bg-void py-28 md:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/5 blur-[140px]" />
        <Container className="relative text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-balance font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl"
          >
            Ready to build what's next?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-4 max-w-md text-balance text-ink-dim"
          >
            Tell us about the problem — we'll tell you what it takes to solve it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex justify-center"
          >
            <Button to="/contact" variant="primary">
              Start a Project
            </Button>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
