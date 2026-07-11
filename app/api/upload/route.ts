import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Definir nombre único y extensión
    const originalExt = path.extname(file.name) || ".png";
    const filename = `${crypto.randomUUID()}${originalExt}`;
    
    // Carpeta de subidas local (desarrollo)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Carpeta de subidas para el servidor Next.js Standalone en producción (Railway)
    const standaloneDir = path.join(process.cwd(), ".next", "standalone", "public", "uploads");
    try {
      await fs.mkdir(standaloneDir, { recursive: true });
      await fs.writeFile(path.join(standaloneDir, filename), buffer);
    } catch (e) {
      // Ignorar si no existe la carpeta standalone (como en entorno local de desarrollo)
    }

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "No fue posible subir la fotografía." }, { status: 500 });
  }
}
export const config = {
  api: {
    bodyParser: false,
  },
};
