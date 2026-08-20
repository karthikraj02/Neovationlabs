import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function AnimatedGrid({ children, className, cols = "sm:grid-cols-2 lg:grid-cols-4" }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={cn("grid grid-cols-1 gap-4", cols, className)}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={child?.key ?? i} variants={item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
