"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ClientRealtime(){
  const router=useRouter();
  useEffect(()=>{const source=new EventSource("/api/customer/events");source.addEventListener("refresh",()=>router.refresh());source.onerror=()=>{};return()=>source.close();},[router]);
  return null;
}
