"use client";

import { useCallback, useEffect, useState } from "react";
import type { SolicitudClave } from "@/lib/tipos";

function duracion(desde: string, hasta: string) {
  const s = Math.max(0, Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 1000));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

// La clínica pide la clave de emergencia y espera la respuesta de la aseguradora
// sin recargar la página.
export default function SolicitarClave({ codigo }: { codigo: string }) {
  const [s, setS] = useState<SolicitudClave | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const consultar = useCallback(async () => {
    const r = await fetch(`/api/r/${codigo}/clave`, { cache: "no-store" }).catch(() => null);
    if (r?.ok) setS(await r.json());
    setCargando(false);
  }, [codigo]);

  useEffect(() => {
    consultar();
  }, [consultar]);

  useEffect(() => {
    if (s?.estado !== "pendiente") return;
    const t = setInterval(consultar, 3000);
    return () => clearInterval(t);
  }, [s?.estado, consultar]);

  async function solicitar() {
    setError("");
    const r = await fetch(`/api/r/${codigo}/clave`, { method: "POST" }).catch(() => null);
    if (!r) return setError("Sin conexión. Inténtalo de nuevo.");
    const json = await r.json();
    if (!r.ok) return setError(json.error ?? "No se pudo solicitar.");
    setS(json);
  }

  if (cargando) return null;

  if (s?.estado === "aprobada") {
    return (
      <div className="mt-3 rounded-xl border-2 border-green-600 bg-green-50 p-3 text-center">
        <p className="text-xs font-bold tracking-wider text-green-800">CLAVE DE EMERGENCIA APROBADA</p>
        <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-green-900">{s.clave}</p>
        {s.montoUSD && (
          <p className="text-sm text-green-900">
            Cobertura hasta USD {s.montoUSD.toLocaleString("es-VE")}
          </p>
        )}
        {s.resuelto && (
          <p className="mt-1 text-xs text-green-800">Respuesta en {duracion(s.creado, s.resuelto)}</p>
        )}
      </div>
    );
  }

  if (s?.estado === "pendiente") {
    return (
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-900">
        <p className="font-bold">⏳ Esperando a la aseguradora…</p>
        <p className="text-xs">La clave aparecerá aquí apenas la aprueben.</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {s?.estado === "rechazada" && (
        <p className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-red-800">
          Rechazada: {s.motivo}. Puedes volver a solicitarla.
        </p>
      )}
      <button
        onClick={solicitar}
        className="w-full rounded-lg bg-stone-900 py-2.5 font-bold text-white active:scale-[0.98]"
      >
        🛡️ Solicitar clave de emergencia
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
