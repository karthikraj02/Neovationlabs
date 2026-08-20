import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";
import GlowCard from "../components/ui/GlowCard";
import TechnologyBadge from "../components/ui/TechnologyBadge";
import JsonLd from "../components/ui/JsonLd";
import { usePageMeta } from "../hooks/usePageMeta";
import MetricsCTA from "../components/sections/MetricsCTA";
import { getServiceBySlug, services } from "../data/services";

function faqsFor(service) {
  return [
    {
      q: "Do you build on top of existing AI providers, or train models from scratch?",
      a: "Almost always the former. Foundation models from providers like OpenAI and Anthropic, combined with retrieval and fine-tuning, solve the large majority of real business problems faster and more reliably than training from scratch.",
    },
    {
      q: "How do you handle data privacy for this kind of work?",
      a: "Data handling is scoped per project — access controls, retention, and provider choice are all decided upfront based on your compliance requirements, not assumed.",
    },
    {
      q: `What does a typical ${service.name.toLowerCase()} engagement look like?`,
      a: "It starts with discovery to confirm the problem is well-suited to this approach, followed by an architecture phase, an iterative build, and a validation pass before anything reaches production.",
    },
  ];
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-ink">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-faint transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-relaxed text-ink-dim">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  usePageMeta(service?.name, service?.short);

  if (!service) return <Navigate to="/404" replace />;

  const faqs = faqsFor(service);
  const otherServices = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.description,
          provider: { "@type": "Organization", name: "NeovationLabs", url: "https://neovationlabs.ai" },
          areaServed: "Worldwide",
        }}
      />
      <PageHero
        eyebrow={`Service ${service.index}`}
        title={service.name}
        description={service.description}
      />

      <section className="border-b border-line bg-void py-20 md:py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <GlowCard>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
              The problem
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">{service.problem}</p>
          </GlowCard>
          <GlowCard>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-signal">
              Our approach
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">{service.solution}</p>
          </GlowCard>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/40 py-20 md:py-24">
        <Container>
          <SectionHeading eyebrow="Capabilities" title="What's included." />
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {service.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
                <Check size={16} className="shrink-0 text-signal" />
                <span className="text-sm text-ink">{cap}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-void py-20 md:py-24">
        <Container>
          <SectionHeading eyebrow="Use cases" title="Where this shows up in practice." />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {service.useCases.map((uc, i) => (
              <div key={uc} className="rounded-xl border border-line bg-surface p-5">
                <span className="font-mono text-xs text-ink-faint">0{i + 1}</span>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{uc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/40 py-20 md:py-24">
        <Container>
          <SectionHeading eyebrow="Technology" title="Technologies we work with for this service." />
          <div className="mt-8 flex flex-wrap gap-2">
            {["Node.js", "Python", "React", "MongoDB", "Docker", "AWS"].map((t) => (
              <TechnologyBadge key={t}>{t}</TechnologyBadge>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-void py-20 md:py-24">
        <Container className="max-w-2xl">
          <SectionHeading eyebrow="FAQ" title="Common questions." />
          <div className="mt-8">
            {faqs.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/40 py-20 md:py-24">
        <Container>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
            Related services
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {otherServices.map((s) => (
              <Link
                key={s.slug}
                to={`/services/${s.slug}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
