import { NextResponse } from "next/server";
import { horaCaracas, notificarContactos } from "@/lib/notificar";
import { obtenerMotorizado, registrarEvento, ultimoEvento } from "@/lib/store";
import { leerUbicacion, linkMapa, texto } from "@/lib/validar";

// Evita que escaneos falsos o repetidos saturen a la familia.
const ESPERA_MS = 2 * 60 * 1000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ codigo: string }> },
) {
  const { codigo } = await params;
  const m = await obtenerMotorizado(codigo);
  if (!m) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const previa = await ultimoEvento(codigo, "alerta_familia");
  if (previa && Date.now() - new Date(previa.fecha).getTime() < ESPERA_MS) {
    return NextResponse.json({ ok: true, repetida: true });
  }

  const body = await req.json().catch(() => ({}));
  const ubicacion = leerUbicacion(body.ubicacion);
  const telefono = texto(body.telefono, 30);
  const primerNombre = m.nombre.split(" ")[0];

  const mensaje = [
    `🚨 ALERTA QRmoto · ${horaCaracas()}`,
    `Alguien escaneó el casco de ${primerNombre} y pidió ayuda.`,
    "",
    ubicacion ? `📍 Ubicación: ${linkMapa(ubicacion)}` : "📍 Ubicación no disponible.",
    telefono
      ? `📞 Llama a quien lo está ayudando: ${telefono}`
      : "📞 Quien ayuda no dejó número.",
    m.seguro ? `🛡️ Su aseguradora (${m.seguro.aseguradora}) también fue avisada.` : null,
    "",
    "⚠️ QRmoto y tu aseguradora NUNCA te pedirán dinero por este medio. Si alguien te llama pidiendo dinero, es una estafa.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const notificados = await notificarContactos(m, mensaje, ubicacion);
  if (m.seguro) notificados.push(`${m.seguro.aseguradora} · panel ✓`);

  await registrarEvento({
    codigo,
    tipo: "alerta_familia",
    ubicacion,
    ayudante: telefono ? { telefono } : undefined,
    notificados,
    mensaje,
  });

  return NextResponse.json({ ok: true, repetida: false });
}
