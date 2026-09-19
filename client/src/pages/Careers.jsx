// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { Mail } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import { usePageMeta } from "../hooks/usePageMeta";

const CAREERS_EMAIL = "neovationlabs@outlook.com";

const lookingFor = [
  {
    title: "Engineers who ship",
    body: "You care about getting working systems into production, not just prototypes that look good in a demo.",
  },
  {
    title: "Curious across the stack",
    body: "AI, software, data, networking, or connected devices — you enjoy learning the parts of a system you haven't worked on yet.",
  },
  {
    title: "Clear communicators",
    body: "You can explain a technical trade-off to a client as comfortably as you can discuss it with another engineer.",
  },
];

export default function Careers() {
  usePageMeta(
    "Careers",
    "Work with NeovationLabs — send us your CV and tell us what you'd like to build."
  );

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build what's next with us."
        description="We're a small engineering team building AI systems, software, and the infrastructure underneath them. We're always glad to hear from people who want to do that work well."
      />

      <section className="bg-void pb-24 md:pb-32">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">What we look for</div>
            <ul className="mt-6 space-y-6">
              {lookingFor.map(({ title, body }) => (
                <li key={title} className="border-l-2 border-line pl-4">
                  <div className="text-sm text-ink">{title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-dim">{body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-fit rounded-2xl border border-line bg-surface p-6 md:p-8">
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-signal">Open roles</div>
            <h2 className="mt-3 font-display text-xl font-medium text-ink">No open positions are listed right now.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              Send your CV along with a link to your GitHub or portfolio, and a few lines on what
              you'd like to work on. We keep every application on file and reach out when a role
              fits.
            </p>
            <a
              href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent("Careers — application")}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-void transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(94,234,212,0.35)]"
            >
              <Mail size={15} />
              {CAREERS_EMAIL}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
