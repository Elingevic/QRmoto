// Registra el webhook del bot en Telegram. Uso:
//   npm run telegram:webhook -- https://pulso-ve.vercel.app
// Lee TELEGRAM_BOT_TOKEN y TELEGRAM_WEBHOOK_SECRET de .env.local.

const base = (process.argv[2] ?? process.env.URL_BASE ?? "").replace(/\/$/, "");
const token = process.env.TELEGRAM_BOT_TOKEN;
const secreto = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!base.startsWith("https://")) {
  console.error("Indica la URL pública https, ej.: npm run telegram:webhook -- https://pulso-ve.vercel.app");
  process.exit(1);
}
if (!token || !secreto) {
  console.error("Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_WEBHOOK_SECRET en .env.local");
  process.exit(1);
}

async function llamar(metodo, cuerpo) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const json = await r.json();
  console.log(`${metodo}: ${json.ok ? "ok" : json.description}`);
  return json.ok;
}

const ok = await llamar("setWebhook", {
  url: `${base}/api/telegram/webhook`,
  secret_token: secreto,
  allowed_updates: ["message"],
  drop_pending_updates: true,
});
await llamar("setMyCommands", {
  commands: [{ command: "stop", description: "Dejar de recibir alertas" }],
});
await llamar("setMyDescription", {
  description:
    "Alertas de emergencia de Pulso. Si tu familiar motorizado tiene un accidente y alguien escanea su casco, te llega aquí su ubicación. Nunca te pediremos dinero.",
});
process.exit(ok ? 0 : 1);
