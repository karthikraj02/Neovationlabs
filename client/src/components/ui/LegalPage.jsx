import Container from "./Container";

export default function LegalPage({ title, updated, children }) {
  return (
    <section className="bg-void pt-32 pb-24 md:pt-40 md:pb-32">
      <Container className="max-w-2xl">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-xs text-ink-faint">Last updated {updated}</p>
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink-dim [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-ink [&_h2]:first:mt-0">
          {children}
        </div>
      </Container>
    </section>
  );
}
