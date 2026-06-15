import { getCategories, getProducts } from "../../../data/data";
import { getOrders } from "../../../utils/orders";
import type { Order, OrderStatus } from "../../../types/order";
import { formatPrice } from "./adminHelpers";

export function renderDashboard(): void {
  const statsContainer = document.querySelector<HTMLElement>("#dashboard-stats");
  const summaryContainer = document.querySelector<HTMLElement>("#dashboard-summary");

  if (!statsContainer || !summaryContainer) {
    return;
  }

  const categories = getCategories();
  const products = getProducts();
  const orders = getOrders();

  const activeProducts = products.filter((product) => product.available && product.stock > 0);
  const inactiveProducts = products.filter((product) => !product.available || product.stock <= 0);

  const pendingOrders = getOrdersByStatus(orders, "PENDIENTE");
  const inPreparationOrders = getOrdersByStatus(orders, "EN_PREPARACION");
  const completedOrders = getOrdersByStatus(orders, "ENTREGADO");
  const cancelledOrders = getOrdersByStatus(orders, "CANCELADO");

  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELADO")
    .reduce((total, order) => total + order.total, 0);

  statsContainer.innerHTML = `
    <article class="stat-card">
      <span>Categorías activas</span>
      <strong>${categories.length}</strong>
    </article>
    <article class="stat-card">
      <span>Productos activos</span>
      <strong>${activeProducts.length}</strong>
    </article>
    <article class="stat-card">
      <span>Productos inactivos</span>
      <strong>${inactiveProducts.length}</strong>
    </article>
    <article class="stat-card">
      <span>Ingresos totales</span>
      <strong>${formatPrice(totalRevenue)}</strong>
    </article>
  `;

  summaryContainer.innerHTML = `
    <article class="summary-card">
      <h2>Resumen rápido</h2>
      <div class="summary-grid">
        ${renderSummaryItem("Pendientes", pendingOrders.length)}
        ${renderSummaryItem("En preparación", inPreparationOrders.length)}
        ${renderSummaryItem("Completados", completedOrders.length)}
        ${renderSummaryItem("Cancelados", cancelledOrders.length)}
      </div>
    </article>
  `;
}

function renderSummaryItem(label: string, value: number): string {
  return `
    <div class="summary-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function getOrdersByStatus(orders: Order[], status: OrderStatus): Order[] {
  return orders.filter((order) => order.status === status);
}