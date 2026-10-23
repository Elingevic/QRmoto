import { NextResponse } from "next/server";
import { personalActual } from "@/lib/sesion";
import { listarEventos } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const p = await personalActual();
  if (p?.tipo !== "aseguradora") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const eventos = await listarEventos();
  return NextResponse.json(
    eventos.map(({ motorizado: m, ...e }) => ({
      ...e,
      motorizado: m && {
        nombreCompleto: `${m.nombre} ${m.apellido}`,
        cedula: m.cedula,
        poliza: m.seguro?.poliza ?? null,
        plan: m.seguro?.plan ?? null,
        sangre: m.sangre,
        moto: `${m.moto.marca} ${m.moto.modelo} · ${m.moto.placa}`,
      },
    })),
  );
}
