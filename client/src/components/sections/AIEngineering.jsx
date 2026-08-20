import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import FlowDiagram from "../ui/FlowDiagram";

const steps = [
  "User",
  "Application",
  "AI Layer",
  "Agents / LLM",
  "Data / Knowledge",
  "Infrastructure",
  "Business Systems",
];

export default function AIEngineering() {
  return (
    <section className="border-t border-line bg-void py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <SectionHeading
          eyebrow="AI Engineering"
          title="AI That Moves Beyond the Prototype."
          description="A working demo is easy. A system that stays accurate, observable, and secure under real traffic is the actual engineering problem — and it's where we spend most of our time. Every layer, from the application down to infrastructure, is built to be monitored and maintained, not just shipped once."
        />
        <div>
          <FlowDiagram steps={steps} />
        </div>
      </Container>
    </section>
  );
}
