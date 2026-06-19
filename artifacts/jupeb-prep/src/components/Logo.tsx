export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="12" fill="#F97316"/>
      <path d="M22 10H26V24C26 27.314 23.314 30 20 30C16.686 30 14 27.314 14 24V22H18V24C18 25.105 18.895 26 20 26C21.105 26 22 25.105 22 24V10Z" fill="white"/>
      <rect x="10" y="8" width="14" height="3" rx="1.5" fill="white" opacity="0.35"/>
    </svg>
  );
}

export function LogoFull({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={40} />
      <div>
        <p className={`font-black text-lg leading-none tracking-tight ${dark ? "text-gray-900" : "text-white"}`}>
          JUPEB Prep
        </p>
        <p className={`text-[10px] tracking-widest uppercase mt-0.5 ${dark ? "text-gray-400" : "text-white/40"}`}>
          Foundation Studies
        </p>
      </div>
    </div>
  );
}
