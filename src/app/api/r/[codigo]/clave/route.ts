import { NextResponse } from "next/server";
import { personalActual } from "@/lib/sesion";
import { crearSolicitud, obtenerMotorizado, ultimaSolicitud } from "@/lib/store";

type Ctx = { params: Promise<{ codigo: string }> };

// Solo personal médico verificado puede pedir la clave de emergencia.
async function contexto(params: Ctx["params"]) {
  const p = await personalActual();
  if (!p || (p.tipo !== "clinica" && p.tipo !== "paramedico")) return null;
  const { codigo } = await params;
  const m = await obtenerMotorizado(codigo);
  return m ? { p, m } : null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const c = await contexto(params);
  if (!c) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await ultimaSolicitud(c.m.codigo, c.p.institucion));
}

export async function POST(_req: Request, { params }: Ctx) {
  const c = await contexto(params);
  if (!c) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!c.m.seguro) {
    return NextResponse.json({ error: "El motorizado no tiene seguro registrado." }, { status: 400 });
  }
  // Una solicitud pendiente o aprobada no se duplica; tras un rechazo se puede reintentar.
  const previa = await ultimaSolicitud(c.m.codigo, c.p.institucion);
  if (previa && previa.estado !== "rechazada") return NextResponse.json(previa);
  return NextResponse.json(await crearSolicitud(c.m.codigo, c.p.institucion, c.p.nombre), {
    status: 201,
  });
}
