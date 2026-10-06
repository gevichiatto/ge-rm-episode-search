interface PortalLogoProps {
  className?: string;
}

/** Portal verde, puramente decorativo. */
export function PortalLogo({ className }: PortalLogoProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <circle cx="32" cy="32" r="30" fill="#0b1f14" />
      <g fill="none" strokeLinecap="round">
        <circle cx="32" cy="32" r="26" stroke="#39ff7a" strokeWidth="5" />
        <path d="M32 12a20 20 0 1 1-18 11" stroke="#b6ff5c" strokeWidth="4" />
        <path d="M32 22a10 10 0 1 0 9 6" stroke="#39ff7a" strokeWidth="4" />
      </g>
      <circle cx="32" cy="32" r="3" fill="#eaffd0" />
    </svg>
  );
}
