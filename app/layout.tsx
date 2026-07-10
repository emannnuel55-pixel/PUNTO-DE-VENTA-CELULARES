import type { Metadata } from "next";
import "./globals.css";
import { appName, companyName } from "@/lib/env";

export const metadata: Metadata = {
  title: { default: `${appName} | ${companyName}`, template: `%s | ${appName}` },
  description: "Punto de venta, inventario y administración de reparaciones de celulares.",
  icons: { icon: "/icon.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
