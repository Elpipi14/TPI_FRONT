import Swal from "sweetalert2";
import { getOrders, getOrderStatuses, updateOrderStatus } from "../../../utils/orders";
import type { Order, OrderStatus } from "../../../types/order";
import {
  escapeHtml,
  formatDate,
  formatPaymentMethod,
  formatPrice,
} from "./adminHelpers";

const ADMIN_ORDERS_PER_PAGE = 5;

let currentAdminOrdersPage = 1;

export function initOrderFilter(): void {
  const select = document.querySelector<HTMLSelectElement>("#order-status-filter");

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="TODOS">Todos los estados</option>
    ${getOrderStatuses()
      .map((status) => `<option value="${status}">${formatOrderStatus(status)}</option>`)
      .join("")}
  `;

  select.addEventListener("change", () => {
    currentAdminOrdersPage = 1;
    renderOrdersTable();
  });
}

export function initOrderActions(onChange: () => void): void {
  
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const viewButton = target.closest<HTMLButtonElement>(".view-order-btn");

    if (!viewButton) {
      return;
    }

    const orderId = Number(viewButton.dataset.id);
    const order = getOrders().find((item) => item.id === orderId);

    if (order) {
      openOrderDetailModal(order);
    }
  });

  document.addEventListener("change", async (event) => {
    const target = event.target as HTMLSelectElement;

    if (!target.classList.contains("order-status-select")) {
      return;
    }

    const orderId = Number(target.dataset.id);
    const status = target.value as OrderStatus;

    if (!Number.isInteger(orderId)) {
      return;
    }

    updateOrderStatus(orderId, status);
    onChange();

    const updatedOrder = getOrders().find((order) => order.id === orderId);
    const modal = document.querySelector<HTMLElement>("#admin-order-modal");

    if (updatedOrder && modal && !modal.classList.contains("hidden")) {
      const modalBody = document.querySelector<HTMLElement>("#admin-order-modal-body");
      if (modalBody) {
        modalBody.innerHTML = renderOrderDetail(updatedOrder);
      }
    }

    await Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: `El pedido #${orderId} ahora está en estado ${formatOrderStatus(status)}.`,
      confirmButtonText: "Aceptar",
    });
  });

  initOrderModalEvents();
}

