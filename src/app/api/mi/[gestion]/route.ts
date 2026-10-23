import { NextResponse } from "next/server";
import { actualizarMotorizado, obtenerPorGestion } from "@/lib/store";
import { leerRegistro } from "@/lib/validar";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ gestion: string }> },
) {
  const { gestion } = await params;
  const m = await obtenerPorGestion(gestion);
  if (!m) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (m.demo) {
    return NextResponse.json({ error: "El perfil demo no se puede editar." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const r = leerRegistro({ ...body, consentimiento: true });
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

  // Una póliza confirmada por la aseguradora sigue verificada mientras no cambie.
  const nuevo = r.datos.seguro;
  if (
    nuevo &&
    m.seguro?.verificado &&
    nuevo.aseguradora === m.seguro.aseguradora &&
    nuevo.poliza === m.seguro.poliza
  ) {
    r.datos.seguro = { ...m.seguro, telefonoEmergencia: nuevo.telefonoEmergencia || m.seguro.telefonoEmergencia };
  }

  await actualizarMotorizado(m.codigo, r.datos);
  return NextResponse.json({ ok: true });
}
