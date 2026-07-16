"use client";

import { useState } from "react";
import { Printer, Save, FileText, User, DollarSign, Calculator, Clock, CalendarCheck, Plus } from "lucide-react";

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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { width: 100%; max-width: 800px; margin: 0 auto; position: relative; background: white; min-height: 100vh; }
            
            /* Top Header Styling */
            .header-banner { 
              background: linear-gradient(135deg, #0052cc 0%, #003380 100%); 
              height: 140px; 
              width: 100%; 
              position: relative; 
              border-bottom-left-radius: 50% 20px;
              border-bottom-right-radius: 50% 20px;
              display: flex;
              justify-content: space-between;
              padding: 20px 40px;
              box-sizing: border-box;
              color: white;
            }
            .header-logo-container { text-align: right; }
            .logo { width: 180px; filter: brightness(0) invert(1); }
            
            .title-section { padding: 20px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
            .main-title { color: #0052cc; font-size: 32px; font-weight: 700; margin: 0 0 15px 0; letter-spacing: 1px; }
            .company-info { font-size: 10px; color: #555; line-height: 1.5; }
            
            .receipt-details { text-align: right; }
            .receipt-number { font-size: 16px; font-weight: bold; color: #333; }
            
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 0 40px; margin-bottom: 20px; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-weight: bold; color: #333; margin-bottom: 5px; }
            
            /* Table Styling */
            .table-container { padding: 0 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
            th { background: #e5e7eb; color: #333; padding: 10px; text-align: left; font-size: 11px; border-bottom: 2px solid #fff; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .col-amount { text-align: right; font-weight: 600; }
            .header-dark { background: #333; color: white; }
            
            /* Totals */
            .totals-section { display: flex; justify-content: flex-end; padding: 0 40px; }
            .totals-table { width: 300px; }
            .totals-table td { padding: 8px 10px; }
            .grand-total-row { background: #f3f4f6; font-size: 14px; font-weight: bold; }
            
            /* Footer */
            .footer-section { padding: 40px; margin-top: 20px; }
            .notes { font-size: 10px; color: #555; max-width: 60%; margin-bottom: 20px; }
            .thanks-banner { background: #0052cc; color: white; padding: 10px 20px; display: inline-block; font-weight: bold; font-size: 14px; }
            
            .signature-box { float: right; text-align: center; width: 200px; margin-top: -60px; }
            .signature-line { border-top: 1px solid #333; padding-top: 5px; font-weight: bold; color: #333; }
            
            @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px; padding-top: 20px;">
            <button style="padding: 10px 20px; background: #0052cc; color: white; border: none; cursor: pointer; font-weight: bold; border-radius: 5px; font-size: 14px;" onclick="window.print()">🖨️ Imprimir Recibo PDF</button>
          </div>
          
          <div class="page" contenteditable="true">
            <!-- Header Wave Banner -->
            <div class="header-banner">
              <div></div>
              <div class="header-logo-container">
                <img src="https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png" class="logo" />
                <div style="font-size: 10px; margin-top: 5px; letter-spacing: 1px;">INNOVACIÓN DIGITAL QUE IMPULSA TU FUTURO</div>
              </div>
            </div>

            <!-- Title & Info -->
            <div class="title-section">
              <div>
                <h1 class="main-title">RECIBO DE NÓMINA</h1>
                <div class="meta-label">Colaborador:</div>
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">${employeeName}</div>
                <div class="company-info">
                  <strong>LINOEM DEVELOPMENT S.A. DE C.V.</strong><br>
                  RFC: LIN240714E23<br>
                  Días Pagados: ${workedDays} (Festivos: ${holidays})
                </div>
              </div>
              <div class="receipt-details">
                <div style="color: #666; margin-bottom: 5px;">Comprobante:</div>
                <div class="receipt-number">#${Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Periodo:</span>
                <span>${periodStart} al ${periodEnd}</span>
              </div>
              <div class="meta-item" style="text-align: right;">
                <span class="meta-label">Neto a Pagar:</span>
                <span style="font-weight: bold; color: #0052cc;">${formatMoney(netoPagar)}</span>
              </div>
            </div>

            <!-- Table -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Concepto (Percepciones)</th>
                    <th class="col-amount header-dark">Monto (MXN)</th>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Concepto (Deducciones)</th>
                    <th class="col-amount header-dark">Monto (MXN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>01</td><td>Salario Base</td><td class="col-amount">${formatMoney(salarioBase)}</td>
                    <td>06</td><td>IMSS Trabajador</td><td class="col-amount">${formatMoney(imssTrabajador)}</td>
                  </tr>
                  <tr>
                    <td>02</td><td>Pago Horas Extras (${horasExtrasCant}h)</td><td class="col-amount">${formatMoney(pagoHrsExtras)}</td>
                    <td>07</td><td>ISR Retenido</td><td class="col-amount">${formatMoney(isrRetenido)}</td>
                  </tr>
                  <tr>
                    <td>03</td><td>Bono Asistencia</td><td class="col-amount">${formatMoney(bonoAsistencia)}</td>
                    <td>08</td><td>INFONAVIT</td><td class="col-amount">${formatMoney(infonavit)}</td>
                  </tr>
                  <tr>
                    <td>04</td><td>Bono Puntualidad</td><td class="col-amount">${formatMoney(bonoPuntualidad)}</td>
                    <td>09</td><td>FONACOT / Otras</td><td class="col-amount">${formatMoney(fonacot + otrasDeducciones)}</td>
                  </tr>
                  <tr>
                    <td>05</td><td>Otros Ingresos</td><td class="col-amount">${formatMoney(otrosIngresos)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td>Suma Percepciones</td>
                  <td class="col-amount">${formatMoney(totalPercepciones)}</td>
                </tr>
                <tr>
                  <td>Suma Deducciones</td>
                  <td class="col-amount" style="color: #ef4444;">- ${formatMoney(totalDeducciones)}</td>
                </tr>
                <tr class="grand-total-row">
                  <td>NETO A PAGAR</td>
                  <td class="col-amount">${formatMoney(netoPagar)}</td>
                </tr>
              </table>
            </div>

            <!-- Footer -->
            <div class="footer-section">
              <div class="notes">
                <strong>Notas / Condiciones:</strong><br>
                ${notas || "Ninguna."}<br><br>
                Recibí de la empresa LINOEM DEVELOPMENT S.A. DE C.V. la cantidad neta a que este recibo se refiere, estando conforme con las percepciones y deducciones que en él aparecen, por lo que no me reservo acción ni derecho alguno en contra de la empresa.
              </div>
              
              <div class="thanks-banner">Gracias por su esfuerzo y dedicación</div>
              
              <div class="signature-box">
                <br><br><br>
                <div class="signature-line">Firma de Conformidad</div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">Colaborador</div>
              </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          {/* SECCIÓN EMPLEADO Y PERIODO */}
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#5c3c92", fontSize: "14px", textTransform: "uppercase", marginBottom: "15px" }}>
              <User size={16} /> Empleado y Periodo
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
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

