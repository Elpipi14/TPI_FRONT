import Swal from "sweetalert2";
import { logout } from "../../../utils/auth";
import type { PaymentMethod } from "../../../types/order";

export function formatPrice(price: number): string {
  return `$ ${price.toLocaleString("es-AR")}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getInputValue(selector: string): string {
  return document
    .querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector)
    ?.value.trim() ?? "";
}

export function setInputValue(selector: string, value: string): void {
  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
  if (input) input.value = value;
}

export function setText(selector: string, value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

export function showElement(selector: string): void {
  document.querySelector<HTMLElement>(selector)?.classList.remove("hidden");
}

export function hideElement(selector: string): void {
  document.querySelector<HTMLElement>(selector)?.classList.add("hidden");
}

export function escapeHtml(value: string): string {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

export async function showError(message: string): Promise<void> {
  await Swal.fire({
    icon: "error",
    title: "Validación",
    text: message,
  });
}

export function getEditingId(form: HTMLFormElement): number | undefined {
  const id = Number(form.dataset.editingId);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export function formatPaymentMethod(paymentMethod?: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
  };

  return paymentMethod ? labels[paymentMethod] : "No informado";
}

export function initLogoutButton(): void {
  document.querySelector<HTMLButtonElement>("#profile-logout-btn")?.addEventListener("click", () => {
    logout();
    window.location.href = "/src/pages/auth/login/login.html";
  });
}