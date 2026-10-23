import QRCode from "qrcode";
import type { VistaPublica } from "@/lib/tipos";

// Sticker para el casco y tarjeta para la cartera. Lo esencial va impreso para
// que sirva aun cuando quien ayuda no tenga internet.
export default async function Sticker({ d, url }: { d: VistaPublica; url: string }) {
  // Corrección de errores alta: el QR sigue leyéndose aunque el sticker se raye.
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H", margin: 1 });
  const alergias = d.alergias.length ? d.alergias.join(", ") : "Ninguna conocida";

  return (
    <div className="mt-6 flex flex-wrap items-start justify-center gap-6 print:mt-0 print:justify-start">
      {/* Sticker para el casco */}
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
            Pulso · EMERGENCIA MÉDICA
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
  );
}
