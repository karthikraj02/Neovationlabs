import { useParams, Navigate, Link } from "react-router-dom";
import Container from "../components/ui/Container";
import InsightCard from "../components/InsightCard";
import JsonLd from "../components/ui/JsonLd";
import MetricsCTA from "../components/sections/MetricsCTA";
import { usePageMeta } from "../hooks/usePageMeta";
import { getInsightBySlug, insights } from "../data/insights";

export default function InsightDetail() {
  const { slug } = useParams();
  const insight = getInsightBySlug(slug);

  usePageMeta(insight?.title, insight?.excerpt);

  if (!insight) return <Navigate to="/404" replace />;

  const related = insights.filter((i) => i.slug !== slug).slice(0, 2);
  const formattedDate = new Date(insight.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: insight.title,
          description: insight.excerpt,
          datePublished: insight.date,
          author: { "@type": "Organization", name: insight.author },
          publisher: { "@type": "Organization", name: "NeovationLabs" },
        }}
      />

      <article className="border-b border-line bg-void pt-32 pb-20 md:pt-40 md:pb-24">
        <Container className="max-w-2xl">
          <Link to="/insights" className="text-sm text-ink-dim hover:text-ink">
            ← Insights
          </Link>
          <span className="mt-6 block rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-signal w-fit">
            {insight.category}
          </span>
          <h1 className="mt-5 text-balance font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
            {insight.title}
          </h1>
          <div className="mt-5 flex items-center gap-3 font-mono text-xs text-ink-faint">
            <span>{insight.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{insight.readingTime}</span>
          </div>

          <div className="mt-10 space-y-5 text-base leading-relaxed text-ink-dim">
            {(insight.content && insight.content.length > 0
              ? insight.content
              : [insight.excerpt]
            ).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </article>

      <section className="border-b border-line bg-surface/40 py-20">
        <Container>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
            Related reading
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {related.map((i) => (
              <InsightCard key={i.slug} insight={i} />
            ))}
          </div>
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
