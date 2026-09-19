// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "../../lib/utils";

// Poster-first player: the MP4 is only fetched once someone presses play, so a
// page with several demos on it costs nothing until a visitor asks for one.
export default function VideoPlayer({
  src,
  poster,
  width,
  height,
  title,
  label,
  duration,
  className,
}) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    // The <video> is already mounted (only its controls are toggled), so this
    // play() call stays inside the click gesture and is allowed to use sound.
    // Fall back to muted playback if a browser refuses anyway.
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-void",
        className
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="none"
        controls={started}
        playsInline
        title={title}
        className="h-full w-full object-cover"
      />

      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`Play demo: ${title}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-void/45 transition-colors duration-500 hover:bg-void/25"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-signal-dim bg-void/80 text-signal backdrop-blur transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(94,234,212,0.35)]">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
          {(label || duration) && (
            <span className="flex items-center gap-2 rounded-full border border-line bg-void/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-dim backdrop-blur">
              {label && <span>{label}</span>}
              {label && duration && <span className="text-ink-faint">·</span>}
              {duration && <span>{duration}</span>}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
