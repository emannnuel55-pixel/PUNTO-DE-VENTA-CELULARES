"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";

export async function saveSettings(formData:FormData){
  const user=await requireUser([Role.OWNER,Role.ADMIN]);
  const keys=["business_name","company_name","phone","whatsapp","address","hours"];
  for(const key of keys){const value=String(formData.get(key)||"").trim().slice(0,500);await db.systemSetting.upsert({where:{key},update:{value},create:{key,value}});}
  await recordAudit({actorUserId:user.id,action:"SETTINGS_UPDATE",entityType:"SystemSetting"});
  revalidatePath("/panel/configuracion");
}
