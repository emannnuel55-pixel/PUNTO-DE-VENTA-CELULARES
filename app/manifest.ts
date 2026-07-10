import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Punto de Venta Celulares",
    short_name: "PVC LINOEM",
    description: "Ventas, inventario y reparaciones de celulares.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#07124a",
    icons: [{ src: "/icon.png", sizes: "256x256", type: "image/png" }]
  };
}
