"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormPersonal({
  destino,
  sesion,
}: {
  destino: string | null;
  sesion: { nombre: string; institucion: string } | null;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const r = await fetch("/api/personal/sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, clave }),
    }).catch(() => null);
    setEnviando(false);
    if (!r) return setError("Sin conexión. Inténtalo de nuevo.");
    if (!r.ok) return setError((await r.json()).error ?? "No se pudo iniciar sesión.");
    router.replace(destino ?? "/personal");
    router.refresh();
  }

  async function salir() {
    await fetch("/api/personal/sesion", { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  if (sesion) {
    return (
      <div className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-bold text-green-700">✓ Sesión activa</p>
        <p className="text-sm">
          {sesion.nombre} · {sesion.institucion}
        </p>
        <p className="text-sm text-stone-600">
          Escanea el QR de cualquier casco con la cámara de este teléfono.
        </p>
        {destino && (
          <Link
            href={destino}
            className="rounded-xl bg-red-700 py-3 text-center font-bold text-white"
          >
            Continuar
          </Link>
        )}
        <button onClick={salir} className="rounded-xl bg-stone-100 py-2.5 font-semibold">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={entrar} className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <input
        required
        autoComplete="username"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        placeholder="Usuario"
        className="rounded-lg border border-stone-300 px-3 py-2 text-base"
      />
      <input
        required
        type="password"
        autoComplete="current-password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        placeholder="Clave"
        className="rounded-lg border border-stone-300 px-3 py-2 text-base"
      />
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      <button
        disabled={enviando}
        className="rounded-xl bg-stone-900 py-3 font-bold text-white disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Iniciar sesión"}
      </button>
      <p className="text-xs text-stone-500">
        Demo: <code>clinica.demo</code>, <code>paramedico.demo</code> o{" "}
        <code>aseguradora.demo</code> · clave{" "}
        <code>demo2026</code>
      </p>
    </form>
  );
}
