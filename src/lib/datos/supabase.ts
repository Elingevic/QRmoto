import { createClient } from "@supabase/supabase-js";
import type { Evento, Motorizado, Personal } from "../tipos";
import type { Almacen, EventoConMotorizado } from "./tipos";

// Usa la secret key: este módulo solo debe importarse desde el servidor.
export function almacenSupabase(url: string, clave: string): Almacen {
  const sb = createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  function fallar(contexto: string, error: { message: string }): never {
    throw new Error(`Supabase (${contexto}): ${error.message}`);
  }

  return {
    async obtenerMotorizado(codigo) {
      const { data, error } = await sb
        .from("motorizados")
        .select("*")
        .eq("codigo", codigo)
        .maybeSingle();
      if (error) fallar("obtenerMotorizado", error);
      return data as Motorizado | null;
    },

    async insertarMotorizado(m) {
      const { error } = await sb.from("motorizados").insert(m);
      if (error?.code === "23505") return false; // código repetido
      if (error) fallar("insertarMotorizado", error);
      return true;
    },

    async obtenerPersonal(usuario) {
      const { data, error } = await sb
        .from("personal")
        .select("*")
        .eq("usuario", usuario)
        .maybeSingle();
      if (error) fallar("obtenerPersonal", error);
      if (!data) return null;
      const { clave_hash, ...resto } = data;
      return { ...resto, claveHash: clave_hash } as Personal;
    },

    async ultimaAlerta(codigo) {
      const { data, error } = await sb
        .from("eventos")
        .select("*")
        .eq("codigo", codigo)
        .eq("tipo", "alerta_familia")
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) fallar("ultimaAlerta", error);
      return data as Evento | null;
    },

    async insertarEvento(e) {
      const { error } = await sb.from("eventos").insert(e);
      if (error) fallar("insertarEvento", error);
    },

    async listarEventos(limite) {
      const { data, error } = await sb
        .from("eventos")
        .select("*, motorizado:motorizados(*)")
        .order("fecha", { ascending: false })
        .limit(limite);
      if (error) fallar("listarEventos", error);
      return data as EventoConMotorizado[];
    },
  };
}
