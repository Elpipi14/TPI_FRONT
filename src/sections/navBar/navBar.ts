import { getCurrentUser, logout } from "../../utils/auth";

export function initNavbar(): void {
  const userLink = document.querySelector<HTMLAnchorElement>("#user-link");
  const dropdown = document.querySelector<HTMLElement>("#user-dropdown");
  const profileLink = document.querySelector<HTMLAnchorElement>("#profile-link");
  const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");
  const userMenuContainer = document.querySelector<HTMLElement>("#user-menu-container");
  const adminNavItem = document.querySelector<HTMLElement>("#admin-nav-item");

  if (!userLink || !dropdown || !profileLink || !logoutButton || !userMenuContainer) return;

  const currentUser = getCurrentUser();

  if (!currentUser) {
    dropdown.classList.add("hidden");
    userLink.href = "/src/pages/auth/login/login.html";
    syncOrdersNavItem(false, userMenuContainer);

    if (adminNavItem) {
      adminNavItem.classList.add("hidden");
    }

    return;
  }

  userLink.href = "#";

  if (currentUser.role === "ADMIN") {
    profileLink.href = "/src/pages/admin/admin.html";
    syncOrdersNavItem(false, userMenuContainer);

    if (adminNavItem) {
      adminNavItem.classList.remove("hidden");
    }
  } else {
    profileLink.href = "/src/pages/client/user.html";
    syncOrdersNavItem(true, userMenuContainer);

    if (adminNavItem) {
      adminNavItem.classList.add("hidden");
    }
  }

  userLink.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("hidden");
  });

  logoutButton.addEventListener("click", () => {
    logout();
    window.location.href = "/src/pages/auth/login/login.html";
  });

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!userMenuContainer.contains(target)) {
      dropdown.classList.add("hidden");
    }
  });
}

function syncOrdersNavItem(show: boolean, userMenuContainer: HTMLElement): void {
  const existingOrdersItem = document.querySelector<HTMLElement>("#orders-nav-item");

  if (!show) {
    existingOrdersItem?.remove();
    return;
  }

  if (existingOrdersItem) return;

  const ordersItem = document.createElement("li");
  ordersItem.id = "orders-nav-item";
  ordersItem.innerHTML = `<a href="/src/pages/client/orders/orders.html">Mis pedidos</a>`;

  userMenuContainer.parentElement?.insertBefore(ordersItem, userMenuContainer);
}
