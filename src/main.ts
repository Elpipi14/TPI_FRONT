import "./style.css";
import { protectRoutes } from "./utils/guards";
import { initNavbar } from "./sections/navBar/navBar";
import { initCategories } from "./sections/categories/categories";
import { initProducts } from "./sections/products/products";

function initApp(): void {
  protectRoutes();
  initNavbar();
  initCategories();
  initProducts();
}

document.addEventListener("DOMContentLoaded", initApp);