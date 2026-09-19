// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";

/** Light / dark switch. Light is the default; the choice is remembered. */
export default function ThemeToggle({ className }) {
  const [theme, toggle] = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
      className={cn(
        "group relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border border-line bg-surface transition-colors duration-300 hover:border-signal-dim",
        className
      )}
    >
      <Sun
        size={13}
        aria-hidden="true"
        className={cn(
          "absolute left-2 transition-opacity duration-300",
          dark ? "text-ink-faint opacity-70" : "opacity-0"
        )}
      />
      <Moon
        size={13}
        aria-hidden="true"
        className={cn(
          "absolute right-2 transition-opacity duration-300",
          dark ? "opacity-0" : "text-ink-faint opacity-70"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-void shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          dark ? "translate-x-[1.75rem]" : "translate-x-0"
        )}
      >
        {dark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}