export function renderOrdersTable(): void {
  const body = document.querySelector<HTMLElement>("#orders-table-body");
  const filter = document.querySelector<HTMLSelectElement>("#order-status-filter");
  const pagination = document.querySelector<HTMLElement>("#admin-orders-pagination");

  if (!body) {
    return;
  }

  const selectedStatus = filter?.value || "TODOS";
  const orders = getOrders().filter((order) =>
    selectedStatus === "TODOS" || order.status === (selectedStatus as OrderStatus)
  );

  if (orders.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="7">No hay pedidos para el estado seleccionado.</td>
      </tr>
    `;

    if (pagination) {
      pagination.innerHTML = "";
    }

    return;
  }

  const totalPages = Math.ceil(orders.length / ADMIN_ORDERS_PER_PAGE);
  currentAdminOrdersPage = Math.min(currentAdminOrdersPage, totalPages);

  const startIndex = (currentAdminOrdersPage - 1) * ADMIN_ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ADMIN_ORDERS_PER_PAGE);

  body.innerHTML = paginatedOrders.map(renderOrderRow).join("");

  renderAdminOrdersPagination(totalPages, pagination);
}

function renderOrderRow(order: Order): string {
  return `
    <tr class="admin-order-row">
      <td>#${order.id}</td>
      <td>${escapeHtml(order.userEmail)}</td>
      <td>${formatDate(order.date)}</td>
      <td>
        ${renderStatusSelect(order)}
      </td>
      <td>${formatPaymentMethod(order.paymentMethod)}</td>
      <td>${formatPrice(order.total)}</td>
      <td>
        <button 
          type="button" 
          class="table-btn view-order-btn" 
          data-id="${order.id}"
          title="Ver detalle del pedido"
        >
          <i class="fa-solid fa-eye"></i>
        </button>
      </td>
    </tr>
  `;
}

function openOrderDetailModal(order: Order): void {
  const modal = document.querySelector<HTMLElement>("#admin-order-modal");
  const modalBody = document.querySelector<HTMLElement>("#admin-order-modal-body");

  if (!modal || !modalBody) {
    return;
  }

  modalBody.innerHTML = renderOrderDetail(order);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function renderOrderDetail(order: Order): string {
  return `
    <div class="order-detail-header">
      <div>
        <span class="section-label">Detalle del pedido</span>
        <h3>Pedido #${order.id}</h3>
        <p>${formatDate(order.date)}</p>
      </div>

      <span class="status-badge ${getStatusClass(order.status)}">
        ${formatOrderStatus(order.status)}
      </span>
    </div>

    <section class="order-detail-block">
      <h4>Cliente</h4>
      <p><strong>Email:</strong> ${escapeHtml(order.userEmail)}</p>
      <p><strong>Entrega:</strong> A coordinar con el local</p>
      <p><strong>Forma de pago:</strong> ${formatPaymentMethod(order.paymentMethod)}</p>
    </section>

    <section class="order-detail-block">
      <h4>Estado del pedido</h4>
       ${formatOrderStatus(order.status)}
    </section>

    <section class="order-detail-block">
      <h4>Productos</h4>
      ${order.items.map(renderOrderItem).join("")}
    </section>

    <section class="order-detail-block">
      <h4>Total</h4>
      <div class="cost-row">
        <span>Total del pedido</span>
        <strong>${formatPrice(order.total)}</strong>
      </div>
    </section>
  `;
}

function renderOrderItem(item: Order["items"][number]): string {
  return `
    <div class="modal-product">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p>Cantidad: ${item.quantity} x ${formatPrice(item.price)}</p>
      </div>

      <strong class="modal-price">${formatPrice(item.subtotal)}</strong>
    </div>
  `;
}

function renderStatusSelect(order: Order): string {
  return `
    <select class="order-status-select" data-id="${order.id}">
      ${getOrderStatuses()
        .map(
          (status) => `
            <option value="${status}" ${status === order.status ? "selected" : ""}>
              ${formatOrderStatus(status)}
            </option>
          `
        )
        .join("")}
    </select>
  `;
}

function renderAdminOrdersPagination(totalPages: number, container: HTMLElement | null): void {
  if (!container || totalPages <= 1) {
    if (container) {
      container.innerHTML = "";
    }

    return;
  }

  container.innerHTML = `
    <button type="button" id="prev-admin-orders-page" ${currentAdminOrdersPage === 1 ? "disabled" : ""}>
      Anterior
    </button>

    <span>Página ${currentAdminOrdersPage} de ${totalPages}</span>

    <button type="button" id="next-admin-orders-page" ${currentAdminOrdersPage === totalPages ? "disabled" : ""}>
      Siguiente
    </button>
  `;

  container.querySelector<HTMLButtonElement>("#prev-admin-orders-page")?.addEventListener("click", () => {
    currentAdminOrdersPage = Math.max(1, currentAdminOrdersPage - 1);
    renderOrdersTable();
  });

  container.querySelector<HTMLButtonElement>("#next-admin-orders-page")?.addEventListener("click", () => {
    currentAdminOrdersPage = Math.min(totalPages, currentAdminOrdersPage + 1);
    renderOrdersTable();
  });
}

function initOrderModalEvents(): void {
  const modal = document.querySelector<HTMLElement>("#admin-order-modal");
  const closeButton = document.querySelector<HTMLButtonElement>("#close-admin-order-modal");

  closeButton?.addEventListener("click", closeOrderDetailModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeOrderDetailModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOrderDetailModal();
    }
  });
}

function closeOrderDetailModal(): void {
  const modal = document.querySelector<HTMLElement>("#admin-order-modal");

  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}

function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  return labels[status];
}

function getStatusClass(status: OrderStatus): string {
  return `status-${status.toLowerCase().replace("_", "-")}`;
}