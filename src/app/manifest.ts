import type { MetadataRoute } from "next";

// Permite instalar Pulso en el teléfono (útil para paramédicos y clínicas).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulso",
    short_name: "Pulso",
    description: "Identificación de emergencia para motorizados, conectada a su seguro.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#b91c1c",
    lang: "es-VE",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
