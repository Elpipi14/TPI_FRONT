import type { IUser } from "../../../types/IUser";
import type { Order } from "../../../types/order";
import { getOrdersByUser } from "../../../utils/orders";
import {
  escapeHtml,
  formatDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatPrice,
} from "./userHelpers";

const ORDERS_PER_PAGE = 3;
let currentOrdersPage = 1;

export function renderOrders(user: IUser): void {
  const ordersList = document.querySelector<HTMLElement>("#orders-list");
  const pagination = getOrCreatePagination();

  if (!ordersList) {
    return;
  }

  const orders = getOrdersByUser(user.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (orders.length === 0) {
    ordersList.innerHTML = `<p class="empty-message">Todavía no tenés pedidos.</p>`;
    pagination.innerHTML = "";
    return;
  }
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  currentOrdersPage = Math.min(currentOrdersPage, totalPages);

  const startIndex = (currentOrdersPage - 1) * ORDERS_PER_PAGE;

  const paginatedOrders = orders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE,
  );

  ordersList.innerHTML = paginatedOrders.map(renderOrderCard).join("");
  renderOrdersPagination(user, totalPages, pagination);
}

function renderOrderCard(order: Order): string {
  const items = order.items
    .map((item) => `${item.quantity} x ${escapeHtml(item.name)}`)
    .join(", ");
  return ` <article class="order-item order-item-card"> <p><strong>Pedido:</strong> #${order.id}</p> <p><strong>Fecha:</strong> ${formatDate(order.date)}</p> <p><strong>Estado:</strong> ${formatOrderStatus(order.status)}</p> <p><strong>Forma de pago:</strong> ${formatPaymentMethod(order.paymentMethod)}</p> <p><strong>Productos:</strong> ${items}</p> <p><strong>Total:</strong> ${formatPrice(order.total)}</p> </article> `;
}

function renderOrdersPagination(
  user: IUser,
  totalPages: number,
  container: HTMLElement,
): void {
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = ` <button type="button" id="prev-orders-page" ${currentOrdersPage === 1 ? "disabled" : ""}> Anterior </button> <span>Página ${currentOrdersPage} de ${totalPages}</span> <button type="button" id="next-orders-page" ${currentOrdersPage === totalPages ? "disabled" : ""}> Siguiente </button> `;
  container

    .querySelector<HTMLButtonElement>("#prev-orders-page")
    ?.addEventListener("click", () => {
      currentOrdersPage = Math.max(1, currentOrdersPage - 1);
      renderOrders(user);
    });
  container

    .querySelector<HTMLButtonElement>("#next-orders-page")
    ?.addEventListener("click", () => {
      currentOrdersPage = Math.min(totalPages, currentOrdersPage + 1);
      renderOrders(user);
    });
}

function getOrCreatePagination(): HTMLElement {
  let pagination = document.querySelector<HTMLElement>("#orders-pagination");
  const ordersList = document.querySelector<HTMLElement>("#orders-list");

  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "orders-pagination";
    pagination.className = "pagination-controls";
    ordersList?.insertAdjacentElement("afterend", pagination);
  }

  return pagination;
}
