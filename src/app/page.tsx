import Link from "next/link";
import Logo from "@/components/Logo";

const pasos = [
  {
    n: "1",
    titulo: "Escanean tu casco",
    texto: "Cualquier persona, con la cámara de su teléfono. No necesita instalar nada.",
  },
  {
    n: "2",
    titulo: "Ven lo que te salva",
    texto: "Tipo de sangre, alergias, condiciones y qué hacer. Nada que permita robarte o estafar a tu familia.",
  },
  {
    n: "3",
    titulo: "Tu familia recibe la alerta",
    texto: "Al instante, con tu ubicación exacta y el número de quien te está ayudando.",
  },
  {
    n: "4",
    titulo: "Tu seguro se activa",
    texto: "La clínica pide la clave de emergencia y la aseguradora la aprueba en segundos, no en horas.",
  },
];

const actores = [
  {
    icono: "🙋",
    titulo: "Quien ayuda",
    texto: "Ve solo lo médico. Con un toque avisa a la familia y al seguro, sin ver nunca sus números.",
  },
  {
    icono: "👨‍👩‍👧",
    titulo: "La familia",
    texto: "Recibe la alerta con la ubicación y llama a quien ayuda. Y sabe cada vez que alguien abre la ficha.",
  },
  {
    icono: "🩺",
    titulo: "Personal verificado",
    texto: "Paramédicos y clínicas aliadas ven identidad, póliza y contactos, y solicitan la clave de emergencia.",
  },
  {
    icono: "🛡️",
    titulo: "La aseguradora",
    texto: "Recibe el aviso del siniestro con ubicación y hora, y aprueba la cobertura desde su panel.",
  },
];

const aseguradoras = [
  {
    titulo: "Clave de emergencia en segundos",
    texto: "La clínica la solicita desde la ficha del asegurado; tu equipo la aprueba con un clic y el tiempo de respuesta queda medido.",
  },
  {
    titulo: "Aviso de siniestro inmediato",
    texto: "Sabes del accidente cuando ocurre, con ubicación, hora y quién está atendiendo. Sin esperar a que la familia llame.",
  },
  {
    titulo: "Un canal para llegar a quien no tiene seguro",
    texto: "El sticker se entrega en talleres, ventas de cascos y apps de delivery: la puerta de entrada a un microseguro de accidentes.",
  },
  {
    titulo: "Protección contra el fraude",
    texto: "Pólizas declaradas y verificadas se distinguen siempre, y cada acceso a los datos queda registrado.",
  },
];

const privacidad = [
  "Un desconocido puede ayudar, pero no puede consultar: identidad, póliza y teléfonos nunca son públicos.",
  "Cada vez que personal verificado abre la ficha completa, la familia recibe un aviso.",
  "Cada QR lleva un código aleatorio imposible de adivinar: nadie puede recorrer fichas ajenas.",
  "Los mensajes advierten siempre que Pulso y la aseguradora nunca piden dinero: frena la estafa del falso accidente.",
];

