import PageHero from "../components/ui/PageHero";
import Solutions from "../components/sections/Solutions";
import MetricsCTA from "../components/sections/MetricsCTA";

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Solutions built for how your business actually runs."
        description="Each of these is a starting shape, not a fixed package — every engagement is adapted to your data, systems, and constraints."
      />
      <Solutions />
      <MetricsCTA />
    </>
  );
}
