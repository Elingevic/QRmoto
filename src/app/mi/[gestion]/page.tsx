import Link from "next/link";
import { notFound } from "next/navigation";
import Marca from "@/components/Marca";
import { eventosDe, listarCanales, obtenerPorGestion } from "@/lib/store";
import { linkInvitacion, telegramConfigurado } from "@/lib/telegram";
import type { Evento } from "@/lib/tipos";
import Invitar from "./Invitar";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mi panel · Pulso",
  robots: { index: false, follow: false },
};

const textoEvento: Record<Evento["tipo"], string> = {
  escaneo: "Alguien escaneó tu QR",
  alerta_familia: "Se avisó a tu familia",
  acceso_verificado: "Personal verificado abrió tu ficha",
};

function fecha(iso: string) {
  return new Date(iso).toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Pagina({
  params,
  searchParams,
}: {
  params: Promise<{ gestion: string }>;
  searchParams: Promise<{ nuevo?: string; guardado?: string }>;
}) {
  const { gestion } = await params;
  const { nuevo, guardado } = await searchParams;
  const m = await obtenerPorGestion(gestion);
  if (!m) notFound();

  const [canales, eventos] = await Promise.all([listarCanales(m.codigo), eventosDe(m.codigo)]);
  const primerNombre = m.nombre.split(" ")[0];
  const activados = canales.filter((c) => c.chatId).length;

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 text-stone-900">
      <div className="mx-auto grid max-w-lg gap-4">
        <header>
          <Marca />
          <h1 className="mt-1 text-3xl font-extrabold">Hola, {primerNombre}</h1>
        </header>

        {nuevo && (
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-bold">🔑 Guarda este link en favoritos</p>
            <p className="mt-1">
              Es tu acceso privado: con él imprimes tu sticker, activas las alertas de tu familia y
              editas tus datos. No lo compartas: quien lo tenga puede cambiar tu ficha.
            </p>
          </div>
        )}
        {guardado && (
          <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
            ✓ Cambios guardados. Tu QR sigue siendo el mismo.
          </p>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">🔔 Alertas para tu familia</h2>
            <span className="text-sm text-stone-500">
              {activados}/{m.contactos.length} activadas
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-600">
            Cada contacto debe abrir su link una vez en Telegram. Después, si alguien escanea tu
            casco y pide ayuda, le llega tu ubicación al instante.
          </p>
          {!telegramConfigurado() ? (
            <p className="mt-3 rounded-lg bg-stone-100 p-3 text-sm text-stone-600">
              Las alertas por Telegram aún no están configuradas en este servidor.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {m.contactos.map((c, i) => {
                const canal = canales.find((k) => k.contacto === i && k.canal === "telegram");
                const link = canal && linkInvitacion(canal.token);
                return (
                  <li key={i} className="rounded-xl bg-stone-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm">
                        <b>{c.nombre}</b>
                        {c.relacion && <span className="text-stone-500"> · {c.relacion}</span>}
                      </p>
                      {canal?.chatId ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                          ✓ Activada
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          Pendiente
                        </span>
                      )}
                    </div>
                    {!canal?.chatId && link && (
                      <Invitar
                        link={link}
                        telefono={c.telefono}
                        contacto={c.nombre.split(" ")[0]}
                        motorizado={primerNombre}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/mi/${gestion}/sticker`}
            className="rounded-2xl bg-red-700 p-4 text-white shadow-sm"
          >
            <p className="text-2xl">🖨️</p>
            <p className="mt-1 font-bold">Imprimir sticker</p>
          </Link>
          {m.demo ? (
            <div className="rounded-2xl bg-white p-4 text-stone-400 shadow-sm">
              <p className="text-2xl">✏️</p>
              <p className="mt-1 font-bold">Demo: no editable</p>
            </div>
          ) : (
            <Link href={`/mi/${gestion}/editar`} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-2xl">✏️</p>
              <p className="mt-1 font-bold">Editar mis datos</p>
            </Link>
          )}
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">🕐 Actividad de tu QR</h2>
          <p className="mt-1 text-sm text-stone-600">
            Cada vez que alguien escanea tu casco o abre tu ficha, queda aquí.
          </p>
          {eventos.length ? (
            <ul className="mt-3 grid gap-2 text-sm">
              {eventos.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-stone-100 pb-2">
                  <span>
                    {textoEvento[e.tipo]}
                    {e.ayudante?.institucion && (
                      <span className="text-stone-500"> · {e.ayudante.institucion}</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-stone-500">{fecha(e.fecha)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-stone-500">Todavía no hay actividad.</p>
          )}
        </section>
      </div>
    </main>
  );
}
