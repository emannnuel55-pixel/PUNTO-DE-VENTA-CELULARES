import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="panel-shell"><Sidebar user={user}/><main className="panel-main"><header className="panel-topbar"><h1>PUNTO DE VENTA CELULARES</h1><span className="badge success">Sistema operativo</span></header><div className="panel-content">{children}</div></main></div>;
}
