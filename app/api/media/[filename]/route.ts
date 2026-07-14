import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Paths where uploads might be written on the container disk
  const pathsToTry = [
    path.join(process.cwd(), "public", "uploads", filename),
    path.join(process.cwd(), ".next", "standalone", "public", "uploads", filename),
    path.join("/tmp", "uploads", filename)
  ];

  for (const p of pathsToTry) {
    try {
      console.log(`[Media Proxy] intentando leer: ${p}`);
      const fileBuffer = await fs.readFile(p);

      // Determine content type based on extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = "image/png";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".svg") contentType = "image/svg+xml";

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    } catch (e) {
      // Continue to next path
    }
  }

  return new Response("Archivo no encontrado", { status: 404 });
}
export const dynamic = "force-dynamic";
