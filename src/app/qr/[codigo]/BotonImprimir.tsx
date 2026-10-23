"use client";

export default function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-red-700 py-3.5 text-lg font-extrabold text-white shadow"
    >
      🖨️ Imprimir sticker y tarjeta
    </button>
  );
}
