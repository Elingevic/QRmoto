"use client";

import Link from "next/link";
import { useState } from "react";
import type { Personal, Ubicacion, VistaCompleta, VistaPublica } from "@/lib/tipos";
import SolicitarClave from "./SolicitarClave";

function pedirUbicacion(): Promise<Ubicacion | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          precision: Math.round(p.coords.accuracy),
        }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  });
}

const pasos = [
  "Llama al 911 y di dónde están con referencias claras.",
  "No le quites el casco ni lo muevas, salvo peligro inmediato (fuego, tráfico).",
  "Revisa si respira. Si sangra, presiona la herida con un trapo limpio.",
  "Abrígalo y quédate a su lado hasta que llegue ayuda.",
  "Muestra esta pantalla al paramédico.",
];

type Completo = {
  datos: VistaCompleta;
  personal: { nombre: string; institucion: string; tipo: Personal["tipo"] };
};

export default function VistaEscaneo({
  datos,
  completo,
}: {
  datos: VistaPublica;
  completo?: Completo;
}) {
  const [alerta, setAlerta] = useState<"inicial" | "enviando" | "enviada" | "repetida" | "error">(
    "inicial",
  );
  const [telefonoAyudante, setTelefonoAyudante] = useState("");
  const [sinUbicacion, setSinUbicacion] = useState(false);

  async function avisarFamilia() {
    setAlerta("enviando");
    const ubicacion = await pedirUbicacion();
    setSinUbicacion(!ubicacion);
    const r = await fetch(`/api/r/${datos.codigo}/alerta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ubicacion, telefono: telefonoAyudante }),
    }).catch(() => null);
    if (!r?.ok) return setAlerta("error");
    const json = await r.json();
    setAlerta(json.repetida ? "repetida" : "enviada");
  }

  return (
    <main className="min-h-dvh bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-md pb-10">
        <header className="bg-red-700 px-4 pb-4 pt-5 text-white">
          <p className="text-xs font-bold tracking-widest opacity-90">
            EMERGENCIA MÉDICA · QRmoto
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">{datos.primerNombre}</h1>
          <p className="text-sm opacity-90">{datos.edad} años · Motorizado</p>
        </header>
        <div className="bg-amber-400 px-4 py-2 text-center text-sm font-extrabold text-stone-900">
          ⚠️ NO LE QUITES EL CASCO
        </div>

        {datos.demo && (
          <p className="mx-4 mt-3 rounded-lg bg-blue-100 px-3 py-2 text-center text-xs font-semibold text-blue-900">
            Perfil de demostración con datos ficticios
          </p>
        )}

        {completo && (
          <section className="mx-4 mt-3 rounded-2xl border-2 border-green-600 bg-white p-4 shadow-sm">
            <DatosCompletos {...completo} codigo={datos.codigo} />
          </section>
        )}

        <section className="mx-4 mt-4 grid gap-3">
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-700 py-4 text-lg font-extrabold text-white shadow active:scale-[0.98]"
          >
            📞 Llamar al 911
          </a>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {alerta === "enviada" || alerta === "repetida" ? (
              <div className="text-center">
                <p className="text-lg font-bold text-green-700">✓ Su familia fue avisada</p>
                <p className="mt-1 text-sm text-stone-600">
                  {alerta === "repetida"
                    ? "Alguien ya los avisó hace un momento. Quédate a su lado hasta que llegue ayuda."
                    : sinUbicacion
                      ? "No pudimos obtener tu ubicación. Si puedes, quédate hasta que llegue ayuda."
                      : telefonoAyudante
                        ? "Recibieron tu ubicación y te van a llamar. Gracias por ayudar."
                        : "Recibieron tu ubicación. Gracias por ayudar."}
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={avisarFamilia}
                  disabled={alerta === "enviando"}
                  className="w-full rounded-xl bg-stone-900 py-3.5 text-base font-bold text-white active:scale-[0.98] disabled:opacity-60"
                >
                  {alerta === "enviando" ? "Avisando…" : "🔔 Avisar a su familia"}
                </button>
                <label className="mt-3 block text-xs text-stone-600">
                  Deja tu número para que su familia te llame (recomendado):
                  <input
                    type="tel"
                    inputMode="tel"
                    value={telefonoAyudante}
                    onChange={(e) => setTelefonoAyudante(e.target.value)}
                    placeholder="0414-1234567"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
                  />
                </label>
                <p className="mt-2 text-xs text-stone-500">
                  Enviaremos tu ubicación a sus {datos.totalContactos} contactos de emergencia
                  {datos.seguroActivo ? " y a su aseguradora" : ""}. Por su seguridad, sus números
                  no se muestran.
                </p>
                {alerta === "error" && (
                  <p className="mt-2 text-sm font-semibold text-red-700">
                    No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <section className="mx-4 mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold text-stone-500">TIPO DE SANGRE</p>
            <p className="text-4xl font-extrabold text-red-700">{datos.sangre}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold text-stone-500">SEGURO</p>
            {datos.seguroVerificado ? (
              <>
                <p className="mt-1 text-lg font-extrabold text-green-700">✓ Activo</p>
                <p className="text-xs text-stone-600">{datos.aseguradora}</p>
              </>
            ) : datos.seguroActivo ? (
              <>
                <p className="mt-1 text-base font-bold text-amber-700">Declarado</p>
                <p className="text-xs text-stone-600">{datos.aseguradora} · sin verificar</p>
              </>
            ) : (
              <p className="mt-1 text-lg font-bold text-stone-500">Sin seguro</p>
            )}
          </div>
        </section>

        <section className="mx-4 mt-3 grid gap-3">
          <Bloque titulo="⚠️ Alergias" items={datos.alergias} destacado />
          <Bloque titulo="Condiciones médicas" items={datos.condiciones} />
          <Bloque titulo="Medicamentos" items={datos.medicamentos} />
          {datos.notas && <Bloque titulo="Notas" items={[datos.notas]} />}
        </section>

        <details className="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-bold">¿No eres paramédico? Qué hacer</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-700">
            {pasos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </details>

        {!completo && (
          <Link
            href={`/personal?volver=/r/${datos.codigo}`}
            className="mx-4 mt-3 block rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="font-bold">🩺 ¿Eres paramédico o personal de clínica?</p>
            <p className="mt-1 text-sm text-stone-600">
              Inicia sesión con tu cuenta verificada para ver identidad, póliza y contactos.
            </p>
          </Link>
        )}

        <p className="mx-4 mt-6 text-center text-xs text-stone-500">
          QRmoto y las aseguradoras nunca piden dinero a la familia por este medio.
        </p>
      </div>
    </main>
  );
}

function Bloque({
  titulo,
  items,
  destacado,
}: {
  titulo: string;
  items: string[];
  destacado?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm ${destacado ? "bg-red-50" : "bg-white"}`}>
      <p className={`text-sm font-bold ${destacado ? "text-red-800" : "text-stone-700"}`}>
        {titulo}
      </p>
      {items.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((i) => (
            <span
              key={i}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                destacado ? "bg-red-200 text-red-900" : "bg-stone-100 text-stone-800"
              }`}
            >
              {i}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-stone-500">Ninguna registrada</p>
      )}
    </div>
  );
}

function DatosCompletos({ datos: d, personal, codigo }: Completo & { codigo: string }) {
  return (
    <div className="grid gap-3 text-sm">
      <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
        ✓ Acceso verificado · {personal.nombre} · {personal.institucion}
      </p>
      <Fila k="Nombre" v={d.nombreCompleto} />
      <Fila k="Cédula" v={d.cedula} />
      <Fila k="Ciudad" v={d.ciudad} />
      <Fila k="Moto" v={`${d.moto.marca} ${d.moto.modelo} · ${d.moto.color} · ${d.moto.placa}`} />
      {d.seguro && (
        <div className="rounded-xl bg-stone-50 p-3">
          <p className="font-bold">{d.seguro.aseguradora}</p>
          <p className="text-stone-600">
            {d.seguro.plan} · Póliza {d.seguro.poliza}
          </p>
          {d.seguro.verificado ? (
            <p className="text-stone-600">
              ✓ Verificada · Cobertura de emergencia: USD{" "}
              {d.seguro.coberturaEmergenciaUSD.toLocaleString("es-VE")}
            </p>
          ) : (
            <p className="font-semibold text-amber-700">
              Declarada por el motorizado, sin verificar. Confirma con la aseguradora.
            </p>
          )}
          {d.seguro.telefonoEmergencia && (
            <a
              href={`tel:${d.seguro.telefonoEmergencia}`}
              className="mt-2 block rounded-lg bg-white py-2 text-center font-semibold shadow-sm"
            >
              📞 Llamar a la aseguradora
            </a>
          )}
          {personal.tipo !== "aseguradora" && <SolicitarClave codigo={codigo} />}
        </div>
      )}
      <div className="grid gap-2">
        {d.contactos.map((c) => (
          <a
            key={c.telefono}
            href={`tel:${c.telefono}`}
            className="flex items-center justify-between rounded-xl bg-stone-50 p-3"
          >
            <span>
              <b>{c.nombre}</b>
              <span className="block text-stone-600">
                {c.relacion} · {c.telefono}
              </span>
            </span>
            <span className="rounded-lg bg-red-700 px-3 py-1.5 font-semibold text-white">Llamar</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Fila({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="text-stone-500">{k}: </span>
      <b>{v}</b>
    </p>
  );
}
