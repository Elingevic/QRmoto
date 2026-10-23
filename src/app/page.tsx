import Link from "next/link";

const niveles = [
  {
    titulo: "Quien ayuda",
    texto:
      "Ve solo lo que salva la vida: sangre, alergias, condiciones. Con un toque avisa a la familia y al seguro con su ubicación y su número.",
  },
  {
    titulo: "La familia",
    texto:
      "Recibe la ubicación y llama a quien está ayudando. Sus números nunca se muestran a desconocidos.",
  },
  {
    titulo: "Personal verificado",
    texto:
      "Paramédicos y clínicas aliadas inician sesión una vez y ven identidad, póliza y contactos.",
  },
];

export default function Inicio() {
  return (
    <main className="min-h-dvh bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-bold tracking-widest text-red-700">QRmoto</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">
          Si te caes de la moto, tu casco habla por ti.
        </h1>
        <p className="mt-4 text-lg text-stone-700">
          Un QR en el casco que entrega tus datos médicos a quien te ayuda, avisa a tu familia y
          activa tu seguro, sin exponer tu información a cualquiera.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/registro"
            className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white shadow"
          >
            Crear mi QR
          </Link>
          <Link
            href="/r/demo"
            className="rounded-xl bg-white px-5 py-3 font-bold text-stone-900 shadow"
          >
            Simular escaneo del casco
          </Link>
          <Link
            href="/panel"
            className="rounded-xl bg-stone-900 px-5 py-3 font-bold text-white shadow"
          >
            Panel de la aseguradora
          </Link>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {niveles.map((n) => (
            <div key={n.titulo} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-bold">{n.titulo}</p>
              <p className="mt-2 text-sm text-stone-600">{n.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
