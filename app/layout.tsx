import type { Metadata } from "next";
import "./globals.css";
import { appName, companyName } from "@/lib/env";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: { default: `${appName} | ${companyName}`, template: `%s | ${appName}` },
  description: "Punto de venta, inventario y administración de reparaciones de celulares.",
  icons: { icon: "/icon.png" }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("pvc_theme")?.value || "light";
  const themeClass = theme === "light" ? "light-theme" : "";
  
  return (
    <html lang="es" className={themeClass}>
      <body className={themeClass}>
        {children}
      </body>
    </html>
  );
}
