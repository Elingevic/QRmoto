# QRmoto

QR de emergencia para motorizados, conectado a su seguro. Prototipo para AseguraTech26.

- **Quien ayuda** escanea el casco y ve solo lo médico (sangre, alergias, condiciones). Con un toque avisa a la familia y a la aseguradora con su ubicación y su número.
- **La familia** recibe la alerta y llama a quien ayuda. Sus números nunca se muestran a desconocidos.
- **Personal verificado** (paramédicos, clínicas) inicia sesión una vez y ve identidad, póliza y contactos.
- **La aseguradora** ve los eventos en tiempo real en `/panel`.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Inicio |
| `/registro` | Registro del motorizado |
| `/qr/[codigo]` | Sticker y tarjeta para imprimir |
| `/r/[codigo]` | Lo que se ve al escanear (`/r/demo` es el perfil de prueba) |
| `/personal` | Inicio de sesión de personal verificado y aseguradora |
| `/panel` | Panel de la aseguradora (requiere cuenta de aseguradora) |

Cuentas de demo (clave `demo2026`): `clinica.demo`, `paramedico.demo`, `aseguradora.demo`.

## Desarrollo

```bash
npm install
npm run dev -- -p 3001
```

## Base de datos (Supabase)

1. En Supabase > SQL Editor, ejecutar `supabase/esquema.sql` una vez. Crea las tablas con RLS activado y sin políticas (la clave pública no puede leer nada) y carga el perfil demo y las cuentas demo.
2. Crear `web/.env.local`:

```
SUPABASE_URL=https://<id-del-proyecto>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SESION_SECRETO=<cadena aleatoria>
```

Sin `SUPABASE_URL`/`SUPABASE_SECRET_KEY` la app usa memoria (solo para desarrollo).

## Despliegue en Vercel

Variables de entorno (Production y Preview):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | URL de la API del proyecto (`https://<id>.supabase.co`, no la del panel) |
| `SUPABASE_SECRET_KEY` | Secret key del proyecto (Project Settings > API Keys) |
| `SESION_SECRETO` | Cadena aleatoria larga: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `URL_BASE` | Opcional. URL pública para los QR impresos |

## Limitaciones del prototipo

- Las alertas a la familia no se envían todavía por WhatsApp/SMS; se ven en el panel.
- El motorizado aún no puede editar su ficha después de registrarse.
