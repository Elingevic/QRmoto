import { NextResponse } from "next/server";
import { COOKIE_SESION, crearToken } from "@/lib/sesion";
import { verificarPersonal } from "@/lib/store";
import { texto } from "@/lib/validar";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const p = await verificarPersonal(texto(body.usuario), texto(body.clave));
  if (!p) {
    return NextResponse.json({ error: "Usuario o clave incorrectos." }, { status: 401 });
  }

  const { token, maxAge } = crearToken(p.usuario);
  const res = NextResponse.json({ nombre: p.nombre, institucion: p.institucion });
  res.cookies.set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_SESION);
  return res;
}
