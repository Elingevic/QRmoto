"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Marca from "@/components/Marca";
import type { Motorizado } from "@/lib/tipos";
import { TIPOS_SANGRE } from "@/lib/validar";

type ContactoForm = { nombre: string; relacion: string; telefono: string };

const vacio: ContactoForm = { nombre: "", relacion: "", telefono: "" };

const entrada = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base";

// Crear (registro) o editar (desde el panel privado /mi/<token>).
type Modo = { tipo: "crear" } | { tipo: "editar"; gestion: string };

export default function FormFicha({
  modo,
  inicial,
}: {
  modo: Modo;
  inicial?: Omit<Motorizado, "codigo">;
}) {
  const router = useRouter();
  const editando = modo.tipo === "editar";
  const [f, setF] = useState({
    nombre: inicial?.nombre ?? "",
    apellido: inicial?.apellido ?? "",
    cedula: inicial?.cedula ?? "",
    edad: inicial ? String(inicial.edad) : "",
    ciudad: inicial?.ciudad ?? "",
    sangre: inicial?.sangre ?? "",
    donante: inicial?.donante ?? false,
    alergias: inicial?.alergias.join(", ") ?? "",
    condiciones: inicial?.condiciones.join(", ") ?? "",
    medicamentos: inicial?.medicamentos.join(", ") ?? "",
    notas: inicial?.notas ?? "",
  });
  const [contactos, setContactos] = useState<ContactoForm[]>(
    inicial?.contactos.length ? inicial.contactos : [{ ...vacio }],
  );
  const [moto, setMoto] = useState(inicial?.moto ?? { marca: "", modelo: "", placa: "", color: "" });
  const [tieneSeguro, setTieneSeguro] = useState(!!inicial?.seguro);
  const [seguro, setSeguro] = useState({
    aseguradora: inicial?.seguro?.aseguradora ?? "",
    poliza: inicial?.seguro?.poliza ?? "",
    plan: inicial?.seguro?.plan ?? "",
    vigenteHasta: inicial?.seguro?.vigenteHasta ?? "",
    telefonoEmergencia: inicial?.seguro?.telefonoEmergencia ?? "",
  });
  // Al editar, el consentimiento ya se dio en el registro.
  const [consentimiento, setConsentimiento] = useState(editando);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const campo = (k: keyof typeof f) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value }),
  });

  function cambiarContacto(i: number, k: keyof ContactoForm, v: string) {
    setContactos(contactos.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const r = await fetch(editando ? `/api/mi/${modo.gestion}` : "/api/motorizados", {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        edad: Number(f.edad),
        contactos,
        moto,
        seguro: tieneSeguro ? seguro : null,
        consentimiento,
      }),
    }).catch(() => null);
    setEnviando(false);
    if (!r) return setError("Sin conexión. Inténtalo de nuevo.");
    const json = await r.json();
    if (!r.ok) return setError(json.error ?? "No se pudo guardar.");
    router.push(editando ? `/mi/${modo.gestion}?guardado=1` : `/mi/${json.gestion}?nuevo=1`);
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-8 text-stone-900">
      <form onSubmit={enviar} className="mx-auto grid max-w-lg gap-5">
        <header>
          <Marca />
          <h1 className="mt-1 text-3xl font-extrabold">
            {editando ? "Editar mi ficha" : "Crea tu QR de emergencia"}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {editando
              ? "Tu QR no cambia: el sticker que ya pegaste sigue sirviendo."
              : "Toma unos 3 minutos. Al final podrás imprimir el sticker para tu casco."}
          </p>
        </header>

        <Seccion titulo="Tus datos" nota="Solo el primer nombre y la edad se muestran a quien te ayude.">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nombre" className={entrada} {...campo("nombre")} />
            <input required placeholder="Apellido" className={entrada} {...campo("apellido")} />
            <input required placeholder="Cédula (V-12345678)" className={entrada} {...campo("cedula")} />
            <input
              required
              type="number"
              min={14}
              max={100}
              placeholder="Edad"
              className={entrada}
              {...campo("edad")}
            />
          </div>
          <input placeholder="Ciudad" className={entrada} {...campo("ciudad")} />
        </Seccion>

        <Seccion titulo="Datos médicos" nota="Se muestran a cualquiera que escanee tu QR: es lo que salva tu vida.">
          <div className="grid grid-cols-2 gap-3">
            <select required className={entrada} {...campo("sangre")}>
              <option value="">Tipo de sangre</option>
              {TIPOS_SANGRE.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.donante}
                onChange={(e) => setF({ ...f, donante: e.target.checked })}
              />
              Soy donante de órganos
            </label>
          </div>
          <input placeholder="Alergias (separadas por coma)" className={entrada} {...campo("alergias")} />
          <input placeholder="Condiciones (ej. asma, diabetes)" className={entrada} {...campo("condiciones")} />
          <input placeholder="Medicamentos que tomas" className={entrada} {...campo("medicamentos")} />
          <input placeholder="Notas (ej. uso lentes de contacto)" className={entrada} {...campo("notas")} />
        </Seccion>

        <Seccion
          titulo="Contactos de emergencia"
          nota="Nunca se muestran a desconocidos. Reciben la alerta con tu ubicación."
        >
          {contactos.map((c, i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-stone-50 p-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="Nombre"
                  value={c.nombre}
                  onChange={(e) => cambiarContacto(i, "nombre", e.target.value)}
                  className={entrada}
                />
                <input
                  placeholder="Relación (Mamá, Esposa…)"
                  value={c.relacion}
                  onChange={(e) => cambiarContacto(i, "relacion", e.target.value)}
                  className={entrada}
                />
              </div>
              <div className="flex gap-2">
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="Teléfono (0414-1234567)"
                  value={c.telefono}
                  onChange={(e) => cambiarContacto(i, "telefono", e.target.value)}
                  className={entrada}
                />
                {contactos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContactos(contactos.filter((_, j) => j !== i))}
                    className="rounded-lg px-3 text-sm font-semibold text-stone-500"
                    aria-label="Quitar contacto"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          {contactos.length < 3 && (
            <button
              type="button"
              onClick={() => setContactos([...contactos, { ...vacio }])}
              className="rounded-lg border border-dashed border-stone-400 py-2 text-sm font-semibold text-stone-600"
            >
              + Agregar otro contacto
            </button>
          )}
        </Seccion>

        <Seccion titulo="Tu moto">
          <div className="grid grid-cols-2 gap-3">
            {(["marca", "modelo", "placa", "color"] as const).map((k) => (
              <input
                key={k}
                required={k === "placa"}
                placeholder={k[0].toUpperCase() + k.slice(1)}
                value={moto[k]}
                onChange={(e) => setMoto({ ...moto, [k]: e.target.value })}
                className={entrada}
              />
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Seguro">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={tieneSeguro}
              onChange={(e) => setTieneSeguro(e.target.checked)}
            />
            Tengo un seguro (RCV, accidentes personales, salud…)
          </label>
          {tieneSeguro && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Aseguradora"
                  value={seguro.aseguradora}
                  onChange={(e) => setSeguro({ ...seguro, aseguradora: e.target.value })}
                  className={entrada}
                />
                <input
                  required
                  placeholder="N.º de póliza"
                  value={seguro.poliza}
                  onChange={(e) => setSeguro({ ...seguro, poliza: e.target.value })}
                  className={entrada}
                />
                <input
                  placeholder="Plan (ej. RCV)"
                  value={seguro.plan}
                  onChange={(e) => setSeguro({ ...seguro, plan: e.target.value })}
                  className={entrada}
                />
                <input
                  type="tel"
                  placeholder="Tel. de emergencias"
                  value={seguro.telefonoEmergencia}
                  onChange={(e) => setSeguro({ ...seguro, telefonoEmergencia: e.target.value })}
                  className={entrada}
                />
              </div>
              <label className="text-sm text-stone-600">
                Vigente hasta
                <input
                  required
                  type="date"
                  value={seguro.vigenteHasta}
                  onChange={(e) => setSeguro({ ...seguro, vigenteHasta: e.target.value })}
                  className={`${entrada} mt-1`}
                />
              </label>
              <p className="text-xs text-stone-500">
                Aparecerá como &quot;declarado&quot; hasta que tu aseguradora lo confirme.
              </p>
            </>
          )}
        </Seccion>

        {!editando && (
          <label className="flex gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              className="mt-1"
            />
            <span>
              Entiendo que <b>mis datos médicos y mi primer nombre</b> serán visibles para quien escanee
              mi QR, y que mi identidad, póliza y contactos solo los verá personal médico verificado
              y mi aseguradora.
            </span>
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        )}
        <button
          disabled={enviando || !consentimiento}
          className="rounded-xl bg-red-700 py-4 text-lg font-extrabold text-white shadow disabled:opacity-50"
        >
          {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Crear mi QR"}
        </button>
      </form>
    </main>
  );
}

function Seccion({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <legend className="sr-only">{titulo}</legend>
      <div>
        <p className="font-bold">{titulo}</p>
        {nota && <p className="text-xs text-stone-500">{nota}</p>}
      </div>
      {children}
    </fieldset>
  );
}
