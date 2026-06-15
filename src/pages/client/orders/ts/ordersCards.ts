import type { Order } from "../../../../types/order";
import {
  escapeHtml,
  formatDate,
  formatPaymentMethod,
  formatPrice,
  renderStatusBadge,
} from "./ordersHelpers";

export function renderEmptyOrders(): string {
  return `
    <article class="empty-orders">
      <i class="fa-solid fa-bag-shopping"></i>
      <h3>No tenés pedidos para mostrar</h3>
      <p>Cuando confirmes una compra, vas a verla en este historial.</p>
    </article>
  `;
}

export function renderOrderCard(order: Order): string {
  const summaryItems = order.items.slice(0, 3).map((item) => {
    return `<span>${item.quantity} x ${escapeHtml(item.name)}</span>`;
  });

  const remainingItems = order.items.length - 3;

  if (remainingItems > 0) {
    summaryItems.push(`<span>+${remainingItems} producto(s) más</span>`);
  }

  return `
    <button type="button" class="order-card" data-order-id="${order.id}">
      <div class="order-card-top">
        <div>
          <h3>Pedido #${order.id}</h3>
          <p class="order-date">${formatDate(order.date)}</p>
        </div>

        ${renderStatusBadge(order.status)}
      </div>

      <div class="order-summary">
        ${summaryItems.join("")}
      </div>

      <p class="order-payment">
        Pago: ${formatPaymentMethod(order.paymentMethod)}
      </p>

      <div class="order-card-bottom">
        <p class="order-count">${order.items.length} producto(s)</p>
        <p class="order-total">${formatPrice(order.total)}</p>
      </div>
    </button>
  `;
}