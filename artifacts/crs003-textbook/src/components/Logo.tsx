export function CRSLogo({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JUPEB CRS Logo"
    >
      {/* Outer circle */}
      <circle cx="60" cy="60" r="58" stroke="#d97706" strokeWidth="2.5" fill="none" opacity="0.35" />
      <circle cx="60" cy="60" r="52" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.2" />

      {/* Open book — left page */}
      <path
        d="M20 76 C20 76 20 44 22 42 C24 40 40 38 58 40 L58 82 C40 80 22 82 20 82 Z"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Left page lines */}
      <line x1="27" y1="52" x2="52" y2="51" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="27" y1="57" x2="52" y2="56" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="27" y1="62" x2="52" y2="61" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="27" y1="67" x2="52" y2="66" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="27" y1="72" x2="52" y2="72" stroke="#d97706" strokeWidth="1" opacity="0.45" />

      {/* Open book — right page */}
      <path
        d="M100 76 C100 76 100 44 98 42 C96 40 80 38 62 40 L62 82 C80 80 98 82 100 82 Z"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Right page lines */}
      <line x1="93" y1="52" x2="68" y2="51" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="93" y1="57" x2="68" y2="56" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="93" y1="62" x2="68" y2="61" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="93" y1="67" x2="68" y2="66" stroke="#d97706" strokeWidth="1" opacity="0.45" />
      <line x1="93" y1="72" x2="68" y2="72" stroke="#d97706" strokeWidth="1" opacity="0.45" />

      {/* Book spine / center fold */}
      <path
        d="M60 40 Q60 61 60 82"
        stroke="#b45309"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Book bottom curve */}
      <path
        d="M20 82 Q60 86 100 82"
        stroke="#d97706"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cross — centered on spine, above book */}
      {/* Vertical bar */}
      <rect x="57" y="16" width="6" height="26" rx="1.5" fill="#f59e0b" />
      {/* Horizontal bar */}
      <rect x="49" y="23" width="22" height="6" rx="1.5" fill="#f59e0b" />
      {/* Cross glow/highlight */}
      <rect x="58.5" y="17" width="3" height="12" rx="1" fill="white" opacity="0.3" />

      {/* Small dots at circle compass points for ornamentation */}
      <circle cx="60" cy="5"  r="2" fill="#d97706" opacity="0.5" />
      <circle cx="60" cy="115" r="2" fill="#d97706" opacity="0.5" />
      <circle cx="5"  cy="60" r="2" fill="#d97706" opacity="0.5" />
      <circle cx="115" cy="60" r="2" fill="#d97706" opacity="0.5" />
    </svg>
  );
}

export function CRSLogomark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JUPEB CRS"
    >
      <circle cx="60" cy="60" r="58" stroke="#d97706" strokeWidth="3" fill="#1c1917" opacity="1" />

      {/* Open book — left */}
      <path
        d="M20 76 C20 76 20 44 22 42 C24 40 40 38 58 40 L58 82 C40 80 22 82 20 82 Z"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1.8"
      />
      <line x1="27" y1="55" x2="52" y2="54" stroke="#d97706" strokeWidth="1" opacity="0.5" />
      <line x1="27" y1="62" x2="52" y2="61" stroke="#d97706" strokeWidth="1" opacity="0.5" />
      <line x1="27" y1="69" x2="52" y2="69" stroke="#d97706" strokeWidth="1" opacity="0.5" />

      {/* Open book — right */}
      <path
        d="M100 76 C100 76 100 44 98 42 C96 40 80 38 62 40 L62 82 C80 80 98 82 100 82 Z"
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth="1.8"
      />
      <line x1="93" y1="55" x2="68" y2="54" stroke="#d97706" strokeWidth="1" opacity="0.5" />
      <line x1="93" y1="62" x2="68" y2="61" stroke="#d97706" strokeWidth="1" opacity="0.5" />
      <line x1="93" y1="69" x2="68" y2="69" stroke="#d97706" strokeWidth="1" opacity="0.5" />

      <path d="M60 40 Q60 61 60 82" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 82 Q60 86 100 82" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Cross */}
      <rect x="57" y="16" width="6" height="26" rx="1.5" fill="#f59e0b" />
      <rect x="49" y="23" width="22" height="6" rx="1.5" fill="#f59e0b" />
      <rect x="58.5" y="17" width="3" height="12" rx="1" fill="white" opacity="0.25" />
    </svg>
  );
}
