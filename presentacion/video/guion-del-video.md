# Pulso · plan del video

**Qué es:** un QR en el casco del motorizado que entrega sus datos médicos a quien lo ayuda, avisa a su familia con su ubicación y activa su seguro en la clínica.
**Para quién:** motorizados en Venezuela, sus familias y las aseguradoras (jurado de AseguraTech26).
**Qué lo distingue:** privacidad pensada para la calle (un desconocido puede ayudar, pero no puede consultar) y la conexión directa con la aseguradora (clave de emergencia).
**Gancho visual:** el lema en dos golpes sobre negro, y la cadena casco → teléfono → familia → aseguradora.
**Tono:** `polished` con ritmo de lanzamiento: serio porque trata de accidentes, pero esperanzador.
**Leyenda para compartir:** "Si te caes de la moto, tu casco habla por ti."

## Identidad
- Colores de la app: rojo `#B91C1C`, oscuro `#1C1917`, claro `#FAFAF7`, ámbar `#FBBF24`, verde `#15803D`.
- Tipografía: Geist (la misma de la app), 800 para titulares.
- La UI se reconstruye con las mismas clases y textos de `VistaEscaneo.tsx`, `Sticker.tsx`, `Solicitudes.tsx` y la portada. Datos ficticios del perfil demo (José, O+, Penicilina).

## Storyboard (96 BPM, cortes en el pulso: 1 tiempo = 0,625 s) — 21,25 s

| # | Tiempo | Escena | Texto en pantalla | Sonido |
|---|---|---|---|---|
| 1 | 0,00–3,75 | **Gancho.** Fondo casi negro. Primera línea, luego la segunda en rojo, golpe. | "Si te caes de la moto," / "tu casco habla por ti." | Pad grave, golpe suave en 1,9 s |
| 2 | 3,75–6,25 | **Revelación.** El sticker real del casco entra girando; una línea de escaneo lo barre. | "Un QR en el casco." | Entra el bombo; barrido de escaneo |
| 3 | 6,25–10,00 | **Quien ayuda.** Teléfono con la ficha (José · O+ · Penicilina). Toque simulado en "Avisar a su familia" → "✓ Su familia fue avisada". | "Quien te ayuda ve lo que te salva." | Clic suave al tocar |
| 4 | 10,00–13,75 | **La familia.** Llega la notificación de Telegram con la ubicación y un pin de mapa. | "Tu familia lo sabe al instante." / "con tu ubicación exacta" | Campanita de notificación |
| 5 | 13,75–17,50 | **La aseguradora.** Tarjeta "Pendiente" del panel → clic en Aprobar → aparece la clave CE-7K2Q9M. | "Tu seguro se activa en la clínica." | Clic + acorde breve |
| 6 | 17,50–21,25 | **Cierre.** Fondo rojo, logo, lema, URL; la línea de privacidad debajo. | "Pulso" / "Si te caes de la moto, tu casco habla por ti." / "Un desconocido puede ayudar, pero no puede consultar." / "pulso-ve.vercel.app" | Golpe final y cola de pad |

Sin cifras inventadas. La clave CE-7K2Q9M y el pin son UI ilustrativa del producto en uso.
