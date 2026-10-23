export type Contacto = {
  nombre: string;
  relacion: string;
  telefono: string;
};

export type Seguro = {
  aseguradora: string;
  poliza: string;
  plan: string;
  vigenteHasta: string; // ISO date
  coberturaEmergenciaUSD: number;
  telefonoEmergencia: string;
  // true solo cuando la aseguradora confirmó la póliza; false si la declaró el usuario.
  verificado: boolean;
};

export type Motorizado = {
  codigo: string;
  nombre: string;
  apellido: string;
  cedula: string;
  edad: number;
  ciudad: string;
  sangre: string;
  donante: boolean;
  alergias: string[];
  condiciones: string[];
  medicamentos: string[];
  notas: string;
  contactos: Contacto[];
  seguro: Seguro | null;
  moto: { marca: string; modelo: string; placa: string; color: string };
  demo?: boolean;
};

export type Ubicacion = { lat: number; lng: number; precision?: number };

export type TipoEvento = "escaneo" | "alerta_familia" | "acceso_verificado";

export type Personal = {
  usuario: string;
  claveHash: string;
  nombre: string;
  institucion: string;
  tipo: "paramedico" | "clinica" | "aseguradora";
};

export type Evento = {
  id: string;
  codigo: string;
  tipo: TipoEvento;
  fecha: string; // ISO
  ubicacion?: Ubicacion;
  ayudante?: { nombre?: string; telefono?: string; institucion?: string };
  notificados?: string[];
  mensaje?: string;
};

// Nivel 1: lo que ve cualquier persona que escanea. Sin datos que permitan
// identificar o contactar a la familia.
export type VistaPublica = {
  codigo: string;
  primerNombre: string;
  edad: number;
  sangre: string;
  donante: boolean;
  alergias: string[];
  condiciones: string[];
  medicamentos: string[];
  notas: string;
  seguroActivo: boolean;
  seguroVerificado: boolean;
  aseguradora: string | null;
  totalContactos: number;
  demo: boolean;
};

// Nivel 3: solo para personal verificado con sesión activa. Un desconocido
// nunca recibe estos datos; ayuda a través de la alerta a la familia.
export type VistaCompleta = {
  nombreCompleto: string;
  cedula: string;
  ciudad: string;
  contactos: Contacto[];
  seguro: Seguro | null;
  moto: Motorizado["moto"];
};
