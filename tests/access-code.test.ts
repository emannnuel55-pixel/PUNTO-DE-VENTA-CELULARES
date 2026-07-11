import { describe, expect, it } from "vitest";
import { generateAccessCode, isAccessCodeShape } from "@/lib/access-code";

describe("código de acceso", () => {
  it("genera doce caracteres sin ambiguos", () => {
    const code = generateAccessCode();
    expect(isAccessCodeShape(code)).toBe(true);
    expect(code).not.toMatch(/[01IO]/);
  });
});
