import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

const base =
  "group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4";

const variants = {
  primary:
    "bg-ink text-void hover:shadow-[0_0_0_1px_rgba(94,234,212,0.4),0_0_24px_rgba(94,234,212,0.35)] hover:-translate-y-0.5",
  secondary:
    "border border-line text-ink hover:border-ink-faint hover:bg-surface-raised hover:-translate-y-0.5",
  ghost: "text-ink-dim hover:text-ink",
};

export default function Button({
  children,
  to,
  href,
  onClick,
  type = "button",
  variant = "primary",
  withArrow = true,
  className,
}) {
  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
    </>
  );

  const classes = cn(base, variants[variant], className);

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
