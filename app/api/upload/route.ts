import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    // Convert file to Base64 to bypass Railway ephemeral storage issues
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Reduce quality/size if possible but for now just convert direct
    const mimeType = file.type || "image/png";
    const base64String = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ url: base64String });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "No fue posible subir la fotografía." }, { status: 500 });
  }
}
