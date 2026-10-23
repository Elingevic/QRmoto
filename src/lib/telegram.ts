// Cliente mínimo de la API de bots de Telegram.

export function telegramConfigurado() {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

export function usuarioBot() {
  return process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? null;
}

export function linkInvitacion(tokenCanal: string) {
  const bot = usuarioBot();
  return bot ? `https://t.me/${bot}?start=${tokenCanal}` : null;
}

async function llamar(metodo: string, cuerpo: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(6000),
  });
  const json = (await r.json().catch(() => null)) as { ok: boolean; description?: string } | null;
  if (!json?.ok) throw new Error(`Telegram ${metodo}: ${json?.description ?? r.status}`);
  return json;
}

export function enviarTexto(chatId: string, texto: string) {
  return llamar("sendMessage", { chat_id: chatId, text: texto, disable_web_page_preview: true });
}

export function enviarUbicacion(chatId: string, lat: number, lng: number) {
  return llamar("sendLocation", { chat_id: chatId, latitude: lat, longitude: lng });
}
