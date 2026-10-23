import { notFound } from "next/navigation";
import { horaCaracas, notificarContactos } from "@/lib/notificar";
import { personalActual } from "@/lib/sesion";
import {
  obtenerMotorizado,
  registrarEvento,
  ultimoEvento,
  vistaCompleta,
  vistaPublica,
} from "@/lib/store";
import VistaEscaneo from "./VistaEscaneo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Emergencia médica · QRmoto",
  robots: { index: false, follow: false },
};

// Un mismo profesional recargando la ficha no debe generar un aviso cada vez.
const AVISO_ACCESO_MS = 10 * 60 * 1000;

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

  // Cada acceso a la ficha completa se avisa a la familia: una cuenta verificada
  // robada o mal usada no puede mirar datos sin que se note.
  const previo = await ultimoEvento(codigo, "acceso_verificado", personal.nombre);
  let notificados: string[] | undefined;
  if (!previo || Date.now() - new Date(previo.fecha).getTime() > AVISO_ACCESO_MS) {
    const primerNombre = m.nombre.split(" ")[0];
    notificados = await notificarContactos(
      m,
      [
        `🔐 QRmoto · ${horaCaracas()}`,
        `${personal.nombre} (${personal.institucion}) abrió la ficha médica completa de ${primerNombre}.`,
        "",
        "Esto ocurre cuando personal médico verificado lo está atendiendo. Si no lo reconoces, avísale a tu familiar.",
      ].join("\n"),
    );
  }

  await registrarEvento({
    codigo,
    tipo: "acceso_verificado",
    ayudante: { nombre: personal.nombre, institucion: personal.institucion },
    notificados,
  });
  return (
    <VistaEscaneo
      datos={vistaPublica(m)}
      completo={{
        datos: vistaCompleta(m),
        personal: {
          nombre: personal.nombre,
          institucion: personal.institucion,
          tipo: personal.tipo,
        },
      }}
    />
  );
}
