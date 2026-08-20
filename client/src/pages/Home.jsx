import Hero from "../components/sections/Hero";
import CapabilityStrip from "../components/sections/CapabilityStrip";
import Services from "../components/sections/Services";
import AIEngineering from "../components/sections/AIEngineering";
import AgenticAI from "../components/sections/AgenticAI";
import SoftwareEngineering from "../components/sections/SoftwareEngineering";
import DataInfrastructure from "../components/sections/DataInfrastructure";
import ComputerVision from "../components/sections/ComputerVision";
import TechEcosystem from "../components/sections/TechEcosystem";
import Process from "../components/sections/Process";
import Solutions from "../components/sections/Solutions";
import CaseStudies from "../components/sections/CaseStudies";
import MetricsCTA from "../components/sections/MetricsCTA";
import { usePageMeta } from "../hooks/usePageMeta";

export default function Home() {
  usePageMeta(
    null,
    "NeovationLabs builds AI-powered software, intelligent data infrastructure, autonomous workflows, and production-ready machine learning systems."
  );
  return (
    <>
      <Hero />
      <CapabilityStrip />
      <Services />
      <AIEngineering />
      <AgenticAI />
      <SoftwareEngineering />
      <DataInfrastructure />
      <ComputerVision />
      <TechEcosystem />
      <Process />
      <Solutions />
      <CaseStudies />
      <MetricsCTA />
    </>
  );
}
