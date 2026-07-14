import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const debugInfo: any = {
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
    paths: {},
  };

  const checkDir = async (label: string, dirPath: string) => {
    try {
      const exists = await fs.access(dirPath).then(() => true).catch(() => false);
      if (!exists) {
        debugInfo.paths[label] = { error: "Directory does not exist", path: dirPath };
        return;
      }
      const files = await fs.readdir(dirPath);
      debugInfo.paths[label] = { files, path: dirPath };
    } catch (e: any) {
      debugInfo.paths[label] = { error: e.message, path: dirPath };
    }
  };

  await checkDir("cwd_public_uploads", path.join(process.cwd(), "public", "uploads"));
  await checkDir("cwd_standalone_public_uploads", path.join(process.cwd(), ".next", "standalone", "public", "uploads"));
  await checkDir("app_public_uploads", path.join("/app", "public", "uploads"));
  await checkDir("tmp_uploads", path.join("/tmp", "uploads"));
  
  // Try to find the parent directory files
  try {
    const parentDir = path.join(process.cwd(), "..");
    const files = await fs.readdir(parentDir);
    debugInfo.parentDir = { files, path: parentDir };
  } catch (e: any) {
    debugInfo.parentDir = { error: e.message };
  }

  return NextResponse.json(debugInfo);
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
