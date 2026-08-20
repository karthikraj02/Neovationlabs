import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_2px_rgba(94,234,212,0.6)]" />
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="text-balance font-display text-3xl font-medium leading-[1.15] tracking-tight text-ink sm:text-4xl md:text-[2.75rem]"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-4 text-balance text-base leading-relaxed text-ink-dim md:text-lg"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
