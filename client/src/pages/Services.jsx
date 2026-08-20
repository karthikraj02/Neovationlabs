import { Link } from "react-router-dom";
import PageHero from "../components/ui/PageHero";
import Container from "../components/ui/Container";
import GlowCard from "../components/ui/GlowCard";
import AnimatedGrid from "../components/ui/AnimatedGrid";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import MetricsCTA from "../components/sections/MetricsCTA";
import { useApiResource } from "../hooks/useApiResource";
import { usePageMeta } from "../hooks/usePageMeta";
import { fetchServices } from "../lib/api";
import { services as staticServices } from "../data/services";

// Normalizes both the API document shape and the bundled static shape to
// one set of fields the card can render regardless of source.
const fallback = staticServices.map((s) => ({
  slug: s.slug,
  name: s.name,
  shortDescription: s.short,
  capabilities: s.capabilities,
}));

export default function ServicesPage() {
  usePageMeta(
    "Services",
    "Generative AI, custom software, computer vision, agentic workflows, data engineering, MLOps, and predictive analytics."
  );
  const { status, data, usedFallback, retry } = useApiResource(fetchServices, { fallback });

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Seven disciplines. One production standard."
        description="Every engagement draws from the same set of capabilities — combined differently depending on what the problem actually needs."
      />

      <section className="bg-void py-20 md:py-24">
        <Container>
          {usedFallback && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-dim">
              <span>Showing saved service details — couldn't reach the live API just now.</span>
              <button
                type="button"
                onClick={retry}
                className="text-signal hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {status === "loading" && <LoadingSpinner label="Loading services" />}

          {status === "error" && (
            <ErrorMessage
              title="Couldn't load services"
              description="We weren't able to reach the API. Check your connection and try again."
              onRetry={retry}
            />
          )}

          {status === "success" && data.length === 0 && (
            <ErrorMessage variant="empty" title="No services published yet." />
          )}

          {status === "success" && data.length > 0 && (
            <AnimatedGrid cols="md:grid-cols-2">
              {data.map((service, i) => (
                <Link key={service.slug} to={`/services/${service.slug}`}>
                  <GlowCard className="h-full">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs text-ink-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-xs text-ink-faint transition-colors duration-300 group-hover:text-signal">
                        →
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-medium text-ink">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-dim">
                      {service.shortDescription}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {(service.capabilities || []).slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-line-soft px-2.5 py-1 font-mono text-[10px] text-ink-faint"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </GlowCard>
                </Link>
              ))}
            </AnimatedGrid>
          )}
        </Container>
      </section>

      <MetricsCTA />
    </>
  );
}
