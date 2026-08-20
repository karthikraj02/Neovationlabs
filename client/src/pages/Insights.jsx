import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import AnimatedGrid from "../components/ui/AnimatedGrid";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import InsightCard from "../components/InsightCard";
import { useApiResource } from "../hooks/useApiResource";
import { usePageMeta } from "../hooks/usePageMeta";
import { fetchInsights } from "../lib/api";
import { insights as staticInsights } from "../data/insights";

const fallback = staticInsights.map((i) => ({ ...i }));

export default function Insights() {
  usePageMeta("Insights", "Practical writing on AI engineering, agentic systems, and production software.");
  const { status, data, usedFallback, retry } = useApiResource(fetchInsights, { fallback });

  const normalized = (data || []).map((i) => ({
    ...i,
    date: i.date || i.publishedAt,
  }));

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Notes from production."
        description="Practical writing on AI engineering, agentic systems, and building software that holds up under real usage."
      />
      <section className="bg-void pb-24 md:pb-32">
        <Container>
          {usedFallback && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-dim">
              <span>Showing saved articles — couldn't reach the live API just now.</span>
              <button type="button" onClick={retry} className="text-signal hover:underline">
                Retry
              </button>
            </div>
          )}

          {status === "loading" && <LoadingSpinner label="Loading insights" />}

          {status === "error" && (
            <ErrorMessage
              title="Couldn't load insights"
              description="We weren't able to reach the API. Check your connection and try again."
              onRetry={retry}
            />
          )}

          {status === "success" && normalized.length === 0 && (
            <ErrorMessage variant="empty" title="Nothing published yet — check back soon." />
          )}

          {status === "success" && normalized.length > 0 && (
            <AnimatedGrid cols="sm:grid-cols-2 lg:grid-cols-3">
              {normalized.map((insight) => (
                <InsightCard key={insight.slug} insight={insight} />
              ))}
            </AnimatedGrid>
          )}
        </Container>
      </section>
    </>
  );
}
