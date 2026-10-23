import { createHash, randomBytes } from "node:crypto";
import { verificarClave } from "./clave";
import { fallar, sb } from "./supabase";
import type {
  Canal,
  Contacto,
  EstadoClave,
  Evento,
  Motorizado,
  Personal,
  SolicitudClave,
  TipoEvento,
  VistaCompleta,
  VistaPublica,
} from "./tipos";

type EventoConMotorizado = Evento & { motorizado: Motorizado | null };

const COLUMNAS_MOTORIZADO =
  "codigo, nombre, apellido, cedula, edad, ciudad, sangre, donante, alergias, condiciones, medicamentos, notas, contactos, seguro, moto, demo";

function token(bytes: number) {
  return randomBytes(bytes).toString("base64url");
}

function sha256(texto: string) {
  return createHash("sha256").update(texto).digest("hex");
}

function digitos(t: string) {
  return t.replace(/\D/g, "");
}

// ---------- Motorizados ----------

export async function obtenerMotorizado(codigo: string) {
  const { data, error } = await sb()
    .from("motorizados")
    .select(COLUMNAS_MOTORIZADO)
    .eq("codigo", codigo)
    .maybeSingle();
  if (error) fallar("obtenerMotorizado", error);
  return data as Motorizado | null;
}

// El link privado del motorizado (/mi/<token>). Solo se guarda su hash.
export async function obtenerPorGestion(gestion: string) {
  if (!/^[\w-]{20,64}$/.test(gestion)) return null;
  const { data, error } = await sb()
    .from("motorizados")
    .select(COLUMNAS_MOTORIZADO)
    .eq("gestion_hash", sha256(gestion))
    .maybeSingle();
  if (error) fallar("obtenerPorGestion", error);
  return data as Motorizado | null;
}

// Código público del QR: aleatorio y difícil de adivinar, para que nadie pueda
// recorrer fichas probando códigos. Sin caracteres ambiguos (0/O, 1/I/L).
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function nuevoCodigo() {
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

export async function crearMotorizado(d: Omit<Motorizado, "codigo">) {
  const gestion = token(24);
  for (let intento = 0; intento < 5; intento++) {
    const m: Motorizado = { ...d, codigo: nuevoCodigo(), demo: false };
    const { error } = await sb()
      .from("motorizados")
      .insert({ ...m, gestion_hash: sha256(gestion) });
    if (error?.code === "23505") continue; // código repetido
    if (error) fallar("crearMotorizado", error);
    await sincronizarCanales(m.codigo, m.contactos);
    return { motorizado: m, gestion };
  }
  throw new Error("No se pudo generar un código único");
}

export async function actualizarMotorizado(codigo: string, d: Omit<Motorizado, "codigo">) {
  // codigo, demo y gestion_hash no se pueden cambiar desde el formulario.
  const { demo: _demo, ...campos } = d;
  void _demo;
  const { error } = await sb().from("motorizados").update(campos).eq("codigo", codigo);
  if (error) fallar("actualizarMotorizado", error);
  await sincronizarCanales(codigo, d.contactos);
}

// ---------- Canales de alerta ----------

type FilaCanal = {
  token: string;
  codigo: string;
  contacto: number;
  telefono: string;
  canal: "telegram" | "whatsapp";
  chat_id: string | null;
  activado: string | null;
};

function aCanal(f: FilaCanal): Canal {
  return {
    token: f.token,
    contacto: f.contacto,
    canal: f.canal,
    chatId: f.chat_id,
    activado: f.activado,
  };
}

// Un canal de Telegram por contacto. Si un contacto cambió de número, su canal
// se reemplaza: el número viejo deja de recibir alertas.
async function sincronizarCanales(codigo: string, contactos: Contacto[]) {
  const { data, error } = await sb()
    .from("canales_contacto")
    .select("*")
    .eq("codigo", codigo)
    .eq("canal", "telegram");
  if (error) fallar("sincronizarCanales", error);
  const actuales = (data ?? []) as FilaCanal[];

  const borrar = actuales
    .filter(
      (f) =>
        f.contacto >= contactos.length ||
        digitos(f.telefono) !== digitos(contactos[f.contacto].telefono),
    )
    .map((f) => f.token);
  if (borrar.length) {
    const { error: e } = await sb().from("canales_contacto").delete().in("token", borrar);
    if (e) fallar("sincronizarCanales", e);
  }

  const conservados = new Set(
    actuales.filter((f) => !borrar.includes(f.token)).map((f) => f.contacto),
  );
  const nuevos = contactos
    .map((c, i) => ({ c, i }))
    .filter(({ i }) => !conservados.has(i))
    .map(({ c, i }) => ({
      token: token(16),
      codigo,
      contacto: i,
      telefono: c.telefono,
      canal: "telegram",
    }));
  if (nuevos.length) {
    const { error: e } = await sb().from("canales_contacto").insert(nuevos);
    if (e) fallar("sincronizarCanales", e);
  }
}

export async function listarCanales(codigo: string) {
  const { data, error } = await sb()
    .from("canales_contacto")
    .select("*")
    .eq("codigo", codigo)
    .order("contacto");
  if (error) fallar("listarCanales", error);
  return ((data ?? []) as FilaCanal[]).map(aCanal);
}

// El familiar abrió su link de invitación en Telegram.
export async function activarCanal(tokenCanal: string, chatId: string) {
  if (!/^[\w-]{10,64}$/.test(tokenCanal)) return null;
  const { data, error } = await sb()
    .from("canales_contacto")
    .update({ chat_id: chatId, activado: new Date().toISOString() })
    .eq("token", tokenCanal)
    .select("codigo, contacto")
    .maybeSingle();
  if (error) fallar("activarCanal", error);
  return data as { codigo: string; contacto: number } | null;
}

export async function desactivarChat(chatId: string) {
  const { error } = await sb()
    .from("canales_contacto")
    .update({ chat_id: null, activado: null })
    .eq("chat_id", chatId);
  if (error) fallar("desactivarChat", error);
}

// ---------- Personal verificado ----------

type PersonalPublico = Omit<Personal, "claveHash">;

async function filaPersonal(usuario: string) {
  const { data, error } = await sb()
    .from("personal")
    .select("*")
    .eq("usuario", usuario)
    .maybeSingle();
  if (error) fallar("obtenerPersonal", error);
  return data as (PersonalPublico & { clave_hash: string }) | null;
}

export async function obtenerPersonal(usuario: string): Promise<PersonalPublico | null> {
  const p = await filaPersonal(usuario);
  return p && { usuario: p.usuario, nombre: p.nombre, institucion: p.institucion, tipo: p.tipo };
}

export async function verificarPersonal(usuario: string, clave: string) {
  const p = await filaPersonal(usuario);
  if (!p || !verificarClave(clave, p.clave_hash)) return null;
  return { usuario: p.usuario, nombre: p.nombre, institucion: p.institucion, tipo: p.tipo };
}

// ---------- Eventos ----------

// Último evento de un tipo, opcionalmente de un ayudante concreto (por nombre).
export async function ultimoEvento(codigo: string, tipo: TipoEvento, ayudante?: string) {
  let q = sb().from("eventos").select("*").eq("codigo", codigo).eq("tipo", tipo);
  if (ayudante) q = q.eq("ayudante->>nombre", ayudante);
  const { data, error } = await q.order("fecha", { ascending: false }).limit(1).maybeSingle();
  if (error) fallar("ultimoEvento", error);
  return data as Evento | null;
}

export async function registrarEvento(e: Omit<Evento, "id" | "fecha">) {
  const evento: Evento = {
    ...e,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  };
  const { error } = await sb().from("eventos").insert(evento);
  if (error) fallar("registrarEvento", error);
  return evento;
}

// Historial de un solo motorizado, para su panel privado.
export async function eventosDe(codigo: string, limite = 10) {
  const { data, error } = await sb()
    .from("eventos")
    .select("*")
    .eq("codigo", codigo)
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) fallar("eventosDe", error);
  return (data ?? []) as Evento[];
}

