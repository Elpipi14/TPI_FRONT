import Swal from "sweetalert2";
import { logout } from "../../../utils/auth";
import { getCartItemsCount } from "../../../utils/cart";
import type { OrderStatus, PaymentMethod } from "../../../types/order";

export function formatPrice(price: number): string {
  return `$ ${price.toLocaleString("es-AR")}`;
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

export function formatPaymentMethod(paymentMethod?: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
  };
  return paymentMethod ? labels[paymentMethod] : "No informado";
}

export function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };
  return labels[status];
}

export function escapeHtml(value: string): string {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

export function setText(selector: string, value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.textContent = value;
  }
}

export function updateCartCount(): void {
  const cartCount = document.querySelector<HTMLElement>("#cart-count");
  if (cartCount) {
    cartCount.textContent = String(getCartItemsCount());
  }
}

export function initLogoutButton(): void {
  document
    .querySelector<HTMLButtonElement>("#profile-logout-btn")
    ?.addEventListener("click", () => {
      logout();
      window.location.href = "/src/pages/auth/login/login.html";
    });
}

export async function showError(title: string, text: string): Promise<void> {
  await Swal.fire({ icon: "error", title, text });
}
