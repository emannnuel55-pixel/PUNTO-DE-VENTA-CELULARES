"use client";

import { useState } from "react";

export function SkuGenerator({ defaultValue = "" }: { defaultValue?: string }) {
  const [sku, setSku] = useState(defaultValue);

  const generateSku = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSku(`LINO-${randomPart}`);
  };

  return (
    <div className="sku-generator-wrapper" style={{ display: "flex", gap: "8px", width: "100%" }}>
      <input
        name="sku"
        value={sku}
        onChange={(e) => setSku(e.target.value.toUpperCase())}
        required
        placeholder="Ej. LINO-A1B2C3"
        style={{ flex: 1 }}
      />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={generateSku}
        style={{ whiteSpace: "nowrap", padding: "10px 14px", height: "auto" }}
      >
        Generar SKU
      </button>
    </div>
  );
}
