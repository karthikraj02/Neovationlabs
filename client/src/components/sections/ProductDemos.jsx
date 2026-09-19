// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Video } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import VideoPlayer from "../ui/VideoPlayer";
import { demos } from "../../data/demos";
import { cn } from "../../lib/utils";

export default function ProductDemos() {
  const [activeSlug, setActiveSlug] = useState(demos[0].slug);
  const active = demos.find((d) => d.slug === activeSlug) ?? demos[0];

  return (
    <section id="demos" className="border-t border-line bg-void py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Product Demos"
          title="Systems We've Built, Running."
          description="Screen recordings of working prototypes from the lab — no mockups, no slideware. Press play on any of them."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {demos.map((demo) => {
              const isActive = demo.slug === active.slug;
              return (
                <button
                  key={demo.slug}
                  type="button"
                  onClick={() => setActiveSlug(demo.slug)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative min-w-[16rem] shrink-0 rounded-2xl border p-5 text-left transition-all duration-500 lg:min-w-0",
                    isActive
                      ? "border-signal-dim bg-surface-raised"
                      : "border-line bg-surface hover:border-ink-faint hover:bg-surface-raised"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                      {demo.discipline}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">{demo.duration}</span>
                  </div>
                  <h3
                    className={cn(
                      "mt-3 font-display text-base font-medium leading-snug transition-colors duration-300",
                      isActive ? "text-ink" : "text-ink-dim"
                    )}
                  >
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">{demo.tagline}</p>
                  {/* Static rather than a shared-layout indicator: on mobile
                      these cards sit in a horizontal scroller, where an
                      animating marker can be left stranded over the wrong card. */}
                  {isActive && (
                    <span className="absolute left-0 top-5 h-[calc(100%-2.5rem)] w-px bg-signal" />
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <VideoPlayer
              key={active.slug}
              src={active.video}
              poster={active.poster}
              width={active.width}
              height={active.height}
              title={active.title}
              label={active.discipline}
              duration={active.duration}
            />

            <motion.div
              key={`${active.slug}-copy`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              <p className="max-w-2xl text-sm leading-relaxed text-ink-dim md:text-base">
                {active.summary}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  to={`/book-demo?demo=${active.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-all duration-300 hover:border-signal-dim hover:shadow-[0_0_20px_rgba(94,234,212,0.15)]"
                >
                  <Video size={15} className="text-signal" aria-hidden="true" />
                  Book a live demo
                </Link>
                <Link
                  to={`/demos/${active.slug}`}
                  className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-signal"
                >
                  How it works
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {active.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
