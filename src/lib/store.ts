import { verificarClave } from "./clave";
import { almacenMemoria } from "./datos/memoria";
import { almacenSupabase } from "./datos/supabase";
import type { Almacen } from "./datos/tipos";
import type {
  Evento,
  Motorizado,
  Personal,
  VistaCompleta,
  VistaPublica,
} from "./tipos";

// Supabase si está configurado; si no, memoria (solo para desarrollo local).
let almacen: Almacen | undefined;
function datos() {
  if (almacen) return almacen;
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (url && clave) {
    almacen = almacenSupabase(url, clave);
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("QRmoto: sin SUPABASE_URL/SUPABASE_SECRET_KEY, usando memoria.");
    }
    almacen = almacenMemoria();
  }
  return almacen;
}

export async function obtenerMotorizado(codigo: string) {
  return datos().obtenerMotorizado(codigo);
}

// Código público del QR: aleatorio y difícil de adivinar, para que nadie pueda
// recorrer fichas probando códigos. Sin caracteres ambiguos (0/O, 1/I/L).
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function nuevoCodigo() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export async function crearMotorizado(d: Omit<Motorizado, "codigo">) {
  for (let intento = 0; intento < 5; intento++) {
    const m: Motorizado = { ...d, codigo: nuevoCodigo() };
    if (await datos().insertarMotorizado(m)) return m;
  }
  throw new Error("No se pudo generar un código único");
}

type PersonalPublico = Omit<Personal, "claveHash">;

function sinClave(p: Personal): PersonalPublico {
  return { usuario: p.usuario, nombre: p.nombre, institucion: p.institucion, tipo: p.tipo };
}

export async function obtenerPersonal(usuario: string) {
  const p = await datos().obtenerPersonal(usuario);
  return p && sinClave(p);
}

export async function verificarPersonal(usuario: string, clave: string) {
  const p = await datos().obtenerPersonal(usuario);
  return p && verificarClave(clave, p.claveHash) ? sinClave(p) : null;
}

export async function ultimaAlerta(codigo: string) {
  return datos().ultimaAlerta(codigo);
}

export async function registrarEvento(e: Omit<Evento, "id" | "fecha">) {
  const evento: Evento = {
    ...e,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  };
  await datos().insertarEvento(evento);
  return evento;
}

export async function listarEventos(limite = 50) {
  return datos().listarEventos(limite);
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
