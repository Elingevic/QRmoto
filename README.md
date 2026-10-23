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

## Despliegue en Vercel

Variables de entorno necesarias:

| Variable | Valor |
|---|---|
| `SESION_SECRETO` | Cadena aleatoria larga. Sin ella, el inicio de sesión falla en producción. Generar con `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `URL_BASE` | Opcional. URL pública (ej. `https://qrmoto.vercel.app`) para los QR impresos |

## Limitaciones del prototipo

- Los datos viven en memoria: se pierden al reiniciar y, en Vercel, cada instancia tiene los suyos. El siguiente paso es Supabase.
- Las alertas a la familia no se envían todavía por WhatsApp/SMS; se ven en el panel.
- Las claves de demo están en texto plano en `src/lib/store.ts`.
