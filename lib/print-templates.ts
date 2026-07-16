export type PrintItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type PrintSale = {
  id: string;
  folio: string;
  total: any;
  subtotal: any;
  tax: any;
  createdAt: string;
  user?: { name: string };
  branch?: { name: string };
  items: PrintItem[];
  payments?: { method: string; amount: any }[];
};

const formatPaymentMethod = (method: string) => {
  switch (method) {
    case "CASH": return "Efectivo";
    case "TRANSFER": return "Transferencia";
    case "CARD_TERMINAL": return "Terminal Tarjeta";
    case "DIGITAL": return "Pago Digital";
    default: return method;
  }
};

const formatMoney = (amount: number) => {
  return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 1. TICKET DIGITAL EN TICKET THERMAL
export function printTicket(sale: PrintSale) {
  const win = window.open("", "_blank");
  if (!win) return alert("Por favor habilita las ventanas emergentes para imprimir.");

  const dateStr = new Date(sale.createdAt).toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
  const paymentMethod = sale.payments?.[0]?.method || "CASH";
  const seller = sale.user?.name || "Vendedor";
  const branchName = sale.branch?.name || "Sucursal Matriz";

  const itemsHtml = sale.items
    .map(
      (item) => `
    <tr>
      <td style="text-align: left; padding: 4px 0;">${item.quantity}x ${item.description}</td>
      <td style="text-align: right; padding: 4px 0;">${formatMoney(Number(item.unitPrice))}</td>
      <td style="text-align: right; padding: 4px 0;">${formatMoney(Number(item.total))}</td>
    </tr>
  `
    )
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>Ticket_${sale.folio}</title>
        <style>
          @page {
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            padding-top: 60px;
            font-size: 12px;
            color: #000;
            background: #fff;
            position: relative;
          }
          .print-actions-bar {
            background: #1e293b;
            padding: 10px;
            display: flex;
            justify-content: center;
            gap: 10px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .action-btn {
            padding: 6px 12px;
            font-size: 11px;
            font-weight: bold;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: opacity 0.2s;
          }
          .action-btn:hover {
            opacity: 0.9;
          }
          .print-btn {
            background: #10b981;
            color: white;
          }
          .close-btn {
            background: #ef4444;
            color: white;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              padding-top: 0 !important;
            }
          }
          /* Marca de agua transparente */
          .watermark {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70mm;
            height: 70mm;
            background-image: url('https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.08;
            pointer-events: none;
            z-index: 1;
          }
          .content-wrap {
            position: relative;
            z-index: 2;
          }
          .header {
            text-align: center;
            margin-bottom: 12px;
          }
          .logo {
            width: 55mm;
            margin-bottom: 6px;
          }
          .title {
            font-weight: bold;
            font-size: 14px;
            margin: 4px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .totals {
            margin-top: 10px;
            font-size: 12px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }
          .grand-total {
            font-weight: bold;
            font-size: 13px;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 4px 0;
            margin-top: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="no-print print-actions-bar">
          <button onclick="window.print()" class="action-btn print-btn">🖨️ Imprimir / PDF</button>
          <button onclick="window.close()" class="action-btn close-btn">❌ Cerrar</button>
        </div>
        <div class="watermark"></div>
        <div class="content-wrap" contenteditable="true">
          <div class="header">
            <img src="https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png" class="logo" />
            <div class="title">CELULARES LINOEM</div>
            <div>${branchName}</div>
            <div>Folio: <strong>${sale.folio}</strong></div>
            <div>Fecha: ${dateStr}</div>
            <div>Atendió: ${seller}</div>
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px dashed #000; padding-bottom: 4px;">Concepto</th>
                <th style="text-align: right; border-bottom: 1px dashed #000; padding-bottom: 4px;">P.Unit</th>
                <th style="text-align: right; border-bottom: 1px dashed #000; padding-bottom: 4px;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>${formatMoney(Number(sale.subtotal))}</span>
            </div>
            <div class="totals-row">
              <span>IVA (16%)</span>
              <span>${formatMoney(Number(sale.tax))}</span>
            </div>
            <div class="totals-row grand-total">
              <span>TOTAL</span>
              <span>${formatMoney(Number(sale.total))}</span>
            </div>
          </div>
          
          <div style="margin-top: 8px; font-size: 11px;">
            <strong>Método de pago:</strong> ${formatPaymentMethod(paymentMethod)}
          </div>
          
          <div class="footer">
            <p>¡Gracias por su compra!<br>Garantía de 30 días en refacciones.<br>Conserve este ticket para devoluciones.</p>
            <div style="margin-top: 8px; font-size: 8px; color: #555;">VALIDO CON MARCA DE AGUA LINOEM</div>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

// 2. RECIBO FORMAL CARTA / PDF (MARCA DE AGUA)
export function printFormalReceipt(sale: PrintSale, type: "client" | "owner") {
  const win = window.open("", "_blank");
  if (!win) return alert("Por favor habilita las ventanas emergentes para imprimir.");

  const dateStr = new Date(sale.createdAt).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" });
  const timeZoneStr = new Date(sale.createdAt).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City" });
  
  // Expiration Date (15 days after)
  const expDate = new Date(sale.createdAt);
  expDate.setDate(expDate.getDate() + 15);
  const expDateStr = expDate.toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" });

  const paymentMethod = sale.payments?.[0]?.method || "CASH";
  const seller = sale.user?.name || "Vendedor Matriz";
  const branchName = sale.branch?.name || "Sucursal Centro Linoem";

  const itemsHtml = sale.items
    .map(
      (item, idx) => `
    <tr style="${idx % 2 === 0 ? "background-color: #f2f7fc;" : ""}">
      <td style="padding: 10px; border-bottom: 1px solid #e1e9f4; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e9f4; font-weight: bold; color: #1e3a60;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e9f4; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e9f4; text-align: right;">${formatMoney(Number(item.unitPrice))}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e1e9f4; text-align: right; font-weight: bold; color: #1e3a60;">${formatMoney(Number(item.total))}</td>
    </tr>
  `
    )
    .join("");

  win.document.write(`
    <html>
      <head>
        <title>Recibo_${sale.folio}</title>
        <style>
          @page {
            size: letter;
            margin: 15mm;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            background: #fff;
            margin: 0;
            padding: 0;
            padding-top: 75px;
            font-size: 12px;
            line-height: 1.4;
            position: relative;
          }
          .print-actions-bar {
            background: #0054a6;
            padding: 15px;
            display: flex;
            justify-content: center;
            gap: 20px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: 0 4px 10px rgba(0,84,166,0.25);
          }
          .action-btn {
            padding: 8px 16px;
            font-size: 13px;
            font-weight: bold;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
            font-family: 'Arial', sans-serif;
          }
          .action-btn:hover {
            opacity: 0.9;
          }
          .print-btn {
            background: #10b981;
            color: white;
          }
          .close-btn {
            background: #ef4444;
            color: white;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              padding-top: 0 !important;
            }
          }
          /* Marca de agua de LINOEM */
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            width: 130mm;
            height: 130mm;
            background-image: url('https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.05;
            pointer-events: none;
            z-index: 1;
          }
          .page-content {
            position: relative;
            z-index: 2;
          }
          /* Top bar Telmex style (cyan/blue theme) */
          .top-bar {
            background: linear-gradient(90deg, #0054a6 0%, #0093d0 100%);
            color: #fff;
            padding: 8px 16px;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            border-radius: 8px 8px 0 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header-table {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
          }
          .logo {
            width: 180px;
          }
          .invoice-box {
            background: #f2f7fc;
            border: 1.5px solid #0054a6;
            border-radius: 8px;
            padding: 12px;
            width: 240px;
            float: right;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .invoice-box table {
            width: 100%;
            border-collapse: collapse;
          }
          .invoice-box td {
            padding: 4px 0;
          }
          .client-box {
            margin-top: 24px;
            width: 50%;
            display: inline-block;
            vertical-align: top;
          }
          .summary-box {
            margin-top: 24px;
            width: 44%;
            display: inline-block;
            float: right;
            background: #eef5fc;
            border-left: 5px solid #0054a6;
            padding: 12px;
            border-radius: 0 8px 8px 0;
          }
          .summary-title {
            font-weight: bold;
            color: #0054a6;
            font-size: 13px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            border: 1px solid #c8d7e8;
            border-radius: 8px;
            overflow: hidden;
          }
          .detail-table th {
            background: #0054a6;
            color: #fff;
            font-weight: bold;
            padding: 10px;
            text-transform: uppercase;
            font-size: 11px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid rgba(0, 84, 166, 0.1);
          }
          .summary-row.grand-total {
            font-weight: bold;
            font-size: 15px;
            color: #ff3b30;
            border-bottom: none;
          }
          /* Telmex style fake barcode and footer */
          .barcode-section {
            margin-top: 40px;
            border-top: 2px dashed #0054a6;
            padding-top: 20px;
            text-align: center;
          }
          .barcode-line {
            display: inline-block;
            height: 45px;
            background: #000;
            width: 2px;
            margin: 0 1px;
          }
          .barcode-line.wide {
            width: 5px;
          }
          .barcode-number {
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 4px;
            margin-top: 6px;
          }
          .footer-text {
            margin-top: 25px;
            font-size: 9px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="no-print print-actions-bar">
          <button onclick="window.print()" class="action-btn print-btn">🖨️ Imprimir o Guardar como PDF</button>
          <button onclick="window.close()" class="action-btn close-btn">❌ Cerrar Vista</button>
        </div>
        <div class="watermark"></div>
        <div class="page-content" contenteditable="true">
          <div class="top-bar">
            <span>Estado de Cuenta Comercial Linoem</span>
            <span>${type === "client" ? "Copia Cliente" : "Copia Propietario / Oficina"}</span>
          </div>

          <table class="header-table">
            <tr>
              <td style="vertical-align: top;">
                <img src="https://punto-de-venta-celulares-production.up.railway.app/logo-linoem-transparent.png" class="logo" />
                <div style="margin-top: 10px; color: #555;">
                  <strong>LINOEM DEVELOPMENT S.A. DE C.V.</strong><br>
                  RFC: LIN240714E23<br>
                  ${branchName}<br>
                  Soporte: celularesreparacion957@gmail.com
                </div>
              </td>
              <td style="vertical-align: top; text-align: right;">
                <div class="invoice-box">
                  <table>
                    <tr>
                      <td style="font-weight: bold; color: #0054a6;">Folio de Venta</td>
                      <td style="text-align: right; font-weight: bold; font-size: 14px; color: #d00000;">${sale.folio}</td>
                    </tr>
                    <tr>
                      <td>Fecha Emisión</td>
                      <td style="text-align: right;">${dateStr} ${timeZoneStr}</td>
                    </tr>
                    <tr>
                      <td>Fecha Vencimiento</td>
                      <td style="text-align: right; font-weight: bold;">${expDateStr}</td>
                    </tr>
                    <tr>
                      <td style="font-weight: bold;">Págase antes de</td>
                      <td style="text-align: right; font-weight: bold; color: #0054a6;">${expDateStr}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>

          <div class="client-box">
            <div style="font-size: 13px; font-weight: bold; color: #1e3a60; border-bottom: 2px solid #0054a6; padding-bottom: 4px; margin-bottom: 8px;">
              DATOS DE COMPRA / CLIENTE
            </div>
            <strong>CLIENTE MOSTRADOR</strong><br>
            RFC: XAXX010101000<br>
            Dirección: Sucursal de Atención a Clientes<br>
            Ciudad Juárez, Chihuahua, México<br>
            Vendedor: ${seller}
          </div>

          <div class="summary-box">
            <div class="summary-title">Resumen de Cuenta</div>
            <div class="summary-row">
              <span>Cargos del Mes</span>
              <span>${formatMoney(Number(sale.subtotal))}</span>
            </div>
            <div class="summary-row">
              <span>Impuestos (IVA 16%)</span>
              <span>${formatMoney(Number(sale.tax))}</span>
            </div>
            <div class="summary-row grand-total">
              <span>Total a Pagar</span>
              <span>${formatMoney(Number(sale.total))}</span>
            </div>
          </div>

          <table class="detail-table">
            <thead>
              <tr>
                <th style="width: 50px;">Partida</th>
                <th>Descripción del Concepto / Refacción</th>
                <th style="width: 70px;">Cant.</th>
                <th style="width: 110px;">P. Unitario</th>
                <th style="width: 120px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 25px; padding: 12px; background-color: #f9fbfd; border: 1px solid #c8d7e8; border-radius: 8px;">
            <strong>Detalle transaccional de pago:</strong><br>
            Este recibo formal ampara el pago de los conceptos descritos bajo el método de pago <strong>${formatPaymentMethod(paymentMethod)}</strong>. 
            El cargo se refleja como pago único de conformidad con el artículo 29-A del CFF.
          </div>

          <div class="barcode-section">
            <div style="font-weight: bold; color: #0054a6; font-size: 11px; margin-bottom: 8px; text-transform: uppercase;">
              Código de Validación de Cobro
            </div>
            <div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line"></div>
              <div class="barcode-line wide"></div>
              <div class="barcode-line"></div>
            </div>
            <div class="barcode-number">01 ${sale.folio.replace("VTA-", "")} 240714 2026</div>
          </div>

          <div class="footer-text">
            LINOEM DEVELOPMENT - LINOEM S.A. DE C.V. - Estado de cuenta comercial emitido de forma digital. Válido únicamente con la marca de agua transparente del logotipo oficial de LINOEM estampada en el fondo del documento. Todos los derechos reservados 2026.
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}
