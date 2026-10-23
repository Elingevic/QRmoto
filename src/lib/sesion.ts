import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { obtenerPersonal } from "./store";

export const COOKIE_SESION = "qrmoto_sesion";
const DURACION_MS = 12 * 60 * 60 * 1000;

function secreto() {
  const s = process.env.SESION_SECRETO;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("Falta SESION_SECRETO");
  }
  return s ?? "solo-para-desarrollo-local";
}

function firmar(datos: string) {
  return createHmac("sha256", secreto()).update(datos).digest("base64url");
}

export function crearToken(usuario: string) {
  const datos = Buffer.from(
    JSON.stringify({ u: usuario, exp: Date.now() + DURACION_MS }),
  ).toString("base64url");
  return { token: `${datos}.${firmar(datos)}`, maxAge: DURACION_MS / 1000 };
}

function leerToken(token: string | undefined) {
  if (!token) return null;
  const [datos, firma] = token.split(".");
  if (!datos || !firma) return null;
  const esperada = Buffer.from(firmar(datos));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) {
    return null;
  }
  try {
    const { u, exp } = JSON.parse(Buffer.from(datos, "base64url").toString());
    return typeof u === "string" && typeof exp === "number" && exp > Date.now() ? u : null;
  } catch {
    return null;
  }
}

// Personal verificado (paramédico o clínica) con sesión activa, o null.
export async function personalActual() {
  const usuario = leerToken((await cookies()).get(COOKIE_SESION)?.value);
  return usuario ? obtenerPersonal(usuario) : null;
}
