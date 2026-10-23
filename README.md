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
| `/mi/[link-privado]` | Panel privado del motorizado: sticker, alertas de la familia, edición e historial |
| `/qr/demo` | Sticker del perfil demo (los reales solo desde el panel privado) |
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

1. En Supabase > SQL Editor, ejecutar `supabase/esquema.sql` y luego `supabase/002_alertas.sql`, una vez cada uno. Crea las tablas con RLS activado y sin políticas (la clave pública no puede leer nada) y carga el perfil demo y las cuentas demo.
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
| `TELEGRAM_BOT_TOKEN` | Token del bot (de @BotFather) |
| `TELEGRAM_BOT_USERNAME` | Usuario del bot, sin @ |
| `TELEGRAM_WEBHOOK_SECRET` | Cadena aleatoria; Telegram la envía en cada mensaje para autenticarse |
| `URL_BASE` | Opcional. URL pública para los QR impresos |

Después del primer deploy, registrar el webhook del bot:

```bash
npm run telegram:webhook -- https://q-rmoto.vercel.app
```

## Limitaciones del prototipo

- Las alertas salen por Telegram; WhatsApp (API oficial de Meta) es el siguiente canal.
- Si el motorizado pierde su link privado, no hay forma de recuperarlo todavía.
- El panel de la aseguradora muestra a todos los motorizados, no solo a sus asegurados.
