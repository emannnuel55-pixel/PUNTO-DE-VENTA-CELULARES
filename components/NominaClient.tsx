"use client";

import { useState } from "react";
import { Printer, Save, FileText, User, DollarSign, Calculator, Clock, CalendarCheck } from "lucide-react";

export default function NominaClient() {
  const [employeeName, setEmployeeName] = useState("Administrador General HTJ — #1000 (SUPER_ADMIN)");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [workedDays, setWorkedDays] = useState("15");
  const [holidays, setHolidays] = useState("0");
  
  // Percepciones
  const [salarioBase, setSalarioBase] = useState(8000);
  const [horasExtrasCant, setHorasExtrasCant] = useState(0);
  const [pagoHrsExtras, setPagoHrsExtras] = useState(0);
  const [bonoAsistencia, setBonoAsistencia] = useState(0);
  const [bonoPuntualidad, setBonoPuntualidad] = useState(0);
  const [otrosIngresos, setOtrosIngresos] = useState(0);
  
  // Deducciones
  const [imssTrabajador, setImssTrabajador] = useState(0);
  const [imssPatron, setImssPatron] = useState(0);
  const [isrRetenido, setIsrRetenido] = useState(0);
  const [infonavit, setInfonavit] = useState(0);
  const [fonacot, setFonacot] = useState(0);
  const [otrasDeducciones, setOtrasDeducciones] = useState(0);

  // Otros
  const [notas, setNotas] = useState("");
  const [estadoPago, setEstadoPago] = useState("Borrador (DRAFT)");
  const [checadas, setChecadas] = useState<any[]>([]);

  const totalPercepciones = salarioBase + pagoHrsExtras + bonoAsistencia + bonoPuntualidad + otrosIngresos;
  const totalDeducciones = imssTrabajador + imssPatron + isrRetenido + infonavit + fonacot + otrasDeducciones;
  const netoPagar = totalPercepciones - totalDeducciones;

  const formatMoney = (val: number) => `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const printNomina = () => {
    const win = window.open("", "_blank");
    if (!win) return alert("Habilita las ventanas emergentes.");

    win.document.write(`
      <html>
        <head>
          <title>Recibo de Nómina - ${employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
            .page { width: 100%; max-width: 800px; margin: 0 auto; position: relative; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .logo { width: 150px; }
            .title-box { background: #d00000; color: white; text-align: center; padding: 8px; font-weight: bold; border-radius: 4px; }
            .info-label { font-weight: bold; background: #f4f4f4; width: 120px; padding: 4px; border: 1px solid #ddd; }
            td { padding: 4px; border: 1px solid #ddd; }
            .col-header { background: #f2f7fc; color: #d00000; font-weight: bold; text-align: center; padding: 6px; border: 1px solid #d00000; }
            .amount { text-align: right; }
            .grand-total { font-size: 14px; font-weight: bold; background: #d00000; color: white; }
            .signature-box { margin-top: 50px; text-align: center; width: 300px; margin-left: auto; margin-right: auto; }
            .signature-line { border-top: 1px solid #000; padding-top: 5px; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button style="padding: 10px 20px; background: #10b981; color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 5px;" onclick="window.print()">🖨️ Imprimir Recibo</button>
          </div>
          <div class="page" contenteditable="true">
            <table>
              <tr>
                <td style="width: 200px; border: none;">
                  <img src="https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png" class="logo" />
                </td>
                <td style="border: none;">
                  <div class="title-box">RECIBO DE NÓMINA</div>
                  <div style="text-align: center; margin-top: 10px; font-weight: bold;">
                    LINOEM DEVELOPMENT S.A. DE C.V.<br>RFC: LIN240714E23
                  </div>
                </td>
              </tr>
            </table>

            <table style="margin-top: 15px;">
              <tr><td class="info-label">Colaborador</td><td colspan="3"><strong>${employeeName}</strong></td></tr>
              <tr>
                <td class="info-label">Periodo</td><td>Del ${periodStart} al ${periodEnd}</td>
                <td class="info-label">Días Trabajados</td><td>${workedDays} (Festivos: ${holidays})</td>
              </tr>
            </table>

            <table style="margin-top: 15px;">
              <thead>
                <tr>
                  <td class="col-header" colspan="2" style="width: 50%;">PERCEPCIONES</td>
                  <td class="col-header" colspan="2" style="width: 50%;">DEDUCCIONES</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salario Base</td><td class="amount">${formatMoney(salarioBase)}</td>
                  <td>IMSS Trabajador</td><td class="amount">${formatMoney(imssTrabajador)}</td>
                </tr>
                <tr>
                  <td>Pago Horas Extras (${horasExtrasCant}h)</td><td class="amount">${formatMoney(pagoHrsExtras)}</td>
                  <td>IMSS Patrón</td><td class="amount">${formatMoney(imssPatron)}</td>
                </tr>
                <tr>
                  <td>Bono Asistencia</td><td class="amount">${formatMoney(bonoAsistencia)}</td>
                  <td>ISR Retenido</td><td class="amount">${formatMoney(isrRetenido)}</td>
                </tr>
                <tr>
                  <td>Bono Puntualidad</td><td class="amount">${formatMoney(bonoPuntualidad)}</td>
                  <td>INFONAVIT</td><td class="amount">${formatMoney(infonavit)}</td>
                </tr>
                <tr>
                  <td>Otros Ingresos</td><td class="amount">${formatMoney(otrosIngresos)}</td>
                  <td>FONACOT / Otras</td><td class="amount">${formatMoney(fonacot + otrasDeducciones)}</td>
                </tr>
              </tbody>
            </table>

            <table>
              <tr>
                <td style="width: 25%; text-align: right; font-weight: bold;">Suma Percepciones:</td>
                <td style="width: 25%;" class="amount">${formatMoney(totalPercepciones)}</td>
                <td style="width: 25%; text-align: right; font-weight: bold;">Suma Deducciones:</td>
                <td style="width: 25%;" class="amount">${formatMoney(totalDeducciones)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border: none;"></td>
                <td class="grand-total" style="text-align: right;">NETO A PAGAR:</td>
                <td class="grand-total amount">${formatMoney(netoPagar)}</td>
              </tr>
            </table>
            
            <div style="font-size: 11px; margin-top: 10px; font-style: italic;">
              <strong>Notas:</strong> ${notas || "Ninguna."}
            </div>

            <div style="font-size: 10px; margin-top: 20px; text-align: justify; color: #555;">
              Recibí de la empresa LINOEM DEVELOPMENT S.A. DE C.V. la cantidad neta a que este recibo se refiere, estando conforme con las percepciones y deducciones que en él aparecen, por lo que no me reservo acción ni derecho alguno que ejercitar de ninguna naturaleza en contra de la empresa.
            </div>

            <div class="signature-box">
              <div class="signature-line">Firma de Conformidad del Colaborador</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", color: "#333", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#666", fontSize: "18px", borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>
        <FileText size={20} /> Registrar Nómina — Sistema Linoem
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* SECCIÓN EMPLEADO Y PERIODO */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#5c3c92", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <User size={16} /> Empleado y Periodo
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Colaborador</label>
                <select 
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }}
                  value={employeeName} onChange={e => setEmployeeName(e.target.value)}
                >
                  <option value="Administrador General HTJ — #1000 (SUPER_ADMIN)">Administrador General Linoem — #1000 (SUPER_ADMIN)</option>
                  <option value="Técnico Reparador — #1001">Técnico Reparador — #1001</option>
                  <option value="Vendedor de Mostrador — #1002">Vendedor de Mostrador — #1002</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Inicio Periodo</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Fin Periodo</label>
                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Días Trabajados</label>
                <input type="number" value={workedDays} onChange={e => setWorkedDays(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Días Festivos</label>
                <input type="number" value={holidays} onChange={e => setHolidays(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
            </div>
          </div>

          {/* SECCIÓN PERCEPCIONES */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <DollarSign size={16} /> Percepciones
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Salario Base (MXN)</label>
                <input type="number" value={salarioBase} onChange={e => setSalarioBase(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Horas Extras (cant.)</label>
                <input type="number" value={horasExtrasCant} onChange={e => setHorasExtrasCant(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Pago Hrs Extras (MXN)</label>
                <input type="number" value={pagoHrsExtras} onChange={e => setPagoHrsExtras(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Bono Asistencia (MXN)</label>
                <input type="number" value={bonoAsistencia} onChange={e => setBonoAsistencia(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Bono Puntualidad (MXN)</label>
                <input type="number" value={bonoPuntualidad} onChange={e => setBonoPuntualidad(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Otros Ingresos (MXN)</label>
                <input type="number" value={otrosIngresos} onChange={e => setOtrosIngresos(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
            </div>
            
            <div style={{ marginTop: "15px", padding: "12px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "6px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>TOTAL PERCEPCIONES:</span>
              <span>{formatMoney(totalPercepciones)}</span>
            </div>
          </div>

          {/* SECCIÓN RESUMEN FINAL */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <FileText size={16} /> Resumen Final
            </h3>
            <div style={{ border: "1px solid #fcd34d", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Percepciones:</span> <strong style={{ color: "#10b981" }}>{formatMoney(totalPercepciones)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Deducciones:</span> <strong style={{ color: "#ef4444" }}>{formatMoney(totalDeducciones)}</strong>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed #ddd" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold" }}>
                <span>NETO A PAGAR:</span> <span style={{ color: "#d97706" }}>{formatMoney(netoPagar)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* SECCIÓN DEDUCCIONES */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <Calculator size={16} /> Deducciones (IMSS / ISR / INFONAVIT / FONACOT)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>IMSS Trabajador (MXN)</label>
                <input type="number" value={imssTrabajador} onChange={e => setImssTrabajador(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>IMSS Patrón (MXN)</label>
                <input type="number" value={imssPatron} onChange={e => setImssPatron(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>ISR Retenido (MXN)</label>
                <input type="number" value={isrRetenido} onChange={e => setIsrRetenido(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>INFONAVIT (MXN)</label>
                <input type="number" value={infonavit} onChange={e => setInfonavit(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>FONACOT (MXN)</label>
                <input type="number" value={fonacot} onChange={e => setFonacot(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Otras Deducciones (MXN)</label>
                <input type="number" value={otrasDeducciones} onChange={e => setOtrasDeducciones(Number(e.target.value))} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              </div>
            </div>

            <div style={{ marginTop: "15px", padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "6px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>TOTAL DEDUCCIONES:</span>
              <span>{formatMoney(totalDeducciones)}</span>
            </div>
          </div>

          {/* CHECADAS DE RELOJ */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <Clock size={16} /> Checadas de Reloj
            </h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="datetime-local" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }} />
              <select style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }}>
                <option>Entrada</option>
                <option>Salida</option>
              </select>
            </div>
            <button style={{ background: "transparent", color: "#10b981", border: "none", marginTop: "10px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", width: "100%", justifyContent: "center" }}>
              <Plus size={14} /> Agregar Checada
            </button>
          </div>

          {/* NOTAS Y ESTADO */}
          <div style={{ marginTop: "auto" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Notas / Observaciones</label>
            <textarea 
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Vacaciones, bonos especiales, etc." 
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9", resize: "vertical", minHeight: "60px", marginBottom: "15px" }} 
            />

            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "5px" }}>Estado de Pago</label>
            <select value={estadoPago} onChange={e => setEstadoPago(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", background: "#f9f9f9" }}>
              <option value="Borrador (DRAFT)">Borrador (DRAFT)</option>
              <option value="Pagado (PAID)">Pagado (PAID)</option>
            </select>
          </div>

        </div>

      </div>

      {/* BOTÓN GUARDAR */}
      <button 
        onClick={printNomina}
        style={{ 
          width: "100%", 
          marginTop: "30px", 
          background: "#d97706", 
          color: "white", 
          border: "none", 
          padding: "15px", 
          borderRadius: "8px", 
          fontSize: "16px", 
          fontWeight: "bold", 
          cursor: "pointer", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: "8px",
          boxShadow: "0 4px 6px rgba(217, 119, 6, 0.2)"
        }}
      >
        <Save size={20} /> Guardar / Imprimir Recibo de Nómina
      </button>
    </div>
  );
}

