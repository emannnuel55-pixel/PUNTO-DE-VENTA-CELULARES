import type { ReactNode } from "react";

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div><strong>{value}</strong></div>;
}
