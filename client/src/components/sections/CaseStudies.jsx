import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import AnimatedGrid from "../ui/AnimatedGrid";
import CaseStudyCard from "../CaseStudyCard";
import { caseStudies } from "../../data/caseStudies";

export default function CaseStudies() {
  return (
    <section className="border-t border-line bg-surface/40 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Concept Projects"
          title="What This Looks Like End to End."
          description="NeovationLabs is a new studio — these are illustrative concept projects showing how a problem, solution, and technology choice fit together, not claims about existing clients or results."
        />
        <div className="mt-14">
          <AnimatedGrid cols="sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.slug} caseStudy={cs} />
            ))}
          </AnimatedGrid>
        </div>
      </Container>
    </section>
  );
}
