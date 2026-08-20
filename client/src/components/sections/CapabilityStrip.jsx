const capabilities = [
  "Generative AI",
  "Agentic Systems",
  "Computer Vision",
  "Data Engineering",
  "MLOps",
  "Predictive Analytics",
  "Custom Software",
  "LLM Applications",
];

export default function CapabilityStrip() {
  const track = [...capabilities, ...capabilities];
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/60 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
      <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-10 motion-reduce:animate-none">
        {track.map((item, i) => (
          <div key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-mono text-sm uppercase tracking-[0.15em] text-ink-faint">
              {item}
            </span>
            <span className="h-1 w-1 rounded-full bg-ink-faint" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
