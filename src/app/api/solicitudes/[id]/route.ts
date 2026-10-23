import { NextResponse } from "next/server";
import { horaCaracas, notificarContactos } from "@/lib/notificar";
import { personalActual } from "@/lib/sesion";
import { obtenerMotorizado, resolverSolicitud } from "@/lib/store";
import { texto } from "@/lib/validar";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await personalActual();
  if (p?.tipo !== "aseguradora") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.accion !== "aprobar" && body.accion !== "rechazar") {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  const aprobar = body.accion === "aprobar";
  const s = await resolverSolicitud(id, {
    estado: aprobar ? "aprobada" : "rechazada",
    resueltoPor: `${p.nombre} · ${p.institucion}`,
    montoUSD: aprobar && Number(body.montoUSD) > 0 ? Math.round(Number(body.montoUSD)) : undefined,
    motivo: aprobar ? undefined : texto(body.motivo, 120) || "Sin motivo indicado",
  });
  if (!s) return NextResponse.json({ error: "La solicitud ya fue resuelta." }, { status: 409 });

  // La familia sabe al momento que la cobertura está activa en la clínica.
  const m = await obtenerMotorizado(s.codigo);
  if (m && aprobar) {
    const primerNombre = m.nombre.split(" ")[0];
    await notificarContactos(
      m,
      [
        `🛡️ QRmoto · ${horaCaracas()}`,
        `${m.seguro?.aseguradora ?? "La aseguradora"} aprobó la cobertura de emergencia de ${primerNombre} en ${s.institucion}.`,
        s.montoUSD ? `Cobertura aprobada: hasta USD ${s.montoUSD.toLocaleString("es-VE")}.` : null,
        `Clave de emergencia: ${s.clave}`,
        "",
        "La clínica ya tiene esta clave. Ante cualquier duda sobre pagos, llama directamente a la aseguradora.",
      ]
        .filter((l) => l !== null)
        .join("\n"),
    );
  }
  return NextResponse.json(s);
}
