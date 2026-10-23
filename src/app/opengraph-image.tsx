import { ImageResponse } from "next/og";

// Vista previa al compartir el link (WhatsApp, Telegram, redes).
export const alt = "QRmoto: si te caes de la moto, tu casco habla por ti";
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
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            +
          </div>
          QRmoto
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
