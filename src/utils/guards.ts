import { getCurrentUser } from "./auth";

export function protectRoutes(): void {
  const path = window.location.pathname;
  const user = getCurrentUser();

  const isAdminRoute = path.includes("/src/pages/admin/");
  const isClientPanelRoute = path.includes("/src/pages/client/");
  const isStoreRoute = path.includes("/src/pages/store/");
  const isAuthRoute =
    path.includes("/src/pages/auth/login/") ||
    path.includes("/src/pages/auth/register/");

  if (!user) {
    if (isAdminRoute || isClientPanelRoute || isStoreRoute) {
      window.location.href = "/src/pages/auth/login/login.html";
    }
    return;
  }

  if (isAuthRoute) {
    window.location.href =
      user.role === "ADMIN" ? "/src/pages/admin/admin.html" : "/src/pages/store/home/home.html";
    return;
  }

  if (isAdminRoute && user.role !== "ADMIN") {
    window.location.href = "/src/pages/store/home/home.html";
    return;
  }

  if (isClientPanelRoute && user.role !== "USUARIO") {
    window.location.href = "/src/pages/admin/admin.html";
  }
}
