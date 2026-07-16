import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import NominaClient from "@/components/NominaClient";

export const metadata = {
  title: "Nómina y Recursos Humanos | Linoem",
};

export default async function NominaPage() {
  const user = await requireUser();

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "FINANCE")) {
    redirect("/panel");
  }

  return (
    <div className="app-container">
      <main className="main-content" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <header className="page-header" style={{ marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "24px", color: "var(--color-primary-text)", margin: "0 0 5px 0" }}>Nómina y Recursos Humanos</h1>
            <p style={{ margin: 0, color: "var(--color-secondary-text)" }}>Gestión de recibos de nómina (Percepciones y Deducciones)</p>
          </div>
        </header>

        <NominaClient />
      </main>
    </div>
  );
}
