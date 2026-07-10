import { randomInt } from "node:crypto";

export function createFolio(prefix: string) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${date}-${randomInt(100000, 999999)}`;
}
