import { describe, expect, it } from "vitest";
import { RepairStatus } from "@/generated/prisma/enums";
import { canTransition } from "@/lib/repair-state";

describe("máquina de estados", () => {
  it("permite una transición válida", () => expect(canTransition(RepairStatus.RECEIVED, RepairStatus.PENDING_DIAGNOSIS)).toBe(true));
  it("bloquea un salto inválido", () => expect(canTransition(RepairStatus.RECEIVED, RepairStatus.DELIVERED)).toBe(false));
});
