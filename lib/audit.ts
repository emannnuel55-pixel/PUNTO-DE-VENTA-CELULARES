import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function recordAudit(input: {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  result?: string;
  metadata?: Record<string, unknown>;
}) {
  const headerStore = await headers();
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      result: input.result || "SUCCESS",
      metadata: input.metadata,
      ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim()
    }
  });
}
