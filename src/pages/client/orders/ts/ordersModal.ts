import type { IUser } from "../../../../types/IUser";
import type { Order } from "../../../../types/order";
import {
  escapeHtml,
  formatDate,
  formatPaymentMethod,
  formatPrice,
  getStatusIcon,
  getStatusMessage,
  renderStatusBadge,
} from "./ordersHelpers";

export function openOrderModal(order: Order, user: IUser): void {
  const modal = document.querySelector<HTMLElement>("#order-modal");
  const modalBody = document.querySelector<HTMLElement>("#order-modal-body");

  if (!modal || !modalBody) {
    return;
  }

  modalBody.innerHTML = renderOrderModal(order, user);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function initModalEvents(): void {
  const modal = document.querySelector<HTMLElement>("#order-modal");
  const closeButton = document.querySelector<HTMLButtonElement>("#close-order-modal");

  closeButton?.addEventListener("click", closeOrderModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeOrderModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOrderModal();
    }
  });
}

function closeOrderModal(): void {
  const modal = document.querySelector<HTMLElement>("#order-modal");

  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderOrderModal(order: Order, user: IUser): string {
  const shippingCost = 0;
  const subtotal = order.total;
  const total = subtotal + shippingCost;

  return `
    <div class="modal-header">
      <span class="modal-status-icon">
        <i class="fa-solid ${getStatusIcon(order.status)}"></i>
      </span>

      <div>
        <h3>Pedido #${order.id}</h3>
        <p>${formatDate(order.date)}</p>
      </div>

      ${renderStatusBadge(order.status)}
    </div>

    <section class="modal-block">
      <h4>Información de entrega</h4>
      <p><strong>Cliente:</strong> ${escapeHtml(user.nombre)}</p>
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Celular:</strong> ${escapeHtml(user.celular || "Sin cargar")}</p>
      <p><strong>Entrega:</strong> A coordinar con el local</p>
      <p><strong>Forma de pago:</strong> ${formatPaymentMethod(order.paymentMethod)}</p>
    </section>

    <section class="modal-block">
      <h4>Productos</h4>

      ${order.items
        .map(
          (item) => `
            <div class="modal-product">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <p>Cantidad: ${item.quantity} x ${formatPrice(item.price)}</p>
              </div>

              <strong class="modal-price">${formatPrice(item.subtotal)}</strong>
            </div>
          `
        )
        .join("")}
    </section>

    <section class="modal-block">
      <h4>Desglose de costos</h4>

      <div class="cost-row">
        <span>Subtotal</span>
        <strong>${formatPrice(subtotal)}</strong>
      </div>

      <div class="cost-row">
        <span>Envío</span>
        <strong>${formatPrice(shippingCost)}</strong>
      </div>

      <div class="cost-row">
        <span>Total</span>
        <strong>${formatPrice(total)}</strong>
      </div>
    </section>

    <p class="status-message">${getStatusMessage(order.status)}</p>
  `;
}