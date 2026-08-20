export default function Logo({ className = "h-7 w-7", mono = false }) {
  const accent = mono ? "currentColor" : "#5eead4";
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="NeovationLabs logo"
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="currentColor" strokeOpacity="0.18" />
      <path
        d="M9 23V9L23 23V9"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2" fill={accent} />
      <circle cx="23" cy="23" r="2" fill={accent} />
      <circle cx="9" cy="23" r="1.4" fill="currentColor" fillOpacity="0.5" />
      <circle cx="23" cy="9" r="1.4" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
