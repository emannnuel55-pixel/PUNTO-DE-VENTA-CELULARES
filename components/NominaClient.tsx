"use client";

import { useState } from "react";
import { Printer, EyeOff, Eye, Save, Calendar, User, DollarSign, Calculator, Plus, Trash2 } from "lucide-react";

type NominaItem = {
  id: string;
  name: string;
  amount: number;
  visible: boolean;
};

export default function NominaClient() {
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [rfc, setRfc] = useState("");
  const [nss, setNss] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [workedDays, setWorkedDays] = useState("15");
  
  const [percepciones, setPercepciones] = useState<NominaItem[]>([
    { id: "p1", name: "Sueldo Base", amount: 0, visible: true },
    { id: "p2", name: "Premio de Puntualidad", amount: 0, visible: true },
    { id: "p3", name: "Bono de Productividad", amount: 0, visible: true },
  ]);

  const [deducciones, setDeducciones] = useState<NominaItem[]>([
    { id: "d1", name: "Retención IMSS", amount: 0, visible: true },
    { id: "d2", name: "Retención ISR", amount: 0, visible: true },
    { id: "d3", name: "Préstamo Infonavit", amount: 0, visible: true },
    { id: "d4", name: "Faltas / Retardos", amount: 0, visible: true },
  ]);

  const updateItem = (type: "p" | "d", id: string, field: "name" | "amount" | "visible", value: any) => {
    const list = type === "p" ? percepciones : deducciones;
    const setter = type === "p" ? setPercepciones : setDeducciones;
    
    setter(list.map(item => item.id === id ? { ...item, [field]: field === "amount" ? Number(value) : value } : item));
  };

  const toggleVisibility = (type: "p" | "d", id: string) => {
    const list = type === "p" ? percepciones : deducciones;
    const item = list.find(i => i.id === id);
    if (item) updateItem(type, id, "visible", !item.visible);
  };

  const addItem = (type: "p" | "d") => {
    const setter = type === "p" ? setPercepciones : setDeducciones;
    const prefix = type === "p" ? "p" : "d";
    setter(prev => [...prev, { id: `${prefix}${Date.now()}`, name: "Nuevo Concepto", amount: 0, visible: true }]);
  };

  const removeItem = (type: "p" | "d", id: string) => {
    const setter = type === "p" ? setPercepciones : setDeducciones;
    setter(prev => prev.filter(item => item.id !== id));
  };

  const totalPercepciones = percepciones.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDeducciones = deducciones.reduce((acc, curr) => acc + curr.amount, 0);
  const netoPagar = totalPercepciones - totalDeducciones;

  const printNomina = () => {
    const win = window.open("", "_blank");
    if (!win) return alert("Habilita las ventanas emergentes.");

    const visiblePercepciones = percepciones.filter(p => p.visible && p.amount > 0);
    const visibleDeducciones = deducciones.filter(d => d.visible && d.amount > 0);

    const formatMoney = (val: number) => `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    win.document.write(`
      <html>
        <head>
          <title>Recibo de Nómina - ${employeeName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .page {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              position: relative;
            }
            .header-table, .info-table, .details-table, .totals-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .header-table td {
              vertical-align: top;
            }
            .logo { width: 150px; }
            .title-box {
              background: #0054a6;
              color: white;
              text-align: center;
              padding: 8px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              border-radius: 4px;
            }
            .info-table td {
              padding: 4px;
              border: 1px solid #ddd;
            }
            .info-label {
              font-weight: bold;
              background: #f4f4f4;
              width: 120px;
            }
            .col-header {
              background: #eef5fc;
              color: #0054a6;
              font-weight: bold;
              text-align: center;
              padding: 6px;
              border: 1px solid #0054a6;
            }
            .details-table td {
              padding: 4px 8px;
              border-left: 1px solid #ddd;
              border-right: 1px solid #ddd;
            }
            .details-table {
              border-bottom: 1px solid #0054a6;
            }
            .amount { text-align: right; }
            .totals-table td {
              padding: 6px 8px;
              border: 1px solid #ddd;
            }
            .grand-total {
              font-size: 14px;
              font-weight: bold;
              background: #0054a6;
              color: white;
            }
            .signature-box {
              margin-top: 50px;
              text-align: center;
              width: 300px;
              margin-left: auto;
              margin-right: auto;
            }
            .signature-line {
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .print-btn {
              padding: 10px 20px;
              background: #10b981;
              color: white;
              border: none;
              cursor: pointer;
              font-weight: bold;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center;">
            <button class="print-btn" onclick="window.print()">🖨️ Imprimir Recibo</button>
          </div>
          <div class="page" contenteditable="true">
            <table class="header-table">
              <tr>
                <td style="width: 200px;">
                  <img src="https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png" class="logo" />
                </td>
                <td>
                  <div class="title-box">RECIBO DE NÓMINA</div>
                  <div style="text-align: center; margin-top: 10px; font-weight: bold;">
                    LINOEM DEVELOPMENT S.A. DE C.V.<br>
                    RFC: LIN240714E23
                  </div>
                </td>
              </tr>
            </table>

            <table class="info-table" style="margin-top: 15px;">
              <tr>
                <td class="info-label">Empleado</td>
                <td colspan="3"><strong>${employeeName || "__________________"}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Puesto</td>
                <td>${employeeRole || "__________________"}</td>
                <td class="info-label">Días Pagados</td>
                <td>${workedDays}</td>
              </tr>
              <tr>
                <td class="info-label">Periodo</td>
                <td colspan="3">Del ${periodStart || "___"} al ${periodEnd || "___"}</td>
              </tr>
              <tr>
                <td class="info-label">RFC</td>
                <td>${rfc || "XAXX010101000"}</td>
                <td class="info-label">NSS (IMSS)</td>
                <td>${nss || "__________________"}</td>
              </tr>
            </table>

            <table class="details-table" style="margin-top: 15px;">
              <thead>
                <tr>
                  <td class="col-header" colspan="2" style="width: 50%;">PERCEPCIONES (INGRESOS)</td>
                  <td class="col-header" colspan="2" style="width: 50%;">DEDUCCIONES (DESCUENTOS)</td>
                </tr>
                <tr>
                  <td style="background: #f4f4f4; font-weight: bold; border: 1px solid #ddd;">Concepto</td>
                  <td style="background: #f4f4f4; font-weight: bold; border: 1px solid #ddd; text-align: right;">Importe</td>
                  <td style="background: #f4f4f4; font-weight: bold; border: 1px solid #ddd;">Concepto</td>
                  <td style="background: #f4f4f4; font-weight: bold; border: 1px solid #ddd; text-align: right;">Importe</td>
                </tr>
              </thead>
              <tbody>
                ${Array.from({ length: Math.max(visiblePercepciones.length, visibleDeducciones.length) }).map((_, i) => {
                  const p = visiblePercepciones[i];
                  const d = visibleDeducciones[i];
                  return "<tr><td style='border-right: none;'>" + (p ? p.name : "") + "</td>" +
                         "<td class='amount'>" + (p ? formatMoney(p.amount) : "") + "</td>" +
                         "<td style='border-right: none;'>" + (d ? d.name : "") + "</td>" +
                         "<td class='amount'>" + (d ? formatMoney(d.amount) : "") + "</td></tr>";
                }).join("")}
              </tbody>
            </table>

            <table class="totals-table">
              <tr>
                <td style="width: 25%; text-align: right; font-weight: bold;">Suma Percepciones:</td>
                <td style="width: 25%;" class="amount">${formatMoney(visiblePercepciones.reduce((a, b) => a + b.amount, 0))}</td>
                <td style="width: 25%; text-align: right; font-weight: bold;">Suma Deducciones:</td>
                <td style="width: 25%;" class="amount">${formatMoney(visibleDeducciones.reduce((a, b) => a + b.amount, 0))}</td>
              </tr>
              <tr>
                <td colspan="2" style="border: none;"></td>
                <td class="grand-total" style="text-align: right;">NETO A PAGAR:</td>
                <td class="grand-total amount">${formatMoney(visiblePercepciones.reduce((a, b) => a + b.amount, 0) - visibleDeducciones.reduce((a, b) => a + b.amount, 0))}</td>
              </tr>
            </table>

            <div style="font-size: 10px; margin-top: 20px; text-align: justify; color: #555;">
              Recibí de la empresa LINOEM DEVELOPMENT S.A. DE C.V. la cantidad neta a que este recibo se refiere, estando conforme con las percepciones y deducciones que en él aparecen, por lo que no me reservo acción ni derecho alguno que ejercitar de ninguna naturaleza en contra de la empresa.
            </div>

            <div class="signature-box">
              <div class="signature-line">Firma de Conformidad del Empleado</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      {/* Columna Izquierda: Datos del Empleado */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
          <User size={20} /> Datos del Empleado y Periodo
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginTop: "15px" }}>
          <div className="field">
            <label>Nombre del Empleado</label>
            <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Ej. Juan Pérez" />
          </div>
          <div className="field">
            <label>Puesto</label>
            <input type="text" value={employeeRole} onChange={e => setEmployeeRole(e.target.value)} placeholder="Ej. Técnico en Reparación" />
          </div>
          <div className="field">
            <label>Días Pagados</label>
            <input type="number" value={workedDays} onChange={e => setWorkedDays(e.target.value)} placeholder="Ej. 15" />
          </div>
          <div className="field">
            <label>Inicio del Periodo</label>
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
          </div>
          <div className="field">
            <label>Fin del Periodo</label>
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
          </div>
          <div className="field">
            <label>RFC (Opcional)</label>
            <input type="text" value={rfc} onChange={e => setRfc(e.target.value)} placeholder="XAXX010101000" />
          </div>
        </div>
      </div>

      {/* Columna Central: Percepciones */}
      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", color: "#10b981" }}>
          <DollarSign size={20} /> Percepciones (Ingresos)
        </h3>
        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {percepciones.map(item => (
            <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center", opacity: item.visible ? 1 : 0.4 }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: "8px" }} 
                onClick={() => toggleVisibility("p", item.id)}
                title="Mostrar/Ocultar al imprimir"
              >
                {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <input 
                type="text" 
                value={item.name} 
                onChange={e => updateItem("p", item.id, "name", e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white" }}
              />
              <input 
                type="number" 
                value={item.amount} 
                onChange={e => updateItem("p", item.id, "amount", e.target.value)}
                style={{ width: "100px", padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white" }}
              />
              <button className="btn btn-secondary" style={{ padding: "8px", color: "#ef4444" }} onClick={() => removeItem("p", item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" style={{ marginTop: "10px", alignSelf: "flex-start" }} onClick={() => addItem("p")}>
            <Plus size={16} /> Agregar Percepción
          </button>
        </div>
      </div>

      {/* Columna Derecha: Deducciones */}
      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", color: "#ef4444" }}>
          <Calculator size={20} /> Deducciones (Descuentos)
        </h3>
        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {deducciones.map(item => (
            <div key={item.id} style={{ display: "flex", gap: "10px", alignItems: "center", opacity: item.visible ? 1 : 0.4 }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: "8px" }} 
                onClick={() => toggleVisibility("d", item.id)}
                title="Mostrar/Ocultar al imprimir"
              >
                {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <input 
                type="text" 
                value={item.name} 
                onChange={e => updateItem("d", item.id, "name", e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white" }}
              />
              <input 
                type="number" 
                value={item.amount} 
                onChange={e => updateItem("d", item.id, "amount", e.target.value)}
                style={{ width: "100px", padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white" }}
              />
              <button className="btn btn-secondary" style={{ padding: "8px", color: "#ef4444" }} onClick={() => removeItem("d", item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" style={{ marginTop: "10px", alignSelf: "flex-start" }} onClick={() => addItem("d")}>
            <Plus size={16} /> Agregar Deducción
          </button>
        </div>
      </div>

      {/* Footer: Totales y Acciones */}
      <div className="card" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
        <div style={{ display: "flex", gap: "40px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--color-secondary-text)" }}>Total Percepciones</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#10b981" }}>${totalPercepciones.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--color-secondary-text)" }}>Total Deducciones</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ef4444" }}>${totalDeducciones.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--color-secondary-text)" }}>Neto a Pagar</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>${netoPagar.toFixed(2)}</div>
          </div>
        </div>
        
        <button className="btn btn-primary" style={{ padding: "12px 24px", fontSize: "16px", display: "flex", gap: "10px" }} onClick={printNomina}>
          <Printer size={20} /> Imprimir Recibo
        </button>
      </div>
    </div>
  );
}
