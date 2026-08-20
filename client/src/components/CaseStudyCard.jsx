import GlowCard from "./ui/GlowCard";

export default function CaseStudyCard({ caseStudy }) {
  return (
    <GlowCard className="h-full">
      <span className="inline-flex items-center rounded-full border border-signal-dim px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-signal">
        Concept Project
      </span>
      <h3 className="mt-4 font-display text-lg font-medium text-ink">{caseStudy.title}</h3>

      <dl className="mt-5 space-y-4">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Problem</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{caseStudy.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Solution</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{caseStudy.solution}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">Outcome</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">{caseStudy.outcome}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {caseStudy.technology.map((t) => (
          <span key={t} className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-faint">
            {t}
          </span>
        ))}
      </div>
    </GlowCard>
  );
}
