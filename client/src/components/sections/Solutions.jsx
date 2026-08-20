import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import GlowCard from "../ui/GlowCard";
import { solutions } from "../../data/solutions";

export default function Solutions() {
  return (
    <section id="solutions" className="border-t border-line bg-void py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Solutions"
          title="Built for the Problems That Actually Show Up."
          description="Common shapes of work we build repeatedly — each one adapted to the specifics of a real system rather than shipped off the shelf."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlowCard className="h-full">
                <h3 className="font-display text-base font-medium leading-snug text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{s.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.capabilities.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
