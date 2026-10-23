import Link from "next/link";
import { notFound } from "next/navigation";
import BotonImprimir from "@/components/BotonImprimir";
import Sticker from "@/components/Sticker";
import { obtenerPorGestion, vistaPublica } from "@/lib/store";
import { urlBase } from "@/lib/url";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tu sticker · Pulso",
  robots: { index: false, follow: false },
};

export default async function Pagina({
  params,
}: {
  params: Promise<{ gestion: string }>;
}) {
  const { gestion } = await params;
  const m = await obtenerPorGestion(gestion);
  if (!m) notFound();

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 text-stone-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-lg">
        <div className="print:hidden">
          <Link href={`/mi/${gestion}`} className="text-sm font-semibold text-stone-600">
            ← Volver a mi panel
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold">Tu sticker y tarjeta</h1>
          <p className="mt-2 text-sm text-stone-600">
            Pega el sticker en la parte trasera del casco. Guarda la tarjeta con tu cédula.
          </p>
        </div>
        <Sticker d={vistaPublica(m)} url={`${await urlBase()}/r/${m.codigo}`} />
        <div className="mt-8 grid print:hidden">
          <BotonImprimir />
        </div>
      </div>
    </main>
  );
}
