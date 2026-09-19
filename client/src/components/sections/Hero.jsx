// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Button from "../ui/Button";
import Container from "../ui/Container";
import HeroCore from "../ui/HeroCore";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-void pt-16 md:pt-20">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-signal/5 blur-[120px]" />

      <Container className="relative grid items-center gap-14 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center gap-2 border-l-2 border-signal pl-3 font-mono text-xs uppercase tracking-[0.2em] text-signal"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            System status: engineering AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance font-display text-[2.6rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl md:text-[3.6rem]"
          >
            Build What's <span className="text-signal">Next</span> With AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-ink-dim"
          >
            NeovationLabs engineers intelligent software, AI systems, autonomous
            workflows, and data infrastructure for businesses ready to
            operate at the next level.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button to="/contact" variant="primary">
              Start a Project
            </Button>
            <Button to="/services" variant="secondary" withArrow={false}>
              Explore Services
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[30rem]"
        >
          <HeroCore />
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-ink-faint" />
        </motion.div>
      </motion.div>
    </section>
  );
}
