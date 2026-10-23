"use client";

import { useState } from "react";
import type { Motorizado, SolicitudClave } from "@/lib/tipos";

export type SolicitudPanel = SolicitudClave & {
  motorizado: Pick<Motorizado, "nombre" | "apellido" | "cedula" | "seguro"> | null;
};

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function segundos(desde: string, hasta: string) {
  const s = Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

export default function Solicitudes({
  solicitudes,
  onCambio,
}: {
  solicitudes: SolicitudPanel[];
  onCambio: (s: SolicitudClave) => void;
}) {
  if (!solicitudes.length) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold">🛡️ Claves de emergencia</h2>
      <ul className="mt-3 grid gap-3">
        {solicitudes.map((s) => (
          <Solicitud key={s.id} s={s} onCambio={onCambio} />
        ))}
      </ul>
    </section>
  );
}

function Solicitud({ s, onCambio }: { s: SolicitudPanel; onCambio: (s: SolicitudClave) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const m = s.motorizado;
  const seguro = m?.seguro;

  async function resolver(accion: "aprobar" | "rechazar") {
    const motivo = accion === "rechazar" ? window.prompt("Motivo del rechazo:") : undefined;
    if (accion === "rechazar" && motivo === null) return;
    setEnviando(true);
    setError("");
    const r = await fetch(`/api/solicitudes/${s.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion, motivo, montoUSD: seguro?.coberturaEmergenciaUSD }),
    }).catch(() => null);
    setEnviando(false);
    const json = await r?.json().catch(() => null);
    if (!r?.ok) return setError(json?.error ?? "No se pudo guardar.");
    onCambio(json);
  }

  const pendiente = s.estado === "pendiente";
  return (
    <li className={`rounded-2xl bg-white p-4 shadow-sm ${pendiente ? "ring-2 ring-amber-400" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            pendiente
              ? "bg-amber-400 text-slate-900"
              : s.estado === "aprobada"
                ? "bg-green-600 text-white"
                : "bg-slate-200 text-slate-700"
          }`}
        >
          {pendiente ? "Pendiente" : s.estado === "aprobada" ? "Aprobada" : "Rechazada"}
        </span>
        <span className="text-sm tabular-nums text-slate-500">{hora(s.creado)}</span>
      </div>

      <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
        <p>
          <b>{m ? `${m.nombre} ${m.apellido}` : s.codigo}</b>
          {m && ` · ${m.cedula}`}
        </p>
        <p className="text-slate-600">
          Solicita: {s.solicitante} · {s.institucion}
        </p>
        {seguro && (
          <p className="text-slate-600">
            {seguro.aseguradora} · {seguro.plan} · {seguro.poliza}
          </p>
        )}
        {seguro && (
          <p className={seguro.verificado ? "text-green-700" : "font-semibold text-amber-700"}>
            {seguro.verificado
              ? `✓ Póliza verificada · hasta USD ${seguro.coberturaEmergenciaUSD.toLocaleString("es-VE")}`
              : "⚠ Póliza declarada por el usuario, sin verificar"}
          </p>
        )}
      </div>

      {pendiente ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => resolver("aprobar")}
            disabled={enviando}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            Aprobar
          </button>
          <button
            onClick={() => resolver("rechazar")}
            disabled={enviando}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            Rechazar
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm">
          {s.estado === "aprobada" ? (
            <>
              Clave <b className="font-mono">{s.clave}</b>
            </>
          ) : (
            <>Motivo: {s.motivo}</>
          )}
          {s.resuelto && (
            <span className="text-slate-500"> · respondida en {segundos(s.creado, s.resuelto)}</span>
          )}
        </p>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </li>
  );
}
