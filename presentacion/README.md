# Presentación de Pulso · AseguraTech26

| Archivo | Qué es |
|---|---|
| `pulso-video.mp4` | Video de lanzamiento (21 s, 1080p, con música) |
| `pulso-portada.jpg` | Miniatura del video |
| `pulso-avatar-bot.png` | Foto de perfil del bot de Telegram (`/setuserpic` en @BotFather) |
| `texto-para-compartir.txt` | Texto para publicar el video |
| `lamina/` | Fuente de la lámina del pitch. La versión editable y con el guion en las notas está en Claude: https://claude.ai/artifact/SnsiNsTTgyBonR3YiHvh5e |
| `video/` | Fuente del video: `video.html` (escenas), `audio.py` (música y efectos), `capturar.mjs` (captura cuadro a cuadro) y `guion-del-video.md` |

## Regenerar el video

Requiere Node, Python con `numpy` y `scipy`, ffmpeg y Microsoft Edge (la ruta de Edge está en `capturar.mjs`).

```bash
cd presentacion/video
npm install
python audio.py          # crea audio.wav
node capturar.mjs        # crea frames/ (638 cuadros)
ffmpeg -y -framerate 30 -i frames/f%04d.jpg -i audio.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "volume=-2.2dB" -c:a aac -b:a 192k -shortest ../pulso-video.mp4
```

Para revisar escenas sueltas sin capturar todo: `node capturar.mjs 1.2 8.6 20.5` deja esas fotos en `stills/`.
