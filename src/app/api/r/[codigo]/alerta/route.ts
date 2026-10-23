import { NextResponse } from "next/server";
import { obtenerMotorizado, registrarEvento, ultimaAlerta } from "@/lib/store";
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

  const previa = await ultimaAlerta(codigo);
  if (previa && Date.now() - new Date(previa.fecha).getTime() < ESPERA_MS) {
    return NextResponse.json({ ok: true, repetida: true });
  }

  const body = await req.json().catch(() => ({}));
  const ubicacion = leerUbicacion(body.ubicacion);
  const telefono = texto(body.telefono, 30);
  const primerNombre = m.nombre.split(" ")[0];

  const mensaje = [
    `🚨 QRmoto: alguien escaneó el QR de ${primerNombre} y pidió ayuda.`,
    ubicacion ? `📍 Ubicación: ${linkMapa(ubicacion)}` : "📍 Ubicación no disponible.",
    telefono
      ? `📞 Llama a quien está ayudando: ${telefono}`
      : "📞 Quien ayuda no dejó número.",
    "⚠️ QRmoto y tu aseguradora NUNCA te pedirán dinero por este medio.",
  ].join("\n");

  // Demo: el envío real por WhatsApp/SMS se conecta aquí.
  const notificados = [
    ...m.contactos.map((c) => `${c.nombre} (${c.relacion})`),
    ...(m.seguro ? [m.seguro.aseguradora] : []),
  ];

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
