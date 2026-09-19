// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useParams, Navigate, Link } from "react-router-dom";
import { ShieldCheck, Compass, Video } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";
import GlowCard from "../components/ui/GlowCard";
import VideoPlayer from "../components/ui/VideoPlayer";
import JsonLd from "../components/ui/JsonLd";
import MetricsCTA from "../components/sections/MetricsCTA";
import { usePageMeta } from "../hooks/usePageMeta";
import { demos, getDemoBySlug } from "../data/demos";

export default function DemoDetail() {
  const { slug } = useParams();
  const demo = getDemoBySlug(slug);

  usePageMeta(demo?.title, demo?.summary);

  if (!demo) return <Navigate to="/404" replace />;

  const others = demos.filter((d) => d.slug !== slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: demo.title,
          description: demo.summary,
          thumbnailUrl: `https://neovationlabs.ai${demo.poster}`,
          contentUrl: `https://neovationlabs.ai${demo.video}`,
        }}
      />
      <PageHero eyebrow="Demo" title={demo.title} description={demo.tagline} />

      <section className="border-b border-line bg-void py-16 md:py-20">
        <Container>
          <VideoPlayer
            src={demo.video}
            poster={demo.poster}
            width={demo.width}
            height={demo.height}
            title={demo.title}
            label={demo.discipline}
            duration={demo.duration}
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to={`/book-demo?demo=${demo.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-void transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgb(var(--signal-rgb)/0.35)]"
            >
              <Video size={16} aria-hidden="true" />
              Book a live demo of this
            </Link>
            <p className="text-sm text-ink-dim">
              We'll run the real application on a Google Meet call and answer questions live.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11px] text-ink-faint">{demo.note}</p>
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
        </Container>
      </section>

      <section className="border-b border-line bg-void py-20 md:py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <GlowCard>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
              The problem
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">{demo.problem}</p>
          </GlowCard>
          <GlowCard>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-signal">
              The approach
            </div>
            <p className="mt-4 text-base leading-relaxed text-ink">{demo.approach}</p>
          </GlowCard>
        </Container>
      </section>

      <section className="border-b border-line bg-surface/40 py-20 md:py-24">
        <Container>
          <SectionHeading eyebrow="How it works" title="What the recording is doing." />
          <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {demo.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <span className="font-mono text-xs text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-b border-line bg-void py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Use cases"
            title="Where this earns its place."
            description={demo.differentiator}
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demo.useCases.map((uc) => (
              <GlowCard key={uc.title} className="h-full">
                <h3 className="font-display text-base font-medium leading-snug text-ink">
                  {uc.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{uc.body}</p>
              </GlowCard>
            ))}
          </div>
        </Container>
      </section>

      {demo.roadmap && (
        <section className="border-b border-line bg-surface/40 py-20 md:py-24">
          <Container>
            <SectionHeading
              eyebrow="Next"
              title="Where this is heading."
              description="Capabilities planned for the next phase of this prototype — not part of the recording above."
            />
            <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
              {demo.roadmap.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <Compass size={16} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-ink-dim">{item}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {demo.responsibleUse && (
        <section className="border-b border-line bg-void py-20 md:py-24">
          <Container className="max-w-3xl">
            <SectionHeading
              eyebrow="Responsible use"
              title="How this should be deployed."
              description="Identifying a named individual across physical space is a more sensitive capability than general monitoring. Any real deployment should meet these conditions."
            />
            <ul className="mt-10 space-y-3">
              {demo.responsibleUse.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-signal"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-ink-dim">{item}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="border-b border-line bg-surface/40 py-20 md:py-24">
        <Container>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
            Other demos
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {others.map((d) => (
              <Link
                key={d.slug}
                to={`/demos/${d.slug}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink"
              >
                {d.title}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