export async function listarEventos(limite = 50) {
  const { data, error } = await sb()
    .from("eventos")
    .select(`*, motorizado:motorizados(${COLUMNAS_MOTORIZADO})`)
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) fallar("listarEventos", error);
  return data as EventoConMotorizado[];
}

// ---------- Vistas ----------

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

// ---------- Clave de emergencia ----------

type FilaSolicitud = {
  id: string;
  codigo: string;
  institucion: string;
  solicitante: string;
  estado: EstadoClave;
  clave: string | null;
  monto_usd: number | null;
  motivo: string | null;
  creado: string;
  resuelto: string | null;
  resuelto_por: string | null;
};

function aSolicitud(f: FilaSolicitud): SolicitudClave {
  return {
    id: f.id,
    codigo: f.codigo,
    institucion: f.institucion,
    solicitante: f.solicitante,
    estado: f.estado,
    clave: f.clave,
    montoUSD: f.monto_usd,
    motivo: f.motivo,
    creado: f.creado,
    resuelto: f.resuelto,
    resueltoPor: f.resuelto_por,
  };
}

// La solicitud más reciente de una institución para este motorizado.
export async function ultimaSolicitud(codigo: string, institucion: string) {
  const { data, error } = await sb()
    .from("solicitudes_clave")
    .select("*")
    .eq("codigo", codigo)
    .eq("institucion", institucion)
    .order("creado", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fallar("ultimaSolicitud", error);
  return data ? aSolicitud(data as FilaSolicitud) : null;
}

export async function crearSolicitud(codigo: string, institucion: string, solicitante: string) {
  const { data, error } = await sb()
    .from("solicitudes_clave")
    .insert({ codigo, institucion, solicitante })
    .select("*")
    .single();
  if (error) fallar("crearSolicitud", error);
  return aSolicitud(data as FilaSolicitud);
}

export async function listarSolicitudes(limite = 20) {
  const { data, error } = await sb()
    .from("solicitudes_clave")
    .select("*, motorizado:motorizados(nombre, apellido, cedula, seguro)")
    .order("creado", { ascending: false })
    .limit(limite);
  if (error) fallar("listarSolicitudes", error);
  type Fila = FilaSolicitud & {
    motorizado: Pick<Motorizado, "nombre" | "apellido" | "cedula" | "seguro"> | null;
  };
  return ((data ?? []) as Fila[]).map((f) => ({ ...aSolicitud(f), motorizado: f.motorizado }));
}

// Solo resuelve solicitudes pendientes: dos clics simultáneos no generan dos claves.
export async function resolverSolicitud(
  id: string,
  cambios: { estado: "aprobada" | "rechazada"; resueltoPor: string; montoUSD?: number; motivo?: string },
) {
  const clave =
    cambios.estado === "aprobada"
      ? `CE-${Array.from(randomBytes(6), (b) => ALFABETO[b % ALFABETO.length]).join("")}`
      : null;
  const { data, error } = await sb()
    .from("solicitudes_clave")
    .update({
      estado: cambios.estado,
      clave,
      monto_usd: cambios.montoUSD ?? null,
      motivo: cambios.motivo ?? null,
      resuelto: new Date().toISOString(),
      resuelto_por: cambios.resueltoPor,
    })
    .eq("id", id)
    .eq("estado", "pendiente")
    .select("*")
    .maybeSingle();
  if (error) fallar("resolverSolicitud", error);
  return data ? aSolicitud(data as FilaSolicitud) : null;
}
