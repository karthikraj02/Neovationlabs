import { cn } from "../../lib/utils";

export default function GlowCard({ children, className, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all duration-500",
        "hover:-translate-y-1 hover:border-signal-dim hover:bg-surface-raised",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--x,50%) var(--y,0%), rgba(94,234,212,0.10), transparent 60%)",
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
        }}
      />
      {children}
    </Tag>
  );
}
