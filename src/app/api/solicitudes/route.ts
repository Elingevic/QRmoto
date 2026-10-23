import { NextResponse } from "next/server";
import { personalActual } from "@/lib/sesion";
import { listarSolicitudes } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = await personalActual();
  if (p?.tipo !== "aseguradora") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await listarSolicitudes());
}
