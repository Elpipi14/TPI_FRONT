import type { OrderStatus, PaymentMethod } from "../../../../types/order";

export function renderStatusBadge(status: OrderStatus): string {
  return `<span class="status-badge ${getStatusClass(status)}">${formatStatus(status)}</span>`;
}

export function getStatusClass(status: OrderStatus): string {
  return `status-${status.toLowerCase().replace("_", "-")}`;
}

export function getStatusIcon(status: OrderStatus): string {
  const icons: Record<OrderStatus, string> = {
    PENDIENTE: "fa-clock",
    EN_PREPARACION: "fa-utensils",
    ENTREGADO: "fa-circle-check",
    CANCELADO: "fa-circle-xmark",
  };

  return icons[status];
}

export function getStatusMessage(status: OrderStatus): string {
  const messages: Record<OrderStatus, string> = {
    PENDIENTE: "Tu pedido fue recibido y aguarda confirmación.",
    EN_PREPARACION: "Tu pedido está en preparación.",
    ENTREGADO: "Tu pedido fue entregado. Gracias por comprar en Food Store.",
    CANCELADO: "Tu pedido fue cancelado. Si necesitás ayuda, contactá al local.",
  };

  return messages[status];
}

export function formatStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  return labels[status];
}

export function formatPaymentMethod(paymentMethod?: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
  };

  return paymentMethod ? labels[paymentMethod] : "No informado";
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(price: number): string {
  return `$ ${price.toLocaleString("es-AR")}`;
}

export function escapeHtml(value: string): string {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}