import { AppLogo } from "@/components/AppLogo";
import ClientRealtime from "@/app/cliente/ClientRealtime";
import { decideEstimate, sendCustomerMessage } from "@/app/actions/repair-details";
import { requireClientOrder } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { repairStatusLabels, statusProgress } from "@/lib/repair-state";

export const dynamic = "force-dynamic";

export default async function ClientPage() {
  const order = await requireClientOrder();
  const progress = statusProgress(order.status);

  if (order.status === "DELIVERED") {
    return (
      <main className="client-shell">
        <div className="client-container">
          <header className="client-header">
            <AppLogo />
            <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar</button></form>
          </header>
          <section className="client-card delivered-card">
            <span className="eyebrow">CONSTANCIA DE ENTREGA</span>
            <div className="page-header client-title-row">
              <div><h2>Equipo entregado</h2><p>Orden {order.publicFolio}</p></div>
              <span className="badge success">ENTREGADO</span>
            </div>
            <div className="client-summary">
              <div><span>Equipo</span><strong>{order.device.brand} {order.device.model}</strong></div>
              <div><span>Fecha de entrega</span><strong>{order.deliveredAt ? order.deliveredAt.toLocaleString("es-MX") : "Registrada"}</strong></div>
              <div><span>Total</span><strong>{formatMoney(order.total)}</strong></div>
              <div><span>Sucursal</span><strong>{order.branch.name}</strong></div>
            </div>
            <div className="alert alert-info client-delivery-notice">Por seguridad, el chat y los avances detallados dejaron de estar disponibles después de la entrega. Conserva el folio para cualquier garantía.</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="client-shell">
      <ClientRealtime />
      <div className="client-container">
        <header className="client-header">
          <AppLogo />
          <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar seguimiento</button></form>
        </header>

        <section className="client-card client-hero-card">
          <span className="eyebrow">PORTAL DEL CLIENTE · SEGUIMIENTO PRIVADO</span>
          <div className="page-header client-title-row">
            <div><h2>{order.device.brand} {order.device.model}</h2><p>Orden {order.publicFolio}</p></div>
            <span className="badge success">{repairStatusLabels[order.status]}</span>
          </div>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="client-summary">
            <div><span>Avance</span><strong>{progress}%</strong></div>
            <div><span>Total autorizado</span><strong>{formatMoney(order.total)}</strong></div>
            <div><span>Anticipo</span><strong>{formatMoney(order.deposit)}</strong></div>
            <div><span>Fecha estimada</span><strong>{order.promisedAt ? order.promisedAt.toLocaleDateString("es-MX") : "Por confirmar"}</strong></div>
          </div>
        </section>

        <section className="grid-two client-grid">
          <article className="client-card">
            <h3>Avances de reparación</h3>
            <div className="timeline">
              {order.updates.map((update) => (
                <div className="timeline-item" key={update.id}>
                  <strong>{repairStatusLabels[update.newStatus]}</strong>
                  <span>{update.comment}</span>
                  <small>{update.createdAt.toLocaleString("es-MX")}</small>
                </div>
              ))}
            </div>
          </article>
          <article className="client-card">
            <h3>Diagnóstico y servicio</h3>
            <p>{order.diagnosis ?? "El diagnóstico todavía está en proceso."}</p>
            <div className="info-row"><span>Técnico asignado</span><strong>{order.technician?.name ?? "Por asignar"}</strong></div>
            <div className="info-row"><span>Sucursal</span><strong>{order.branch.name}</strong></div>
            <div className="info-row"><span>Problema reportado</span><strong>{order.issue}</strong></div>
          </article>
        </section>

        <section className="client-card">
          <h3>Cotizaciones adicionales</h3>
          {order.estimates.length ? order.estimates.map((estimate) => (
            <div className={`estimate-card ${estimate.status === "PENDING" ? "pending" : ""}`} key={estimate.id}>
              <div className="page-header estimate-title-row">
                <div><strong>Versión {estimate.version} · {estimate.title}</strong><p>{estimate.reason}</p></div>
                <span className="badge">{estimate.status}</span>
              </div>
              <div className="client-summary">
                <div><span>Refacciones</span><strong>{formatMoney(estimate.partsAmount)}</strong></div>
                <div><span>Mano de obra</span><strong>{formatMoney(estimate.laborAmount)}</strong></div>
                <div><span>Impuestos</span><strong>{formatMoney(estimate.taxAmount)}</strong></div>
                <div><span>Total adicional</span><strong>{formatMoney(estimate.totalAmount)}</strong></div>
              </div>
              {estimate.status === "PENDING" && (
                <div className="inline-actions estimate-actions">
                  <form action={decideEstimate.bind(null, estimate.id, "ACCEPTED")}><button className="btn btn-primary">ACEPTO LA REPARACIÓN Y EL CARGO ADICIONAL</button></form>
                  <form action={decideEstimate.bind(null, estimate.id, "REJECTED")}><button className="btn btn-danger">NO ACEPTO LA REPARACIÓN ADICIONAL</button></form>
                </div>
              )}
            </div>
          )) : <div className="empty">No existen cotizaciones adicionales pendientes.</div>}
        </section>

        <section className="client-card">
          <h3>Mensajes con recepción y técnico</h3>
          <div className="chat">
            {order.messages.map((message) => (
              <div className={`chat-message ${message.senderType === "CUSTOMER" ? "customer" : message.senderType === "SYSTEM" ? "system" : ""}`} key={message.id}>
                {message.body}
                <small>{message.senderType === "CUSTOMER" ? "Tú" : message.senderUser?.name ?? "Sistema"} · {message.createdAt.toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
          <form action={sendCustomerMessage} className="form-grid one client-message-form">
            <div className="field"><textarea name="body" maxLength={3000} placeholder="Escribe un mensaje para recepción o el técnico" required /></div>
            <button className="btn btn-primary">Enviar mensaje</button>
          </form>
        </section>
      </div>
    </main>
  );
}
