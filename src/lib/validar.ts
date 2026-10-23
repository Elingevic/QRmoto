import type { Motorizado, Seguro, Ubicacion } from "./tipos";

export function leerUbicacion(v: unknown): Ubicacion | undefined {
  if (!v || typeof v !== "object") return undefined;
  const { lat, lng, precision } = v as Record<string, unknown>;
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  return {
    lat,
    lng,
    precision: typeof precision === "number" ? precision : undefined,
  };
}

export function texto(v: unknown, max = 80) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function linkMapa(u: Ubicacion) {
  return `https://www.google.com/maps?q=${u.lat},${u.lng}`;
}

export const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No sé"];

function lista(v: unknown) {
  const items = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return items
    .map((i) => texto(i, 60))
    .filter(Boolean)
    .slice(0, 10);
}

function telefonoValido(t: string) {
  const digitos = t.replace(/\D/g, "").length;
  return digitos >= 10 && digitos <= 15;
}

// Valida el formulario de registro. Devuelve los datos limpios o el primer error.
export function leerRegistro(b: Record<string, unknown>):
  | { ok: true; datos: Omit<Motorizado, "codigo"> }
  | { ok: false; error: string } {
  const nombre = texto(b.nombre, 40);
  const apellido = texto(b.apellido, 40);
  const cedula = texto(b.cedula, 15).toUpperCase();
  const edad = Number(b.edad);
  const sangre = texto(b.sangre, 6);

  if (nombre.length < 2 || apellido.length < 2) return { ok: false, error: "Indica nombre y apellido." };
  if (!/^[VE]-?[\d.]{6,11}$/.test(cedula)) return { ok: false, error: "Cédula inválida (ej. V-12345678)." };
  if (!Number.isInteger(edad) || edad < 14 || edad > 100) return { ok: false, error: "Edad inválida." };
  if (!TIPOS_SANGRE.includes(sangre)) return { ok: false, error: "Selecciona el tipo de sangre." };
  if (b.consentimiento !== true) {
    return { ok: false, error: "Debes aceptar cómo se usarán tus datos." };
  }

  const contactos = (Array.isArray(b.contactos) ? b.contactos : [])
    .slice(0, 3)
    .map((c: Record<string, unknown>) => ({
      nombre: texto(c?.nombre, 40),
      relacion: texto(c?.relacion, 30),
      telefono: texto(c?.telefono, 20),
    }))
    .filter((c) => c.nombre || c.telefono);
  if (!contactos.length) return { ok: false, error: "Agrega al menos un contacto de emergencia." };
  if (contactos.some((c) => !c.nombre || !telefonoValido(c.telefono))) {
    return { ok: false, error: "Revisa el nombre y teléfono de tus contactos." };
  }

  const moto = (b.moto ?? {}) as Record<string, unknown>;
  const placa = texto(moto.placa, 10).toUpperCase().replace(/\s/g, "");
  if (placa.length < 5) return { ok: false, error: "Indica la placa de la moto." };

  let seguro: Seguro | null = null;
  const s = b.seguro as Record<string, unknown> | null;
  if (s) {
    const vigenteHasta = texto(s.vigenteHasta, 10);
    seguro = {
      aseguradora: texto(s.aseguradora, 60),
      poliza: texto(s.poliza, 30),
      plan: texto(s.plan, 60) || "Sin especificar",
      vigenteHasta,
      coberturaEmergenciaUSD: 0,
      telefonoEmergencia: texto(s.telefonoEmergencia, 20),
      verificado: false,
    };
    if (!seguro.aseguradora || !seguro.poliza || !/^\d{4}-\d{2}-\d{2}$/.test(vigenteHasta)) {
      return { ok: false, error: "Completa aseguradora, póliza y fecha de vigencia." };
    }
  }

  return {
    ok: true,
    datos: {
      nombre,
      apellido,
      cedula,
      edad,
      ciudad: texto(b.ciudad, 40),
      sangre,
      donante: b.donante === true,
      alergias: lista(b.alergias),
      condiciones: lista(b.condiciones),
      medicamentos: lista(b.medicamentos),
      notas: texto(b.notas, 120),
      contactos,
      seguro,
      moto: {
        marca: texto(moto.marca, 30),
        modelo: texto(moto.modelo, 30),
        placa,
        color: texto(moto.color, 20),
      },
    },
  };
}
