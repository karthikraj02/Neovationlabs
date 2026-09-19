// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
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

        <div className="mt-14 border-t border-line">
          {techCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-5 border-b border-line py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] md:items-center md:gap-8 md:py-10"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
                  {cat.label}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <TechnologyBadge key={item} icon>
                    {item}
                  </TechnologyBadge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
