import type {
  Evento,
  Motorizado,
  Personal,
  VistaCompleta,
  VistaPublica,
} from "./tipos";

// Almacenamiento en memoria para el demo local. Se reemplaza por Supabase al
// publicar (en serverless cada instancia tendría su propia memoria).

const semilla: Motorizado[] = [
  {
    codigo: "demo",
    nombre: "José Gregorio",
    apellido: "Pérez Rondón",
    cedula: "V-18.456.789",
    edad: 29,
    ciudad: "Caracas",
    sangre: "O+",
    donante: true,
    alergias: ["Penicilina", "AINEs (ibuprofeno)"],
    condiciones: ["Diabetes tipo 1"],
    medicamentos: ["Insulina glargina (diaria)"],
    notas: "Usa lentes de contacto",
    contactos: [
      { nombre: "María Rondón", relacion: "Mamá", telefono: "+58 414-555-0101" },
      { nombre: "Andreína Pérez", relacion: "Hermana", telefono: "+58 424-555-0202" },
    ],
    seguro: {
      aseguradora: "Aseguradora Demo",
      poliza: "AP-MOTO-2026-004512",
      plan: "Accidentes Personales Moto",
      vigenteHasta: "2027-03-31",
      coberturaEmergenciaUSD: 3000,
      telefonoEmergencia: "+58 212-555-0000",
      verificado: true,
    },
    moto: { marca: "Bera", modelo: "SBR 150", placa: "AB1C23D", color: "Negra" },
    demo: true,
  },
];

// Demo: al pasar a Supabase las claves se guardan con hash.
const personalSemilla: Personal[] = [
  {
    usuario: "clinica.demo",
    clave: "demo2026",
    nombre: "Dra. Carolina Méndez",
    institucion: "Clínica Demo Caracas",
    tipo: "clinica",
  },
  {
    usuario: "paramedico.demo",
    clave: "demo2026",
    nombre: "Luis Rangel",
    institucion: "Ambulancias Demo",
    tipo: "paramedico",
  },
  {
    usuario: "aseguradora.demo",
    clave: "demo2026",
    nombre: "Centro de Siniestros",
    institucion: "Aseguradora Demo",
    tipo: "aseguradora",
  },
];

type Db = {
  motorizados: Map<string, Motorizado>;
  personal: Map<string, Personal>;
  eventos: Evento[];
};

const g = globalThis as unknown as { __qrmotoDb?: Db };
const db: Db =
  g.__qrmotoDb ??
  (g.__qrmotoDb = {
    motorizados: new Map(semilla.map((m) => [m.codigo, m])),
    personal: new Map(personalSemilla.map((p) => [p.usuario, p])),
    eventos: [],
  });

export async function obtenerMotorizado(codigo: string) {
  return db.motorizados.get(codigo) ?? null;
}

// Código público del QR: aleatorio y difícil de adivinar, para que nadie pueda
// recorrer fichas probando códigos. Sin caracteres ambiguos (0/O, 1/I/L).
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function nuevoCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export async function crearMotorizado(datos: Omit<Motorizado, "codigo">) {
  let codigo = nuevoCodigo();
  while (db.motorizados.has(codigo)) codigo = nuevoCodigo();
  const m: Motorizado = { ...datos, codigo };
  db.motorizados.set(codigo, m);
  return m;
}

export async function obtenerPersonal(usuario: string) {
  return db.personal.get(usuario) ?? null;
}

export async function verificarPersonal(usuario: string, clave: string) {
  const p = db.personal.get(usuario);
  return p && p.clave === clave ? p : null;
}

export async function ultimaAlerta(codigo: string) {
  return db.eventos.find((e) => e.codigo === codigo && e.tipo === "alerta_familia") ?? null;
}

export async function registrarEvento(e: Omit<Evento, "id" | "fecha">) {
  const evento: Evento = {
    ...e,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  };
  db.eventos.unshift(evento);
  return evento;
}

export async function listarEventos(limite = 50) {
  return db.eventos.slice(0, limite).map((e) => ({
    ...e,
    motorizado: db.motorizados.get(e.codigo) ?? null,
  }));
}

export function seguroVigente(m: Motorizado) {
  return !!m.seguro && new Date(m.seguro.vigenteHasta) >= new Date();
}

export function vistaPublica(m: Motorizado): VistaPublica {
  const activo = seguroVigente(m);
  return {
    codigo: m.codigo,
    primerNombre: m.nombre.split(" ")[0],
    edad: m.edad,
    sangre: m.sangre,
    donante: m.donante,
    alergias: m.alergias,
    condiciones: m.condiciones,
    medicamentos: m.medicamentos,
    notas: m.notas,
    seguroActivo: activo,
    seguroVerificado: activo && m.seguro!.verificado,
    aseguradora: activo ? m.seguro!.aseguradora : null,
    totalContactos: m.contactos.length,
    demo: !!m.demo,
  };
}

export function vistaCompleta(m: Motorizado): VistaCompleta {
  return {
    nombreCompleto: `${m.nombre} ${m.apellido}`,
    cedula: m.cedula,
    ciudad: m.ciudad,
    contactos: m.contactos,
    seguro: m.seguro,
    moto: m.moto,
  };
}
