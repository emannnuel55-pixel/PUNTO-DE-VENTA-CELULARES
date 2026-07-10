import { randomInt } from "node:crypto";
import { hashPassword, hmacAccessCode, normalizeAccessCode } from "@/lib/security";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAccessCode() {
  let raw = "";
  for (let i = 0; i < 12; i += 1) raw += alphabet[randomInt(0, alphabet.length)];
  return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
}

export function isAccessCodeShape(value: string) {
  return normalizeAccessCode(value).length === 12;
}

export async function createAccessCredential(code = generateAccessCode()) {
  const normalized = normalizeAccessCode(code);
  return {
    code,
    normalized,
    hash: await hashPassword(normalized),
    lookup: hmacAccessCode(normalized),
    last4: normalized.slice(-4)
  };
}
