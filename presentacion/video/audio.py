"""Música y efectos del video, sintetizados como una sola pieza.

96 BPM (1 tiempo = 0,625 s, 1 compás = 2,5 s), La menor con final en Do mayor.
Los cortes de escena caen en el pulso: 3,75 · 6,25 · 10 · 13,75 · 17,5.
"""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 21.25
N = int(SR * DUR)
BEAT = 0.625
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(SR * dur)) / SR


def nota(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, hz, orden=2):
    return sosfilt(butter(orden, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, orden=2):
    return sosfilt(butter(orden, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def poner(bus, señal, inicio, gan=1.0):
    i = int(inicio * SR)
    if i >= len(bus):
        return
    f = min(len(bus), i + len(señal))
    bus[i:f] += señal[: f - i] * gan


def env(n, a, d, s, r, dur):
    """ADSR en segundos para una nota de `dur` segundos (n muestras)."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where((t >= a + d) & (t < dur), s, e)
    e = np.where(t >= dur, s * np.clip(1 - (t - dur) / max(r, 1e-4), 0, 1), e)
    return e


def saw(f, t):
    return 2 * (t * f % 1) - 1


# ---------- Armonía ----------
# (inicio, acordes en MIDI)
Am, F, C, G = [57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]
Cadd9 = [48, 55, 60, 62, 64]
acordes = [(0, Am), (2.5, F), (5, C), (7.5, G), (10, Am), (12.5, F), (15, C), (17.5, Cadd9)]
raices = {0: 45, 2.5: 41, 5: 48, 7.5: 43, 10: 45, 12.5: 41, 15: 48, 17.5: 36}

pad = np.zeros(N)
for k, (ini, notas) in enumerate(acordes):
    fin = acordes[k + 1][0] if k + 1 < len(acordes) else DUR
    dur = fin - ini
    t = t_(dur + 1.2)
    voz = sum(saw(nota(m) * d, t) for m in notas for d in (0.996, 1.004))
    voz = lp(voz, 1400 if ini < 17.5 else 2200)
    poner(pad, voz * env(len(t), 0.35, 0.4, 0.8, 1.0, dur), ini, 0.05)
pad *= np.clip(np.arange(N) / (SR * 1.2), 0, 1)  # entrada suave

# Bajo: desde la revelación, en los tiempos 1 y 3.
bajo = np.zeros(N)
for ini, raiz in raices.items():
    if ini < 2.5:
        continue
    for b in (0, 2):
        tb = ini + b * BEAT
        if tb < 3.75 or tb >= DUR:
            continue
        t = t_(1.2)
        s = np.sin(2 * np.pi * nota(raiz) * t) + 0.25 * np.sin(4 * np.pi * nota(raiz) * t)
        poner(bajo, s * env(len(t), 0.01, 0.3, 0.6, 0.3, 0.9), tb, 0.28)

# Bombo en negras de 3,75 a 17,5; golpe final en 17,5.
bombo = np.zeros(N)


def golpe(f0=120, f1=42, dec=0.28):
    t = t_(0.6)
    fase = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t / 0.04)) / SR
    return np.sin(fase) * np.exp(-t / dec)


for i in range(int((17.5 - 3.75) / BEAT)):
    poner(bombo, golpe(), 3.75 + i * BEAT, 0.42)
poner(bombo, golpe(110, 36, 0.6), 17.5, 0.7)

# Hi-hat suave en contratiempos de 6,25 a 17,5.
hats = np.zeros(N)
for i in range(int((17.5 - 6.25) / BEAT)):
    t = t_(0.06)
    h = hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / 0.012)
    poner(hats, h, 6.25 + i * BEAT + BEAT / 2, 0.05)

# Arpegio en corcheas desde 6,25: notas del acorde una octava arriba.
arpegio = np.zeros(N)
for ini, notas in acordes[2:7]:
    for j in range(8):
        tb = ini + j * BEAT / 2
        if tb < 6.25 or tb >= 17.5:
            continue
        m = notas[[0, 1, 2, 3, 2, 1, 2, 3][j]] + 12
        t = t_(0.5)
        tri = 2 * np.abs(2 * (t * nota(m) % 1) - 1) - 1
        poner(arpegio, lp(tri, 3000) * np.exp(-t / 0.16), tb, 0.06)

# ---------- Efectos (en la tonalidad) ----------
sfx = np.zeros(N)

# Gancho: subida de aire hacia el golpe de la segunda línea.
t = t_(0.65)
subida = bp(rng.standard_normal(len(t)), 300, 2500) * (t / t[-1]) ** 2
poner(sfx, subida, 0.9, 0.05)
t = t_(1.6)
poner(sfx, np.sin(2 * np.pi * nota(33) * t) * np.exp(-t / 0.5), 1.55, 0.35)  # La grave

# Barrido del escaneo.
t = t_(0.9)
barrido = rng.standard_normal(len(t))
bloques = np.array_split(barrido, 30)
barrido = np.concatenate([bp(b, 700 + 2600 * i / 30, 900 + 3200 * i / 30) for i, b in enumerate(bloques)])
poner(sfx, barrido * np.sin(np.pi * t / t[-1]), 4.55, 0.06)

# Toque en "Avisar a su familia".
t = t_(0.05)
poner(sfx, np.sin(2 * np.pi * 1320 * t) * np.exp(-t / 0.008), 8.1, 0.10)

# Notificación de Telegram: Mi6 → La6.
for k, (m, ini) in enumerate([(88, 10.6), (93, 10.72)]):
    t = t_(0.8)
    s = np.sin(2 * np.pi * nota(m) * t) + 0.3 * np.sin(4 * np.pi * nota(m) * t)
    poner(sfx, s * np.exp(-t / 0.22), ini, 0.07)

# Pin del mapa: pequeño "pop" descendente.
t = t_(0.12)
f = 700 - 400 * t / t[-1]
poner(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03), 11.85, 0.10)

# Clic en "Aprobar" y acorde de confirmación Do-Mi-Sol.
t = t_(0.05)
poner(sfx, np.sin(2 * np.pi * 1100 * t) * np.exp(-t / 0.008), 15.5, 0.10)
for m, ini in [(84, 15.8), (88, 15.88), (91, 15.96)]:
    t = t_(1.0)
    poner(sfx, np.sin(2 * np.pi * nota(m) * t) * np.exp(-t / 0.35), ini, 0.055)

# Subida hacia el cierre.
t = t_(0.6)
poner(sfx, bp(rng.standard_normal(len(t)), 400, 5000) * (t / t[-1]) ** 3, 16.9, 0.06)

# ---------- Mezcla ----------
ir_t = np.arange(int(SR * 1.8)) / SR
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45)
ir = lp(ir, 5000) / np.sqrt(np.sum(ir**2))


def reverb(x, mezcla):
    return x + mezcla * fftconvolve(x, ir)[: len(x)]


musica = pad + bajo + bombo + hats
espacio = reverb(arpegio, 0.5) + reverb(sfx, 0.35)
seco = musica + reverb(pad, 0.25) * 0.4

# Estéreo: el arpegio y los efectos con un pequeño retardo entre canales.
retardo = int(SR * 0.012)
izq = seco + espacio
der = seco + np.concatenate([np.zeros(retardo), espacio[:-retardo]])
mix = np.stack([izq, der], axis=1)

mix = np.tanh(mix * 1.2) / np.tanh(1.2)  # compresión suave
fade = np.ones(N)
fade[-int(SR * 0.9):] = np.linspace(1, 0, int(SR * 0.9)) ** 1.5
mix *= fade[:, None]
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))  # pico a -1 dBFS

wavfile.write("audio.wav", SR, (mix * 32767).astype(np.int16))
print(f"audio.wav: {DUR} s, pico -1 dBFS")
