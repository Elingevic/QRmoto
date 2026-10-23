-- Pulso: alertas reales y panel privado del motorizado.
-- Ejecutar una vez en Supabase > SQL Editor, después de esquema.sql.

-- Hash (sha256) del link privado del motorizado. El link en sí nunca se guarda.
alter table motorizados add column if not exists gestion_hash text unique;

-- Un canal por contacto de emergencia. El familiar lo activa abriendo su link
-- de invitación (t.me/<bot>?start=<token>), que solo el motorizado puede ver.
create table if not exists canales_contacto (
  token     text primary key,
  codigo    text not null references motorizados (codigo) on delete cascade,
  contacto  int  not null,           -- posición en motorizados.contactos
  telefono  text not null,           -- para invalidar el canal si cambia el número
  canal     text not null default 'telegram' check (canal in ('telegram', 'whatsapp')),
  chat_id   text,
  activado  timestamptz,
  unique (codigo, contacto, canal)
);

create index if not exists canales_contacto_codigo_idx on canales_contacto (codigo);
create index if not exists canales_contacto_chat_idx on canales_contacto (chat_id);

alter table canales_contacto enable row level security;

-- Clave de emergencia: la clínica la solicita desde la ficha y la aseguradora
-- la aprueba o rechaza desde su panel.
create table if not exists solicitudes_clave (
  id           uuid primary key default gen_random_uuid(),
  codigo       text not null references motorizados (codigo) on delete cascade,
  institucion  text not null,
  solicitante  text not null,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'aprobada', 'rechazada')),
  clave        text unique,
  monto_usd    int,
  motivo       text,
  creado       timestamptz not null default now(),
  resuelto     timestamptz,
  resuelto_por text
);

create index if not exists solicitudes_clave_estado_idx on solicitudes_clave (estado, creado desc);
create index if not exists solicitudes_clave_codigo_idx on solicitudes_clave (codigo, creado desc);

alter table solicitudes_clave enable row level security;
