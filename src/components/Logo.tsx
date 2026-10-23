// Marca de QRmoto: esquina de código QR con una cruz médica.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#b91c1c" />
      <rect x="5" y="5" width="10" height="10" rx="2.5" fill="none" stroke="#fff" strokeWidth="2.5" />
      <rect x="8.5" y="8.5" width="3" height="3" rx="0.8" fill="#fff" />
      <rect x="5" y="19" width="4" height="4" rx="1" fill="#fff" />
      <rect x="11" y="23" width="4" height="4" rx="1" fill="#fff" />
      <path d="M21.5 15.5h3v3.5H28v3h-3.5v3.5h-3V22H18v-3h3.5z" fill="#fff" />
    </svg>
  );
}
