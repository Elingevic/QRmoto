import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Formato: scrypt$<sal>$<hash>, ambos en base64url.
export function hashClave(clave: string) {
  const sal = randomBytes(16);
  return `scrypt$${sal.toString("base64url")}$${scryptSync(clave, sal, 64).toString("base64url")}`;
}

export function verificarClave(clave: string, guardado: string) {
  const [algo, sal, hash] = guardado.split("$");
  if (algo !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64url");
  const calculado = scryptSync(clave, Buffer.from(sal, "base64url"), esperado.length);
  return timingSafeEqual(esperado, calculado);
}
