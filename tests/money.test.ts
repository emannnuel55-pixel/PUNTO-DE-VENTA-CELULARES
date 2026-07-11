import { describe, expect, it } from "vitest";
import { calculateSale, roundMoney } from "@/lib/money";

describe("cálculos monetarios", () => {
  it("calcula subtotal e impuestos", () => {
    expect(calculateSale([{ quantity: 2, unitPrice: 99.90 }], 0.16)).toEqual({ subtotal: 199.8, tax: 31.97, total: 231.77 });
  });
  it("redondea centavos", () => expect(roundMoney(10.005)).toBe(10.01));
});
