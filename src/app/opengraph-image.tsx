import { ImageResponse } from "next/og";

// Vista previa al compartir el link (WhatsApp, Telegram, redes).
export const alt = "Pulso: si te caes de la moto, tu casco habla por ti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#b91c1c",
          color: "white",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#FAFAF7" />
            <path
              d="M4 17h6l2.5-6 3.5 12 3-15 2.5 9H28"
              fill="none"
              stroke="#b91c1c"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Pulso
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Si te caes de la moto,</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#fde68a" }}>
            tu casco habla por ti.
          </div>
          <div style={{ fontSize: 30, marginTop: 28, color: "#fecaca" }}>
            Datos médicos para quien te ayuda · alerta a tu familia · tu seguro se activa en la clínica
          </div>
        </div>
      </div>
    ),
    size,
  );
}
