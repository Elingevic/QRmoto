import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.URL_BASE ?? "https://pulso-ve.vercel.app"),
  title: "Pulso · Si te caes de la moto, tu casco habla por ti",
  description:
    "Un QR en el casco que entrega tus datos médicos a quien te ayuda, avisa a tu familia con tu ubicación y activa tu seguro en la clínica.",
  openGraph: { locale: "es_VE", siteName: "Pulso", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