export default function Inicio() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-stone-50 text-stone-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <Logo className="h-8 w-8" />
          Pulso
        </Link>
        <div className="flex items-center gap-1 text-sm font-semibold sm:gap-4">
          <a href="#como-funciona" className="hidden px-2 py-1 text-stone-600 sm:block">
            Cómo funciona
          </a>
          <a href="#aseguradoras" className="hidden px-2 py-1 text-stone-600 sm:block">
            Aseguradoras
          </a>
          <Link href="/personal" className="px-2 py-1 text-stone-600">
            Acceso profesional
          </Link>
        </div>
      </nav>

      {/* Portada */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-12">
        <div>
          <p className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
            Seguro inteligente para motorizados en Venezuela
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Si te caes de la moto, <span className="text-red-700">tu casco habla por ti.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600">
            Un QR en el casco que entrega tus datos médicos a quien te ayuda, avisa a tu familia con
            tu ubicación y activa tu seguro en la clínica. Sin exponer tu información a cualquiera.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/registro"
              className="rounded-xl bg-red-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800"
            >
              Crear mi QR gratis
            </Link>
            <Link
              href="/r/demo"
              className="rounded-xl bg-white px-6 py-3.5 font-bold shadow-sm ring-1 ring-stone-200 transition hover:ring-stone-300"
            >
              Ver un casco escaneado
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-500">Toma 3 minutos. No se instala nada.</p>
        </div>

        <Telefono />
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Del accidente a la clínica</h2>
          <p className="mt-2 text-stone-600">Lo que pasa cuando alguien escanea tu casco.</p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <li key={p.n} className="relative">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-700 font-extrabold text-white">
                  {p.n}
                </span>
                <h3 className="mt-4 font-bold">{p.titulo}</h3>
                <p className="mt-1 text-sm text-stone-600">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Quién ve qué */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Cada quien ve solo lo que necesita</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Si estás inconsciente nadie te va a pedir una clave. Por eso lo que salva la vida es público
          y lo que permite hacer daño nunca lo es.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actores.map((a) => (
            <div key={a.titulo} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <p className="text-3xl">{a.icono}</p>
              <h3 className="mt-3 font-bold">{a.titulo}</h3>
              <p className="mt-1 text-sm text-stone-600">{a.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aseguradoras */}
      <section id="aseguradoras" className="bg-stone-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-bold tracking-widest text-red-400">PARA ASEGURADORAS</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Del siniestro a la cobertura, sin llamadas ni esperas
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {aseguradoras.map((a) => (
              <div key={a.titulo} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <h3 className="font-bold">{a.titulo}</h3>
                <p className="mt-1 text-sm text-stone-300">{a.texto}</p>
              </div>
            ))}
          </div>
          <Link
            href="/personal?volver=/panel"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3.5 font-bold text-stone-900"
          >
            Ver el panel de la aseguradora
          </Link>
        </div>
      </section>

      {/* Privacidad */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Privacidad desde el diseño</h2>
            <p className="mt-2 text-stone-600">
              Pensado para cómo pasan las cosas en la calle, no en un laboratorio.
            </p>
          </div>
          <ul className="grid gap-3">
            {privacidad.map((p) => (
              <li key={p} className="flex gap-3 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-stone-200">
                <span className="font-bold text-green-700">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-red-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Pega tu QR hoy. Ojalá nunca lo necesites.</h2>
          <p className="mx-auto mt-3 max-w-xl text-red-100">
            Regístrate, imprime tu sticker y activa las alertas de tu familia en Telegram.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3.5 font-bold text-red-800"
          >
            Crear mi QR gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-stone-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-stone-500 sm:px-6">
          <span className="flex items-center gap-2">
            <Logo className="h-5 w-5" /> Pulso · Prototipo para AseguraTech26
          </span>
          <span>Desafío 4 · Supervisión y protección del asegurado</span>
        </div>
      </footer>
    </main>
  );
}

// Ilustración de la portada: la ficha que ve quien ayuda y la alerta que recibe
// la familia, como se ven en un teléfono real.
function Telefono() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem]" aria-hidden>
      <div className="rounded-[2.6rem] bg-stone-900 p-2.5 shadow-2xl shadow-stone-900/30">
        <div className="overflow-hidden rounded-[2.1rem] bg-stone-100">
          <div className="bg-red-700 px-4 pb-3 pt-7 text-white">
            <p className="text-[9px] font-bold tracking-widest opacity-90">EMERGENCIA MÉDICA · Pulso</p>
            <p className="text-2xl font-extrabold">José</p>
            <p className="text-[11px] opacity-90">29 años · Motorizado</p>
          </div>
          <div className="bg-amber-400 py-1 text-center text-[10px] font-extrabold">
            ⚠️ NO LE QUITES EL CASCO
          </div>
          <div className="grid gap-2 p-3">
            <div className="rounded-xl bg-red-700 py-2.5 text-center text-sm font-extrabold text-white">
              📞 Llamar al 911
            </div>
            <div className="rounded-xl bg-stone-900 py-2.5 text-center text-sm font-bold text-white">
              🔔 Avisar a su familia
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white p-2 text-center">
                <p className="text-[8px] font-semibold text-stone-500">SANGRE</p>
                <p className="text-2xl font-extrabold text-red-700">O+</p>
              </div>
              <div className="rounded-xl bg-white p-2 text-center">
                <p className="text-[8px] font-semibold text-stone-500">SEGURO</p>
                <p className="mt-1 text-sm font-extrabold text-green-700">✓ Activo</p>
              </div>
            </div>
            <div className="rounded-xl bg-red-50 p-2.5">
              <p className="text-[10px] font-bold text-red-800">⚠️ Alergias</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-900">
                  Penicilina
                </span>
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-900">
                  AINEs
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-white p-2.5">
              <p className="text-[10px] font-bold text-stone-700">Condiciones</p>
              <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold">
                Diabetes tipo 1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de Telegram que recibe la familia */}
      <div className="aparecer absolute -left-6 top-36 w-64 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-stone-200 backdrop-blur sm:-left-16">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-500 text-[11px] font-bold text-white">
            ✈
          </span>
          <p className="text-[11px] font-bold">Pulso Alertas</p>
          <p className="ml-auto text-[10px] text-stone-400">ahora</p>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug">
          🚨 Alguien escaneó el casco de <b>José</b> y pidió ayuda.
          <br />📍 Ubicación: Av. Urdaneta, Caracas
          <br />📞 Llama a quien lo ayuda: 0412-…
        </p>
      </div>

      {/* Clave de emergencia aprobada */}
      <div className="aparecer-tarde absolute -right-4 bottom-10 w-52 rounded-2xl bg-stone-900 p-3 text-white shadow-xl sm:-right-12">
        <p className="text-[9px] font-bold tracking-wider text-green-400">CLAVE DE EMERGENCIA</p>
        <p className="font-mono text-lg font-extrabold tracking-wider">CE-7K2Q9M</p>
        <p className="text-[10px] text-stone-300">Aprobada · Clínica Demo</p>
      </div>
    </div>
  );
}
