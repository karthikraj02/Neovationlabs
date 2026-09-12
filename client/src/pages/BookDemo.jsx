import { Link, useSearchParams } from "react-router-dom";
import { Video, Clock, Users, ShieldCheck } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import BookDemoForm from "../components/BookDemoForm";
import { usePageMeta } from "../hooks/usePageMeta";

const points = [
  {
    icon: Video,
    title: "Live on Google Meet",
    body: "We share our screen and run the real application — not a recording and not a slide deck.",
  },
  {
    icon: Clock,
    title: "30 to 45 minutes",
    body: "Long enough to walk the system end to end and still leave room for your questions.",
  },
  {
    icon: Users,
    title: "Bring your team",
    body: "Invite whoever needs to see it — engineering, operations, or whoever signs off.",
  },
  {
    icon: ShieldCheck,
    title: "Run against your case",
    body: "Tell us your setup ahead of the call and we'll frame the walkthrough around it.",
  },
];

export default function BookDemo() {
  const [params] = useSearchParams();
  const preselected = params.get("demo") || "";

  usePageMeta(
    "Book a Live Demo",
    "Book a live Google Meet walkthrough of a NeovationLabs system — we run the real application against your use case and answer questions on the call."
  );

  return (
    <>
      <PageHero
        eyebrow="Book a live demo"
        title="See it running, live, with our team."
        description="Pick the systems you want to see and a slot that suits you. We'll confirm by email and send a Google Meet link for the call."
      />

      <section className="bg-void pb-24 md:pb-32">
        <Container className="grid gap-14 md:grid-cols-[0.9fr_1.4fr] md:gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
              What to expect
            </div>
            <ul className="mt-6 space-y-6">
              {points.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-signal">
                    <Icon size={15} />
                  </span>
                  <div>
                    <div className="text-sm text-ink">{title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 rounded-xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink-dim">
              Prefer to watch first? The recorded demos are on the{" "}
              <Link to="/demos" className="text-signal hover:underline">
                demos page
              </Link>{" "}
              — no booking needed.
            </p>
          </div>

          <BookDemoForm preselected={preselected} />
        </Container>
      </section>
    </>
  );
}
