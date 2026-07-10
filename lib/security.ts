import { createHash, createHmac, randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { requiredEnv } from "@/lib/env";

export async function hashPassword(value: string) {
  return hash(value, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32
  });
}

export async function verifyPassword(hashValue: string, plainValue: string) {
  try { return await verify(hashValue, plainValue); } catch { return false; }
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacAccessCode(normalizedCode: string) {
  return createHmac("sha256", requiredEnv("ACCESS_CODE_SECRET"))
    .update(normalizedCode)
    .digest("hex");
}

export function normalizeAccessCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
