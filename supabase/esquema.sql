-- QRmoto: esquema de base de datos.
-- Ejecutar una vez en Supabase > SQL Editor.
--
-- Todas las tablas tienen RLS activado y ninguna política: la clave pública
-- (anon/publishable) no puede leer ni escribir nada. Solo el servidor de la
-- app, con la secret key, accede a los datos.

create table if not exists motorizados (
  codigo        text primary key,
  nombre        text not null,
  apellido      text not null,
  cedula        text not null,
  edad          int  not null check (edad between 14 and 100),
  ciudad        text not null default '',
  sangre        text not null,
  donante       boolean not null default false,
  alergias      text[] not null default '{}',
  condiciones   text[] not null default '{}',
  medicamentos  text[] not null default '{}',
  notas         text not null default '',
  contactos     jsonb not null default '[]',
  seguro        jsonb,
  moto          jsonb not null,
  demo          boolean not null default false,
  creado        timestamptz not null default now()
);

create table if not exists eventos (
  id           uuid primary key default gen_random_uuid(),
  codigo       text not null references motorizados (codigo) on delete cascade,
  tipo         text not null check (tipo in ('escaneo', 'alerta_familia', 'acceso_verificado')),
  fecha        timestamptz not null default now(),
  ubicacion    jsonb,
  ayudante     jsonb,
  notificados  text[],
  mensaje      text
);

create index if not exists eventos_fecha_idx on eventos (fecha desc);
create index if not exists eventos_codigo_tipo_idx on eventos (codigo, tipo, fecha desc);

create table if not exists personal (
  usuario      text primary key,
  clave_hash   text not null,
  nombre       text not null,
  institucion  text not null,
  tipo         text not null check (tipo in ('paramedico', 'clinica', 'aseguradora'))
);

alter table motorizados enable row level security;
alter table eventos     enable row level security;
alter table personal    enable row level security;

-- Datos de demostración. Clave de las cuentas demo: demo2026 (guardada con scrypt).
insert into motorizados
  (codigo, nombre, apellido, cedula, edad, ciudad, sangre, donante,
   alergias, condiciones, medicamentos, notas, contactos, seguro, moto, demo)
values (
  'demo', 'José Gregorio', 'Pérez Rondón', 'V-18.456.789', 29, 'Caracas', 'O+', true,
  array['Penicilina', 'AINEs (ibuprofeno)'],
  array['Diabetes tipo 1'],
  array['Insulina glargina (diaria)'],
  'Usa lentes de contacto',
  '[{"nombre":"María Rondón","relacion":"Mamá","telefono":"+58 414-555-0101"},
    {"nombre":"Andreína Pérez","relacion":"Hermana","telefono":"+58 424-555-0202"}]',
  '{"aseguradora":"Aseguradora Demo","poliza":"AP-MOTO-2026-004512",
    "plan":"Accidentes Personales Moto","vigenteHasta":"2027-03-31",
    "coberturaEmergenciaUSD":3000,"telefonoEmergencia":"+58 212-555-0000",
    "verificado":true}',
  '{"marca":"Bera","modelo":"SBR 150","placa":"AB1C23D","color":"Negra"}',
  true
)
on conflict (codigo) do nothing;

insert into personal (usuario, clave_hash, nombre, institucion, tipo) values
  ('clinica.demo',
   'scrypt$8RHjRFKqavw_b43h22EJXg$QB8dtl-PpuI9GpE9wPviM1F42Kt6mxOyFbWpPtvylTIq7ne9Onsoa8OMyr_aKALfAfe7nwjLG7iGA7_hoFgJPQ',
   'Dra. Carolina Méndez', 'Clínica Demo Caracas', 'clinica'),
  ('paramedico.demo',
   'scrypt$8RHjRFKqavw_b43h22EJXg$QB8dtl-PpuI9GpE9wPviM1F42Kt6mxOyFbWpPtvylTIq7ne9Onsoa8OMyr_aKALfAfe7nwjLG7iGA7_hoFgJPQ',
   'Luis Rangel', 'Ambulancias Demo', 'paramedico'),
  ('aseguradora.demo',
   'scrypt$8RHjRFKqavw_b43h22EJXg$QB8dtl-PpuI9GpE9wPviM1F42Kt6mxOyFbWpPtvylTIq7ne9Onsoa8OMyr_aKALfAfe7nwjLG7iGA7_hoFgJPQ',
   'Centro de Siniestros', 'Aseguradora Demo', 'aseguradora')
on conflict (usuario) do nothing;
