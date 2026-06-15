import { initNavbar } from "../../../sections/navBar/navBar";
import type { IUser } from "../../../types/IUser";
import type { Order, OrderStatus } from "../../../types/order";
import { getCurrentUser } from "../../../utils/auth";
import { getCartItemsCount } from "../../../utils/cart";
import { protectRoutes } from "../../../utils/guards";
import { getOrdersByUser } from "../../../utils/orders";

import { renderEmptyOrders, renderOrderCard } from "./ts/ordersCards";
import { initModalEvents, openOrderModal } from "./ts/ordersModal";
import { renderPagination } from "./ts/ordersPagination";

const ORDERS_PER_PAGE = 4;

let currentPage = 1;
let currentFilter: OrderStatus | "TODOS" = "TODOS";
let currentUser: IUser | null = null;
let userOrders: Order[] = [];

function initOrdersPage(): void {
  protectRoutes();
  initNavbar();

  currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "/src/pages/auth/login/login.html";
    return;
  }

  userOrders = getOrdersByUser(currentUser.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  updateCartCount();
  initStatusFilter();
  initModalEvents();
  renderOrders();
}

function initStatusFilter(): void {
  const filterSelect = document.querySelector<HTMLSelectElement>("#orders-status-filter");

  if (!filterSelect) {
    return;
  }

  filterSelect.addEventListener("change", () => {
    currentFilter = filterSelect.value as OrderStatus | "TODOS";
    currentPage = 1;
    renderOrders();
  });
}

function getFilteredOrders(): Order[] {
  if (currentFilter === "TODOS") {
    return userOrders;
  }

  return userOrders.filter((order) => order.status === currentFilter);
}

function renderOrders(): void {
  const container = document.querySelector<HTMLElement>("#orders-container");
  const pagination = document.querySelector<HTMLElement>("#orders-pagination");

  if (!container || !pagination) {
    return;
  }

  const filteredOrders = getFilteredOrders();

  if (filteredOrders.length === 0) {
    container.innerHTML = renderEmptyOrders();
    pagination.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const ordersToShow = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  container.innerHTML = ordersToShow.map(renderOrderCard).join("");

  initOrderCardEvents();
  renderPagination(totalPages, currentPage, goToPreviousPage, goToNextPage);
}

function initOrderCardEvents(): void {
  const cards = document.querySelectorAll<HTMLButtonElement>(".order-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const orderId = Number(card.dataset.orderId);
      const order = userOrders.find((item) => item.id === orderId);

      if (order && currentUser) {
        openOrderModal(order, currentUser);
      }
    });
  });
}

function goToPreviousPage(): void {
  currentPage = Math.max(1, currentPage - 1);
  renderOrders();
}

function goToNextPage(): void {
  const totalPages = Math.ceil(getFilteredOrders().length / ORDERS_PER_PAGE);

  currentPage = Math.min(totalPages, currentPage + 1);
  renderOrders();
}

function updateCartCount(): void {
  const cartCount = document.querySelector<HTMLElement>("#cart-count");

  if (cartCount) {
    cartCount.textContent = String(getCartItemsCount());
  }
}

document.addEventListener("DOMContentLoaded", initOrdersPage);