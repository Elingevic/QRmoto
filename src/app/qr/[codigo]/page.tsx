import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { obtenerMotorizado, vistaPublica } from "@/lib/store";
import BotonImprimir from "./BotonImprimir";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tu QR · QRmoto",
  robots: { index: false, follow: false },
};

async function urlBase() {
  if (process.env.URL_BASE) return process.env.URL_BASE.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function Pagina({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const m = await obtenerMotorizado(codigo);
  if (!m) notFound();

  const d = vistaPublica(m);
  const url = `${await urlBase()}/r/${codigo}`;
  // Corrección de errores alta: el QR sigue leyéndose aunque el sticker se raye.
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H", margin: 1 });
  const alergias = d.alergias.length ? d.alergias.join(", ") : "Ninguna conocida";

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 text-stone-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-lg">
        <div className="print:hidden">
          <p className="text-sm font-bold tracking-widest text-red-700">QRmoto</p>
          <h1 className="mt-1 text-3xl font-extrabold">¡Listo, {d.primerNombre}!</h1>
          <p className="mt-2 text-sm text-stone-600">
            Imprime el sticker y pégalo en la parte trasera del casco. Imprime también la tarjeta y
            guárdala con tu cédula.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-center gap-6 print:mt-0 print:justify-start">
          {/* Sticker para el casco. Lo esencial va impreso para que sirva aun sin internet. */}
          <div
            className="overflow-hidden rounded-2xl border-2 border-red-700 bg-white text-center shadow print:shadow-none"
            style={{ width: "6.5cm" }}
          >
            <div className="bg-red-700 py-1.5 text-[11px] font-extrabold tracking-wider text-white">
              EMERGENCIA MÉDICA
            </div>
            <div className="px-3 pt-2" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="text-[10px] font-bold">ESCANEA CON LA CÁMARA</p>
            <div className="mt-1.5 grid grid-cols-2 border-t border-stone-200 text-left">
              <div className="border-r border-stone-200 px-2 py-1">
                <p className="text-[8px] font-semibold text-stone-500">SANGRE</p>
                <p className="text-lg font-extrabold leading-tight text-red-700">{d.sangre}</p>
              </div>
              <div className="px-2 py-1">
                <p className="text-[8px] font-semibold text-stone-500">ALÉRGICO A</p>
                <p className="line-clamp-2 text-[10px] font-bold leading-tight">{alergias}</p>
              </div>
            </div>
            <div className="bg-amber-400 py-1 text-[10px] font-extrabold">
              ⚠ NO QUITAR EL CASCO · LLAMA AL 911
            </div>
          </div>

          {/* Tarjeta para la cartera, con más detalle médico. */}
          <div
            className="flex overflow-hidden rounded-xl border-2 border-red-700 bg-white shadow print:shadow-none"
            style={{ width: "8.6cm", height: "5.4cm" }}
          >
            <div className="flex w-[3cm] shrink-0 flex-col items-center justify-center bg-red-700 p-1.5">
              <div
                className="w-full rounded bg-white p-0.5"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <p className="mt-1 text-[7px] font-bold text-white">ESCANEA EN EMERGENCIA</p>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 p-2 text-[9px] leading-tight">
              <p className="text-[8px] font-extrabold tracking-wider text-red-700">
                QRmoto · EMERGENCIA MÉDICA
              </p>
              <p className="text-sm font-extrabold">
                {d.primerNombre} · {d.edad} años
              </p>
              <p>
                <b>Sangre:</b> <span className="font-extrabold text-red-700">{d.sangre}</span>
                {d.donante ? " · Donante" : ""}
              </p>
              <p className="line-clamp-2">
                <b>Alergias:</b> {alergias}
              </p>
              {d.condiciones.length > 0 && (
                <p className="line-clamp-2">
                  <b>Condiciones:</b> {d.condiciones.join(", ")}
                </p>
              )}
              {d.medicamentos.length > 0 && (
                <p className="line-clamp-2">
                  <b>Medicamentos:</b> {d.medicamentos.join(", ")}
                </p>
              )}
              <p className="mt-auto text-[7px] text-stone-500">
                Sus contactos se avisan desde el QR. Nunca pedimos dinero.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 print:hidden">
          <BotonImprimir />
          <Link
            href={`/r/${codigo}`}
            className="rounded-xl bg-white py-3 text-center font-bold shadow-sm"
          >
            Ver lo que verá quien te ayude
          </Link>
          <p className="break-all text-center text-xs text-stone-500">{url}</p>
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            Guarda este enlace: por ahora es la única forma de volver a tu sticker. Pronto podrás
            entrar con tu teléfono para editar tus datos.
          </p>
        </div>
      </div>
    </main>
  );
}
