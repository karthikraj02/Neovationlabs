// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Video } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import VideoPlayer from "../components/ui/VideoPlayer";
import MetricsCTA from "../components/sections/MetricsCTA";
import { usePageMeta } from "../hooks/usePageMeta";
import { demos } from "../data/demos";

export default function DemosPage() {
  usePageMeta(
    "Demos",
    "Recorded demos of working NeovationLabs prototypes: cross-camera face search, retail footfall heatmaps, and fully offline document Q&A."
  );

  return (
    <>
      <PageHero
        eyebrow="Demos"
        title="Working systems, recorded end to end."
        description="Each of these is a running prototype built in the lab — captured as-is, so you can see the behaviour rather than a description of it."
      />

      <section className="border-b border-line bg-surface/40 py-10">
        <Container className="flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-xl text-sm leading-relaxed text-ink-dim">
            Want it run against your own cameras, documents, or store layout? We'll walk
            through the live application with you on a Google Meet call.
          </p>
          <Link
            to="/book-demo"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-void transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgb(var(--signal-rgb)/0.35)]"
          >
            <Video size={16} aria-hidden="true" />
            Book a live demo
          </Link>
        </Container>
      </section>

      <section className="bg-void py-20 md:py-24">
        <Container>
          <div className="space-y-20 md:space-y-28">
            {demos.map((demo, i) => (
              <motion.article
                key={demo.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-signal-dim px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-signal">
                    {demo.discipline}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    {demo.duration}
                  </span>
                </div>

                <h2 className="mt-4 text-balance font-display text-2xl font-medium leading-tight tracking-tight text-ink sm:text-3xl">
                  {demo.title}
                </h2>
                <p className="mt-3 max-w-2xl text-balance text-base leading-relaxed text-ink-dim md:text-lg">
                  {demo.summary}
                </p>

                <div className="mt-8">
                  <VideoPlayer
                    src={demo.video}
                    poster={demo.poster}
                    width={demo.width}
                    height={demo.height}
                    title={demo.title}
                    label={demo.discipline}
                    duration={demo.duration}
                  />
                  <p className="mt-3 font-mono text-[11px] text-ink-faint">{demo.note}</p>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/book-demo?demo=${demo.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-all duration-300 hover:border-signal-dim hover:shadow-[0_0_20px_rgb(var(--signal-rgb)/0.15)]"
                  >
                    <Video size={15} className="text-signal" aria-hidden="true" />
                    Book this demo live
                  </Link>
                  <Link
                    to={`/demos/${demo.slug}`}
                    className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-signal"
                  >
                    How it works
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                  <div className="flex flex-wrap gap-1.5">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
