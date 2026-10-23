// Marca de Pulso: línea de pulso cardíaco sobre el rojo de emergencia.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#b91c1c" />
      <path
        d="M4 17h6l2.5-6 3.5 12 3-15 2.5 9H28"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
