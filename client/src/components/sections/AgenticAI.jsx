import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import NeuralModels from "../ui/NeuralModels";

export default function AgenticAI() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-surface/40 py-24 md:py-32">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_30%_50%,black,transparent_70%)]" />
      <Container className="relative grid gap-14 md:grid-cols-2 md:items-center md:gap-14">
        <div className="order-2 md:order-1">
          <NeuralModels />
        </div>
        <SectionHeading
          className="order-1 md:order-2"
          eyebrow="LLMs & CNNs"
          title="Models That Read, See, and Decide."
          description="Large language models for text and reasoning, convolutional networks for images and inspection. We choose, fine-tune, and deploy the architecture that fits your data — then instrument it so it stays accurate once it meets real traffic."
        />
      </Container>
    </section>
  );
}
