import { notFound } from "next/navigation";
import FormFicha from "@/components/FormFicha";
import { obtenerPorGestion } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Editar mi ficha · Pulso",
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
  const { codigo: _codigo, ...inicial } = m;
  void _codigo;
  return <FormFicha modo={{ tipo: "editar", gestion }} inicial={inicial} />;
}
