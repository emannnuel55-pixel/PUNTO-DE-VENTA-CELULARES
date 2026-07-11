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
    
    // Carpeta de subidas
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

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
