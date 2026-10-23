import { notFound } from "next/navigation";
import BotonImprimir from "@/components/BotonImprimir";
import Sticker from "@/components/Sticker";
import { obtenerMotorizado, vistaPublica } from "@/lib/store";
import { urlBase } from "@/lib/url";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sticker demo · QRmoto",
  robots: { index: false, follow: false },
};

// Solo el perfil demo tiene sticker público (para presentaciones). El sticker
// de un motorizado real se imprime desde su panel privado /mi/<token>.
export default async function Pagina({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const m = await obtenerMotorizado(codigo);
  if (!m?.demo) notFound();

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 text-stone-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold print:hidden">Sticker del perfil demo</h1>
        <Sticker d={vistaPublica(m)} url={`${await urlBase()}/r/${codigo}`} />
        <div className="mt-8 grid print:hidden">
          <BotonImprimir />
        </div>
      </div>
    </main>
  );
}
