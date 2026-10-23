import { NextResponse } from "next/server";
import { crearMotorizado } from "@/lib/store";
import { leerRegistro } from "@/lib/validar";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const r = leerRegistro(body);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });

  // El link privado (/mi/<gestion>) solo se entrega aquí, una vez.
  const { gestion } = await crearMotorizado(r.datos);
  return NextResponse.json({ gestion }, { status: 201 });
}
