import Link from "next/link";
import Logo from "./Logo";

// Encabezado de marca de las páginas internas; lleva a la portada.
export default function Marca() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-stone-900">
      <Logo className="h-6 w-6" />
      Pulso
    </Link>
  );
}
