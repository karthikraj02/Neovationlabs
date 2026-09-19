// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import TechIcon from "./TechIcon";

export default function TechnologyBadge({ children, icon = false }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-xs text-ink-dim transition-colors duration-300 hover:border-signal-dim hover:text-ink">
      {icon && <TechIcon name={children} />}
      {children}
    </span>
  );
}
