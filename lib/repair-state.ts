import { RepairStatus } from "@/generated/prisma/enums";

export const repairStatusLabels: Record<RepairStatus, string> = {
  RECEIVED: "Equipo recibido",
  PENDING_DIAGNOSIS: "Pendiente de diagnóstico",
  DIAGNOSING: "En diagnóstico",
  WAITING_ESTIMATE: "Esperando cotización",
  ESTIMATE_SENT: "Cotización enviada",
  WAITING_CUSTOMER_APPROVAL: "Esperando autorización",
  AUTHORIZED: "Autorizado",
  NOT_AUTHORIZED: "No autorizado",
  WAITING_PART: "Esperando refacción",
  PART_AVAILABLE: "Refacción disponible",
  REPAIRING: "En reparación",
  TESTING: "En pruebas",
  COMPLETED: "Reparación completada",
  NOT_VIABLE: "Reparación no viable",
  PAYMENT_PENDING: "Pendiente de pago",
  READY_FOR_DELIVERY: "Listo para entrega",
  DELIVERED: "Entregado",
  WARRANTY: "Garantía",
  CANCELLED: "Cancelado",
  ABANDONED: "Abandonado"
};

export const allowedTransitions: Record<RepairStatus, RepairStatus[]> = {
  RECEIVED: [RepairStatus.PENDING_DIAGNOSIS, RepairStatus.CANCELLED],
  PENDING_DIAGNOSIS: [RepairStatus.DIAGNOSING, RepairStatus.CANCELLED],
  DIAGNOSING: [RepairStatus.WAITING_ESTIMATE, RepairStatus.NOT_VIABLE, RepairStatus.CANCELLED],
  WAITING_ESTIMATE: [RepairStatus.ESTIMATE_SENT, RepairStatus.CANCELLED],
  ESTIMATE_SENT: [RepairStatus.WAITING_CUSTOMER_APPROVAL, RepairStatus.CANCELLED],
  WAITING_CUSTOMER_APPROVAL: [RepairStatus.AUTHORIZED, RepairStatus.NOT_AUTHORIZED, RepairStatus.CANCELLED],
  AUTHORIZED: [RepairStatus.WAITING_PART, RepairStatus.PART_AVAILABLE, RepairStatus.REPAIRING],
  NOT_AUTHORIZED: [RepairStatus.READY_FOR_DELIVERY, RepairStatus.CANCELLED],
  WAITING_PART: [RepairStatus.PART_AVAILABLE, RepairStatus.CANCELLED],
  PART_AVAILABLE: [RepairStatus.REPAIRING, RepairStatus.CANCELLED],
  REPAIRING: [RepairStatus.TESTING, RepairStatus.NOT_VIABLE],
  TESTING: [RepairStatus.COMPLETED, RepairStatus.REPAIRING, RepairStatus.NOT_VIABLE],
  COMPLETED: [RepairStatus.PAYMENT_PENDING, RepairStatus.READY_FOR_DELIVERY],
  NOT_VIABLE: [RepairStatus.READY_FOR_DELIVERY, RepairStatus.CANCELLED],
  PAYMENT_PENDING: [RepairStatus.READY_FOR_DELIVERY],
  READY_FOR_DELIVERY: [RepairStatus.DELIVERED, RepairStatus.WARRANTY],
  DELIVERED: [RepairStatus.WARRANTY],
  WARRANTY: [RepairStatus.DIAGNOSING, RepairStatus.REPAIRING, RepairStatus.TESTING, RepairStatus.READY_FOR_DELIVERY],
  CANCELLED: [],
  ABANDONED: [RepairStatus.READY_FOR_DELIVERY]
};

export function canTransition(from: RepairStatus, to: RepairStatus) {
  return from === to || allowedTransitions[from].includes(to);
}

export function statusProgress(status: RepairStatus) {
  const progress: Partial<Record<RepairStatus, number>> = {
    RECEIVED: 5, PENDING_DIAGNOSIS: 10, DIAGNOSING: 20, WAITING_ESTIMATE: 28,
    ESTIMATE_SENT: 32, WAITING_CUSTOMER_APPROVAL: 35, AUTHORIZED: 45,
    WAITING_PART: 48, PART_AVAILABLE: 55, REPAIRING: 68, TESTING: 82,
    COMPLETED: 90, PAYMENT_PENDING: 93, READY_FOR_DELIVERY: 97, DELIVERED: 100,
    NOT_AUTHORIZED: 40, NOT_VIABLE: 60, WARRANTY: 30, CANCELLED: 0, ABANDONED: 80
  };
  return progress[status] ?? 0;
}
