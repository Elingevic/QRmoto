import type { Evento, Motorizado, Personal } from "../tipos";

export type EventoConMotorizado = Evento & { motorizado: Motorizado | null };

// Lo que necesita la app de cualquier almacenamiento (memoria o Supabase).
export interface Almacen {
  obtenerMotorizado(codigo: string): Promise<Motorizado | null>;
  // false si el código ya existía.
  insertarMotorizado(m: Motorizado): Promise<boolean>;
  obtenerPersonal(usuario: string): Promise<Personal | null>;
  ultimaAlerta(codigo: string): Promise<Evento | null>;
  insertarEvento(e: Evento): Promise<void>;
  listarEventos(limite: number): Promise<EventoConMotorizado[]>;
}
