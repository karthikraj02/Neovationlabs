import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const boxes = [
  { x: 8, y: 14, w: 26, h: 46, label: "PERSON", confidence: "98.4%", delay: 0.2 },
  { x: 42, y: 52, w: 34, h: 24, label: "CAR", confidence: "96.1%", delay: 0.5 },
  { x: 66, y: 10, w: 20, h: 18, label: "PACKAGE", confidence: "91.7%", delay: 0.8 },
];

export default function ComputerVision() {
  return (
    <section className="border-t border-line bg-surface/40 py-24 md:py-32">
      <Container className="grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <SectionHeading
          eyebrow="Computer Vision"
          title="Visual Data, Read in Real Time."
          description="We build detection and classification systems tuned to your cameras, lighting, and inspection criteria — illustrated below as a simplified, non-production feed."
        />

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-void">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-line bg-void/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-signal backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            Illustrative feed
          </div>

          {boxes.map((box) => (
            <motion.div
              key={box.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: box.delay, duration: 0.6 }}
              className="absolute border border-signal/70"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                boxShadow: "0 0 0 1px rgba(94,234,212,0.08), inset 0 0 20px rgba(94,234,212,0.05)",
              }}
            >
              <div className="absolute -top-6 left-0 whitespace-nowrap rounded bg-signal px-1.5 py-0.5 font-mono text-[9px] font-medium text-void">
                {box.label} · {box.confidence}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
