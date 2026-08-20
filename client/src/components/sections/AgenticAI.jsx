import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import FlowDiagram from "../ui/FlowDiagram";

const steps = [
  "User Request",
  "AI Orchestrator",
  "Reasoning",
  "Tools",
  "Database",
  "APIs",
  "Business Systems",
  "Result",
];

export default function AgenticAI() {
  return (
    <section className="border-t border-line bg-surface/40 py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <div className="order-2 md:order-1">
          <FlowDiagram steps={steps} />
        </div>
        <SectionHeading
          className="order-1 md:order-2"
          eyebrow="Agentic AI"
          title="AI Agents That Actually Get Work Done."
          description="NeovationLabs builds autonomous systems capable of planning, reasoning, using tools, accessing data, and executing multi-step operational workflows — with human review built in at the points that actually matter."
        />
      </Container>
    </section>
  );
}
