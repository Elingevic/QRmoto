// Captura video.html cuadro a cuadro. Uso:
//   node capturar.mjs            -> todos los cuadros en frames/
//   node capturar.mjs 1.2 5 8.3  -> solo esos instantes en stills/
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const FPS = 30;
const DURACION = 21.25;
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const instantes = process.argv.slice(2).map(Number);
const carpeta = instantes.length ? "stills" : "frames";
mkdirSync(carpeta, { recursive: true });

const navegador = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});
const pagina = await navegador.newPage();
await pagina.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await pagina.goto(new URL("video.html", import.meta.url).href, {
  waitUntil: "networkidle0",
});
await pagina.evaluate(() => document.fonts.ready);

const lista = instantes.length
  ? instantes
  : Array.from({ length: Math.round(DURACION * FPS) }, (_, i) => i / FPS);

for (const [i, t] of lista.entries()) {
  await pagina.evaluate((x) => window.render(x), t);
  const nombre = instantes.length ? `t${t.toFixed(2)}` : `f${String(i).padStart(4, "0")}`;
  await pagina.screenshot({ path: `${carpeta}/${nombre}.jpg`, type: "jpeg", quality: 92 });
  if (!instantes.length && i % 60 === 0) console.log(`cuadro ${i}/${lista.length}`);
}
await navegador.close();
console.log(`listo: ${lista.length} cuadros en ${carpeta}/`);
