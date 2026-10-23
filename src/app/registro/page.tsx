import FormFicha from "@/components/FormFicha";

export const metadata = { title: "Crea tu QR · QRmoto" };

export default function Registro() {
  return <FormFicha modo={{ tipo: "crear" }} />;
}
