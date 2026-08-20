import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import LayeredStack from "../ui/LayeredStack";
import TechnologyBadge from "../ui/TechnologyBadge";

const technologies = [
  "React", "Node.js", "Express", "MongoDB", "PostgreSQL",
  "Python", "FastAPI", "Docker", "Kubernetes", "REST APIs",
  "GraphQL", "WebSockets", "Cloud infrastructure",
];

export default function SoftwareEngineering() {
  return (
    <section className="border-t border-line bg-void py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <SectionHeading
            eyebrow="Software Engineering"
            title="Full-Stack Foundations, Built to Carry AI."
            description="AI features are only as reliable as the application underneath them. We build the same disciplined full-stack architecture whether or not a project has an AI layer at all — then add intelligence where it earns its place."
          />
          <div className="mt-8">
            <div className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
              Technologies we work with
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {technologies.map((t) => (
                <TechnologyBadge key={t}>{t}</TechnologyBadge>
              ))}
            </div>
          </div>
        </div>
        <LayeredStack />
      </Container>
    </section>
  );
}
