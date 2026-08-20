import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { services } from "../../data/services";

function ServiceCard({ service, i }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-signal-dim md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-xs text-ink-faint">{service.index}</span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim transition-all duration-300 hover:border-signal-dim hover:text-signal md:hidden"
          aria-expanded={expanded}
          aria-label={`Toggle capabilities for ${service.name}`}
        >
          <Plus size={14} className={expanded ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      <h3 className="mt-5 font-display text-lg font-medium leading-snug text-ink md:text-xl">
        {service.name}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">{service.short}</p>

      <div
        className={`mt-5 overflow-hidden transition-all duration-500 md:max-h-0 md:group-hover:max-h-40 ${
          expanded ? "max-h-40" : "max-h-0"
        }`}
      >
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {service.capabilities.slice(0, 4).map((cap) => (
            <li
              key={cap}
              className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[11px] text-ink-faint"
            >
              {cap}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to={`/services/${service.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-dim transition-colors duration-300 hover:text-signal"
      >
        Learn more <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  );
}

export default function Services() {
  return (
    <section id="services" className="border-t border-line bg-void py-24 md:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Capabilities"
            title="AI & Software, Engineered Around Your Business."
            description="Seven disciplines, one team — from foundation-model applications to the infrastructure that keeps them running in production."
          />
          <Link
            to="/services"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink md:flex"
          >
            View all services →
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} i={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
