import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con la secret key: este módulo solo debe importarse desde el servidor.
let cliente: SupabaseClient | undefined;

export function sb() {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) throw new Error("Faltan SUPABASE_URL y SUPABASE_SECRET_KEY");
  cliente = createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}

export function fallar(contexto: string, error: { message: string }): never {
  throw new Error(`Supabase (${contexto}): ${error.message}`);
}
