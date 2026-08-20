import PageHero from "../components/ui/PageHero";
import TechEcosystem from "../components/sections/TechEcosystem";
import Process from "../components/sections/Process";
import MetricsCTA from "../components/sections/MetricsCTA";

export default function TechnologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Technology"
        title="A pragmatic, production-tested stack."
        description="We choose technology per project, not by default — the stack below is what we reach for most often, matched to what a system actually needs."
      />
      <TechEcosystem />
      <Process />
      <MetricsCTA />
    </>
  );
}
