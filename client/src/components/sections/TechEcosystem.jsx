import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import TechnologyBadge from "../ui/TechnologyBadge";
import { techCategories } from "../../data/tech";

export default function TechEcosystem() {
  return (
    <section className="border-t border-line bg-void py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Technology"
          title="Technologies We Work With."
          description="A pragmatic, production-tested stack — chosen per project rather than forced on every problem."
        />

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {techCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
                {cat.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <TechnologyBadge key={item}>{item}</TechnologyBadge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
