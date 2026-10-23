import { headers } from "next/headers";

// URL pública de la app, para los QR impresos y los links de invitación.
export async function urlBase() {
  if (process.env.URL_BASE) return process.env.URL_BASE.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
