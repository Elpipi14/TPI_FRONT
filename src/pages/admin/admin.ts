import { initNavbar } from "../../sections/navBar/navBar";
import { protectRoutes } from "../../utils/guards";

import { renderDashboard } from "./ts/adminDashboard";
import {
  initCategoryActions,
  initCategoryForm,
  renderCategoriesTable,
  renderCategoryOptions,
} from "./ts/adminCategories";
import {
  initProductActions,
  initProductForm,
  renderProductsTable,
} from "./ts/adminProducts";
import {
  initOrderActions,
  initOrderFilter,
  renderOrdersTable,
} from "./ts/adminOrders";
import { initLogoutButton } from "./ts/adminHelpers";

function initAdminPage(): void {
  protectRoutes();
  initNavbar();

  initCategoryForm(renderAdminPage);
  initCategoryActions(renderAdminPage);

  initProductForm(renderAdminPage);
  initProductActions(renderAdminPage);

  initOrderFilter();
  initOrderActions(renderAdminPage);

  initLogoutButton();

  renderAdminPage();
}

function renderAdminPage(): void {
  renderDashboard();
  renderCategoryOptions();
  renderCategoriesTable();
  renderProductsTable();
  renderOrdersTable();
}

document.addEventListener("DOMContentLoaded", initAdminPage);