import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { activarCanal, desactivarChat, obtenerMotorizado } from "@/lib/store";
import { enviarTexto } from "@/lib/telegram";

type Update = {
  message?: { text?: string; chat: { id: number }; from?: { first_name?: string } };
};

// Telegram manda este encabezado con el secreto que registramos en setWebhook.
function autorizado(req: Request) {
  const esperado = process.env.TELEGRAM_WEBHOOK_SECRET;
  const recibido = req.headers.get("x-telegram-bot-api-secret-token");
  if (!esperado || !recibido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function responder(update: Update) {
  const msg = update.message;
  if (!msg?.text) return;
  const chatId = String(msg.chat.id);
  const [comando, argumento] = msg.text.trim().split(/\s+/, 2);
  const nombre = msg.from?.first_name ?? "";

  if (comando === "/start" && argumento) {
    const canal = await activarCanal(argumento, chatId);
    const m = canal && (await obtenerMotorizado(canal.codigo));
    if (!m) {
      return enviarTexto(
        chatId,
        "Este link no es válido o fue reemplazado. Pide a tu familiar que te envíe uno nuevo desde su panel de QRmoto.",
      );
    }
    const primerNombre = m.nombre.split(" ")[0];
    return enviarTexto(
      chatId,
      [
        `✅ Listo${nombre ? `, ${nombre}` : ""}. Desde ahora recibirás aquí las alertas de emergencia de ${primerNombre}.`,
        "",
        "Si alguien escanea su casco y pide ayuda, te llegará su ubicación y el número de quien lo está ayudando.",
        "",
        "⚠️ QRmoto y las aseguradoras NUNCA te pedirán dinero por este medio. Si alguien te llama pidiendo dinero por un accidente, es una estafa.",
        "",
        "Para dejar de recibir alertas, escribe /stop.",
      ].join("\n"),
    );
  }

  if (comando === "/stop") {
    await desactivarChat(chatId);
    return enviarTexto(chatId, "Dejaste de recibir alertas de QRmoto en este chat.");
  }

  return enviarTexto(
    chatId,
    "Hola, soy el bot de alertas de QRmoto. Para activarte, abre el link que te envió tu familiar desde su panel.",
  );
}

export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const update = (await req.json().catch(() => ({}))) as Update;
  try {
    await responder(update);
  } catch (e) {
    console.error("QRmoto: error en webhook de Telegram", e);
  }
  // Siempre 200: si no, Telegram reintenta el mismo mensaje una y otra vez.
  return NextResponse.json({ ok: true });
}
