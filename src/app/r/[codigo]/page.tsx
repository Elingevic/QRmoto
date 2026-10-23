import { notFound } from "next/navigation";
import { personalActual } from "@/lib/sesion";
import {
  obtenerMotorizado,
  registrarEvento,
  vistaCompleta,
  vistaPublica,
} from "@/lib/store";
import VistaEscaneo from "./VistaEscaneo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Emergencia médica · QRmoto",
  robots: { index: false, follow: false },
};

export default async function Pagina({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const m = await obtenerMotorizado(codigo);
  if (!m) notFound();

  const personal = await personalActual();
  if (!personal) {
    await registrarEvento({ codigo, tipo: "escaneo" });
    // Un desconocido solo recibe el nivel 1; nunca datos de contacto ni póliza.
    return <VistaEscaneo datos={vistaPublica(m)} />;
  }

  await registrarEvento({
    codigo,
    tipo: "acceso_verificado",
    ayudante: { nombre: personal.nombre, institucion: personal.institucion },
  });
  return (
    <VistaEscaneo
      datos={vistaPublica(m)}
      completo={{
        datos: vistaCompleta(m),
        personal: { nombre: personal.nombre, institucion: personal.institucion },
      }}
    />
  );
}
