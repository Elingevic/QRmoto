import { listarCanales } from "./store";
import { enviarTexto, enviarUbicacion, telegramConfigurado } from "./telegram";
import type { Motorizado, Ubicacion } from "./tipos";

// Envía un aviso a los contactos del motorizado por el canal que cada uno
// activó. Devuelve, por contacto, cómo terminó el envío (para el panel).
// Un fallo de un contacto nunca impide avisar a los demás.
export async function notificarContactos(
  m: Motorizado,
  texto: string,
  ubicacion?: Ubicacion,
): Promise<string[]> {
  const canales = telegramConfigurado() ? await listarCanales(m.codigo) : [];

  return Promise.all(
    m.contactos.map(async (c, i) => {
      const etiqueta = `${c.nombre} (${c.relacion || "contacto"})`;
      const canal = canales.find((k) => k.contacto === i && k.canal === "telegram" && k.chatId);
      if (!canal?.chatId) return `${etiqueta} · sin alertas activadas`;
      try {
        await enviarTexto(canal.chatId, texto);
        if (ubicacion) await enviarUbicacion(canal.chatId, ubicacion.lat, ubicacion.lng);
        return `${etiqueta} · Telegram ✓`;
      } catch (e) {
        console.error("QRmoto: fallo al notificar", e);
        return `${etiqueta} · Telegram falló`;
      }
    }),
  );
}

export function horaCaracas(fecha = new Date()) {
  return fecha.toLocaleTimeString("es-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
  });
}
