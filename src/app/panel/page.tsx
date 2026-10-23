"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Evento } from "@/lib/tipos";
import Solicitudes, { type SolicitudPanel } from "./Solicitudes";

type EventoPanel = Evento & {
  motorizado: {
    nombreCompleto: string;
    cedula: string;
    poliza: string | null;
    plan: string | null;
    sangre: string;
    moto: string;
  } | null;
};

const etiquetas: Record<Evento["tipo"], { texto: string; clase: string }> = {
  escaneo: { texto: "QR escaneado", clase: "bg-stone-200 text-stone-800" },
  alerta_familia: { texto: "Alerta a familia", clase: "bg-red-600 text-white" },
  acceso_verificado: { texto: "Personal verificado", clase: "bg-green-600 text-white" },
};

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Panel() {
  const [eventos, setEventos] = useState<EventoPanel[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudPanel[]>([]);
  const [conectado, setConectado] = useState(true);
  const [autorizado, setAutorizado] = useState(true);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const [r, rs] = await Promise.all([
          fetch("/api/eventos", { cache: "no-store" }),
          fetch("/api/solicitudes", { cache: "no-store" }),
        ]);
        if (activo) setAutorizado(r.status !== 401);
        if (activo && r.ok) {
          setEventos(await r.json());
          setConectado(true);
        }
        if (activo && rs.ok) setSolicitudes(await rs.json());
      } catch {
        if (activo) setConectado(false);
      }
    }
    cargar();
    const t = setInterval(cargar, 3000);
    return () => {
      activo = false;
      clearInterval(t);
    };
  }, []);

  if (!autorizado) {
    return (
      <main className="grid min-h-dvh place-items-center bg-slate-50 px-4 text-center text-slate-900">
        <div>
          <h1 className="text-xl font-bold">Panel solo para la aseguradora</h1>
          <p className="mt-2 text-sm text-slate-600">Inicia sesión con una cuenta de aseguradora.</p>
          <Link
            href="/personal?volver=/panel"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const alertas = eventos.filter((e) => e.tipo === "alerta_familia").length;
  const accesos = eventos.filter((e) => e.tipo === "acceso_verificado").length;

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="bg-slate-900 px-4 py-4 text-white sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-400">ASEGURADORA DEMO</p>
            <h1 className="text-xl font-bold">Siniestros en tiempo real</h1>
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <span className={`h-2.5 w-2.5 rounded-full ${conectado ? "bg-green-400" : "bg-red-500"}`} />
            {conectado ? "En vivo" : "Sin conexión"}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi titulo="Escaneos" valor={eventos.length - alertas - accesos} />
          <Kpi titulo="Alertas a familia" valor={alertas} />
          <Kpi titulo="Atención verificada" valor={accesos} />
          <Kpi titulo="Respuesta media de clave" valor={respuestaMedia(solicitudes)} />
        </div>

        <Solicitudes
          solicitudes={solicitudes}
          onCambio={(s) =>
            setSolicitudes((xs) => xs.map((x) => (x.id === s.id ? { ...x, ...s } : x)))
          }
        />

        {eventos.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500">
            Esperando eventos… Escanea un casco con QRmoto desde otro dispositivo.
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {eventos.map((e) => (
              <Tarjeta key={e.id} e={e} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function respuestaMedia(solicitudes: SolicitudPanel[]) {
  const tiempos = solicitudes
    .filter((s) => s.resuelto)
    .map((s) => (new Date(s.resuelto!).getTime() - new Date(s.creado).getTime()) / 1000);
  if (!tiempos.length) return "—";
  const media = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
  return media < 60 ? `${media} s` : `${Math.floor(media / 60)} min`;
}

function Kpi({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{titulo}</p>
      <p className="text-3xl font-bold tabular-nums">{valor}</p>
    </div>
  );
}

function Tarjeta({ e }: { e: EventoPanel }) {
  const et = etiquetas[e.tipo];
  const m = e.motorizado;
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${et.clase}`}>{et.texto}</span>
        <span className="text-sm tabular-nums text-slate-500">{hora(e.fecha)}</span>
      </div>

      {m && (
        <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          <p>
            <b>{m.nombreCompleto}</b> · {m.cedula}
          </p>
          <p className="text-slate-600">
            {m.plan} · {m.poliza}
          </p>
          <p className="text-slate-600">Sangre {m.sangre}</p>
          <p className="text-slate-600">{m.moto}</p>
        </div>
      )}

      {(e.ubicacion || e.ayudante) && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {e.ubicacion && (
            <a
              href={`https://www.google.com/maps?q=${e.ubicacion.lat},${e.ubicacion.lng}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold"
            >
              📍 Ver ubicación
              {e.ubicacion.precision ? ` (±${e.ubicacion.precision} m)` : ""}
            </a>
          )}
          {e.ayudante && (
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">
              {e.ayudante.institucion ? "Atiende" : "Quien ayuda"}:{" "}
              {[e.ayudante.nombre, e.ayudante.institucion, e.ayudante.telefono]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>
      )}

      {e.notificados && e.notificados.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">Notificados: {e.notificados.join(", ")}</p>
      )}
      {e.mensaje && (
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-green-50 p-3 font-sans text-xs text-green-900">
          {e.mensaje}
        </pre>
      )}
    </li>
  );
}
