import { hashClave } from "../clave";
import type { Evento, Motorizado, Personal } from "../tipos";
import type { Almacen } from "./tipos";

// Almacenamiento en memoria para desarrollo local sin Supabase. Se pierde al
// reiniciar y no sirve en Vercel (cada instancia tendría su propia memoria).

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

// Cuentas demo, clave "demo2026" (igual que en supabase/esquema.sql).
const personalSemilla: Omit<Personal, "claveHash">[] = [
  { usuario: "clinica.demo", nombre: "Dra. Carolina Méndez", institucion: "Clínica Demo Caracas", tipo: "clinica" },
  { usuario: "paramedico.demo", nombre: "Luis Rangel", institucion: "Ambulancias Demo", tipo: "paramedico" },
  { usuario: "aseguradora.demo", nombre: "Centro de Siniestros", institucion: "Aseguradora Demo", tipo: "aseguradora" },
];

type Db = {
  motorizados: Map<string, Motorizado>;
  personal: Map<string, Personal>;
  eventos: Evento[];
};

function crearDb(): Db {
  const claveHash = hashClave("demo2026");
  return {
    motorizados: new Map(semilla.map((m) => [m.codigo, m])),
    personal: new Map(personalSemilla.map((p) => [p.usuario, { ...p, claveHash }])),
    eventos: [],
  };
}

const g = globalThis as unknown as { __qrmotoDb?: Db };

export function almacenMemoria(): Almacen {
  const db = (g.__qrmotoDb ??= crearDb());
  return {
    async obtenerMotorizado(codigo) {
      return db.motorizados.get(codigo) ?? null;
    },
    async insertarMotorizado(m) {
      if (db.motorizados.has(m.codigo)) return false;
      db.motorizados.set(m.codigo, m);
      return true;
    },
    async obtenerPersonal(usuario) {
      return db.personal.get(usuario) ?? null;
    },
    async ultimaAlerta(codigo) {
      return db.eventos.find((e) => e.codigo === codigo && e.tipo === "alerta_familia") ?? null;
    },
    async insertarEvento(e) {
      db.eventos.unshift(e);
    },
    async listarEventos(limite) {
      return db.eventos.slice(0, limite).map((e) => ({
        ...e,
        motorizado: db.motorizados.get(e.codigo) ?? null,
      }));
    },
  };
}
