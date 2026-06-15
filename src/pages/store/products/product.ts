import Swal from "sweetalert2";
import { getProductById } from "../../../data/data";
import type { Product } from "../../../types/products";
import { isLoggedIn } from "../../../utils/auth";
import { initNavbar } from "../../../sections/navBar/navBar";
import { addToCart, getCartItemsCount } from "../../../utils/cart";

let selectedQuantity = 1;

function initProductPage(): void {
  initNavbar();
  updateCartCount();

  if (!isLoggedIn()) {
    window.location.href = "/src/pages/auth/login/login.html";
    return;
  }

  const productId = getProductIdFromUrl();

  if (productId === null) {
    renderError("ID de producto invalido.");
    return;
  }

  const product = getProductById(productId);

  if (!product) {
    renderError("Producto no encontrado.");
    return;
  }

  selectedQuantity = 1;

  renderProduct(product);
  initQuantityControls(product);
  initAddButton(product);
}

function getProductIdFromUrl(): number | null {
  const idParam = new URLSearchParams(window.location.search).get("id");
  const parsedId = Number(idParam);

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function renderProduct(product: Product): void {
  const title = document.querySelector<HTMLElement>("#product-title");
  const image = document.querySelector<HTMLImageElement>("#product-image");
  const description = document.querySelector<HTMLElement>("#product-description");
  const price = document.querySelector<HTMLElement>("#product-price");
  const category = document.querySelector<HTMLElement>("#product-category");
  const stock = document.querySelector<HTMLElement>("#product-stock");
  const addButton = document.querySelector<HTMLButtonElement>("#add-product-btn");

  const categoryName = product.categories[0]?.name ?? "Sin categoria";

  if (title) title.textContent = product.name;

  if (image) {
    image.src = product.image;
    image.alt = product.name;
  }

  if (description) description.textContent = product.description;
  if (price) price.textContent = `$ ${product.price}`;
  if (category) category.textContent = categoryName;
  if (stock) stock.textContent = product.available && product.stock > 0 ? String(product.stock) : "Sin stock";

  if (addButton && (!product.available || product.stock <= 0)) {
    addButton.disabled = true;
    addButton.textContent = "No disponible";
  }
}

function initQuantityControls(product: Product): void {
  const minusButton = document.querySelector<HTMLButtonElement>("#minus-btn");
  const plusButton = document.querySelector<HTMLButtonElement>("#plus-btn");
  const quantityValue = document.querySelector<HTMLElement>("#quantity-value");

  const maxQuantity = product.available ? product.stock : 0;

  function renderQuantity(): void {
    if (quantityValue) quantityValue.textContent = String(selectedQuantity);
    if (minusButton) minusButton.disabled = selectedQuantity <= 1;
    if (plusButton) plusButton.disabled = selectedQuantity >= maxQuantity || maxQuantity === 0;
  }

  if (!product.available || product.stock <= 0) {
    selectedQuantity = 0;
    renderQuantity();
    return;
  }

  minusButton?.addEventListener("click", () => {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    renderQuantity();
  });

  plusButton?.addEventListener("click", () => {
    selectedQuantity = Math.min(maxQuantity, selectedQuantity + 1);
    renderQuantity();
  });

  renderQuantity();
}

function initAddButton(product: Product): void {
  const addButton = document.querySelector<HTMLButtonElement>("#add-product-btn");
  if (!addButton) return;

  addButton.addEventListener("click", async () => {
    if (!product.available || product.stock <= 0) {
      await Swal.fire({
        icon: "error",
        title: "Producto no disponible",
        text: "No se puede agregar un producto sin stock.",
      });
      return;
    }

    const result = addToCart(product, selectedQuantity);
    if (!result.ok) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo agregar",
        text: result.message,
      });
      return;
    }

    updateCartCount();

    await Swal.fire({
      icon: "success",
      title: "Agregado al carrito",
      text: `${product.name} se agrego correctamente.`,
      confirmButtonText: "Aceptar",
    });
  });
}

function updateCartCount(): void {
  const cartCount = document.querySelector<HTMLElement>("#cart-count");
  if (cartCount) {
    cartCount.textContent = String(getCartItemsCount());
  }
}

function renderError(message: string): void {
  const container = document.querySelector<HTMLElement>("#product-detail-container");
  if (!container) return;

  container.innerHTML = `
    <div class="product-error">
      <h2>${message}</h2>
      <a href="/src/pages/store/home/home.html" class="back-link">Volver a productos</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", initProductPage);
