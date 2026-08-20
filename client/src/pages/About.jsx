import { motion } from "framer-motion";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";
import GlowCard from "../components/ui/GlowCard";
import MetricsCTA from "../components/sections/MetricsCTA";
import { usePageMeta } from "../hooks/usePageMeta";

const beliefs = [
  {
    title: "Production is the only real test",
    body: "A demo proves an idea works once. Production proves it keeps working — under real traffic, real data, and real failure modes.",
  },
  {
    title: "Intelligence should be embedded, not bolted on",
    body: "AI features that live outside the core product rarely earn their keep. We build intelligence into the architecture from day one.",
  },
  {
    title: "Systems should be observable by default",
    body: "If you can't see what a model or agent is doing in production, you can't trust it. Monitoring isn't an afterthought.",
  },
  {
    title: "Simplicity is a design decision",
    body: "We reach for the simplest architecture that solves the actual problem — not the most impressive one on paper.",
  },
];

const workSteps = [
  "We start by understanding the operational problem, not the technology you think you need.",
  "We architect the system end-to-end — application, AI layer, and data — before writing production code.",
  "We build in short, visible increments so you can see progress and redirect early.",
  "We hand off with documentation, monitoring, and a clear picture of what happens after launch.",
];

export default function About() {
  usePageMeta(
    "About",
    "NeovationLabs is an AI engineering studio focused on turning artificial intelligence into software businesses can run on in production."
  );
  return (
    <>
      <PageHero
        eyebrow="About NeovationLabs"
        title="AI engineering, built for production."
        description="NeovationLabs is a technology studio focused on one problem: turning AI from an interesting demo into software that businesses can actually run on."
      />

      <section className="border-b border-line bg-void py-24 md:py-28">
        <Container className="grid gap-12 md:grid-cols-2">
          <SectionHeading
            eyebrow="Who we are"
            title="Engineers first, AI second."
          />
          <p className="text-balance text-base leading-relaxed text-ink-dim md:text-lg">
            We're a full-stack team that treats artificial intelligence as one
            more discipline inside sound software engineering — not a
            replacement for it. Every project pairs solid application
            architecture with the AI, data, and automation layers that make a
            product genuinely intelligent, not just AI-branded.
          </p>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/40 py-24 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="What we believe"
            title="Our engineering philosophy."
            description="Technology should not simply automate work. It should expand what teams are capable of accomplishing."
          />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {beliefs.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <GlowCard className="h-full">
                  <h3 className="font-display text-lg font-medium text-ink">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim">{b.body}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-void py-24 md:py-28">
        <Container className="grid gap-12 md:grid-cols-2">
          <SectionHeading eyebrow="How we work" title="From problem to production, together." />
          <ol className="space-y-6">
            {workSteps.map((step, i) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-4"
              >
                <span className="mt-0.5 font-mono text-sm text-signal">0{i + 1}</span>
                <span className="text-sm leading-relaxed text-ink-dim">{step}</span>
              </motion.li>
            ))}
          </ol>
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
