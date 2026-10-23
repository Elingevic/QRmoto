"use client";

import { useState } from "react";

// Número venezolano a formato internacional para wa.me (0414… → 58414…).
function numeroWhatsapp(telefono: string) {
  const d = telefono.replace(/\D/g, "");
  if (d.startsWith("58")) return d;
  if (d.startsWith("0")) return `58${d.slice(1)}`;
  return d;
}

export default function Invitar({
  link,
  telefono,
  contacto,
  motorizado,
}: {
  link: string;
  telefono: string;
  contacto: string;
  motorizado: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const mensaje = `Hola ${contacto}, soy ${motorizado}. Te agregué como contacto de emergencia en Pulso: si tengo un accidente en la moto, te llegará una alerta con mi ubicación. Actívala aquí (se abre en Telegram): ${link}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <a
        href={`https://wa.me/${numeroWhatsapp(telefono)}?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg bg-green-600 py-2 text-center text-sm font-bold text-white"
      >
        Enviar por WhatsApp
      </a>
      <button onClick={copiar} className="rounded-lg bg-white py-2 text-sm font-semibold shadow-sm">
        {copiado ? "✓ Copiado" : "Copiar link"}
      </button>
    </div>
  );
}
