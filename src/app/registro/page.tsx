import FormFicha from "@/components/FormFicha";

export const metadata = { title: "Crea tu QR · Pulso" };

export default function Registro() {
  return <FormFicha modo={{ tipo: "crear" }} />;
}
