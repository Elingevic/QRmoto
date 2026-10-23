import Link from "next/link";
import Logo from "@/components/Logo";

export default function NoEncontrado() {
  return (
    <main className="grid min-h-dvh place-items-center bg-stone-100 px-4 text-center text-stone-900">
      <div className="max-w-sm">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="mt-4 text-2xl font-extrabold">Este QR no está registrado</h1>
        <p className="mt-2 text-sm text-stone-600">
          El código no existe o fue dado de baja. Si estás ante una emergencia, llama al 911.
        </p>
        <div className="mt-6 grid gap-3">
          <a href="tel:911" className="rounded-xl bg-red-700 py-3 font-bold text-white">
            📞 Llamar al 911
          </a>
          <Link href="/" className="rounded-xl bg-white py-3 font-bold shadow-sm">
            Ir a Pulso
          </Link>
        </div>
      </div>
    </main>
  );
}
