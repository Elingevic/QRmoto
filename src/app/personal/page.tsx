import Marca from "@/components/Marca";
import { personalActual } from "@/lib/sesion";
import FormPersonal from "./FormPersonal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Personal verificado · Pulso" };

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
  // Solo se permite volver a una ficha de QR o al panel, nunca a un sitio externo.
  const destino = volver && /^\/(r\/[\w-]+|panel)$/.test(volver) ? volver : null;
  const p = await personalActual();

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-10 text-stone-900">
      <div className="mx-auto max-w-sm">
        <Marca />
        <h1 className="mt-1 text-2xl font-extrabold">Personal verificado</h1>
        <p className="mt-2 text-sm text-stone-600">
          Para paramédicos, bomberos y clínicas aliadas. Inicias sesión una vez y, al escanear un
          casco, ves la identidad, la póliza y los contactos del motorizado.
        </p>
        <FormPersonal
          destino={destino}
          sesion={p ? { nombre: p.nombre, institucion: p.institucion } : null}
        />
      </div>
    </main>
  );
}
