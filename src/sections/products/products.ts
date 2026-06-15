import Swal from "sweetalert2";
import { getProducts } from "../../data/data";
import type { Product } from "../../types/products";
import { getSelectedCategory } from "../../utils/store";
import { isLoggedIn } from "../../utils/auth";
import { addToCart, getCartItemsCount } from "../../utils/cart";

export function initProducts(): void {
  initSearch();
  renderProducts();
  updateCartCount();
}

export function renderProducts(): void {
  const container = document.querySelector<HTMLElement>("#container-products");
  const searchInput = document.querySelector<HTMLInputElement>("#search");
  const sortSelect = document.querySelector<HTMLSelectElement>("#sort-products");

  if (!container) return;

  const selectedCategory = getSelectedCategory();
  const searchText = searchInput?.value.trim().toLowerCase() ?? "";

  const filteredProducts = getProducts().filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" ||
      product.categories.some((category) => category.name === selectedCategory);

    const matchesSearch = product.name.toLowerCase().includes(searchText);

    return !product.deleted && matchesCategory && matchesSearch;
  });

  filteredProducts.sort((a, b) => {
    switch (sortSelect?.value) {
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = `<p class="no-products">No se encontraron productos.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredProducts.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });

  container.replaceChildren(fragment);
}

function createProductCard(product: Product): HTMLDivElement {
  const card = document.createElement("div");
  card.classList.add("card");

  const categoryName = product.categories[0]?.name ?? "Sin categoria";
  const canBuy = product.available && product.stock > 0;
  const stockText = canBuy ? `Stock: ${product.stock}` : "Sin stock";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="card-body">
      <span class="product-category-label">${categoryName}</span>
      <h2>${product.name}</h2>
      <h3>${product.description}</h3>
      <p><strong>$ ${product.price}</strong></p>
      <p>${stockText}</p>

      <div class="card-buttons">
        <button type="button" class="view-btn">Ver</button>
        <button type="button" class="add-btn" ${!canBuy ? "disabled" : ""}>
          ${canBuy ? "Agregar al carrito" : "No disponible"}
        </button>
      </div>
    </div>
  `;

  card.querySelector<HTMLButtonElement>(".view-btn")?.addEventListener("click", () => {
    handleViewProduct(product.id);
  });

  card.querySelector<HTMLButtonElement>(".add-btn")?.addEventListener("click", () => {
    void handleAddToCart(product);
  });

  return card;
}

async function requireLogin(message: string): Promise<boolean> {
  if (isLoggedIn()) return true;

  const result = await Swal.fire({
    title: "Necesitas iniciar sesion",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Iniciar sesion",
    cancelButtonText: "Registrarse",
  });

  if (result.isConfirmed) {
    window.location.href = "/src/pages/auth/login/login.html";
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    window.location.href = "/src/pages/auth/register/register.html";
  }

  return false;
}

async function handleViewProduct(productId: number): Promise<void> {
  const canContinue = await requireLogin(
    "Inicia sesion o registrate para ver el detalle del producto."
  );

  if (!canContinue) return;

  window.location.href = `/src/pages/store/products/product.html?id=${productId}`;
}

async function handleAddToCart(product: Product): Promise<void> {
  if (!product.available || product.stock <= 0) {
    await Swal.fire({
      title: "Producto no disponible",
      text: "No se puede agregar un producto sin stock.",
      icon: "error",
    });
    return;
  }

  const canContinue = await requireLogin(
    "Inicia sesion o registrate antes de agregar productos al carrito."
  );

  if (!canContinue) return;

  const result = addToCart(product);
  if (!result.ok) {
    await Swal.fire({
      title: "No se pudo agregar",
      text: result.message,
      icon: "error",
    });
    return;
  }

  updateCartCount();

  await Swal.fire({
    title: "Agregado al carrito",
    text: `${product.name} se agrego correctamente.`,
    icon: "success",
    confirmButtonText: "Aceptar",
  });
}

function initSearch(): void {
  const form = document.querySelector<HTMLFormElement>("#search-form");
  const searchInput = document.querySelector<HTMLInputElement>("#search");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderProducts();
  });

  searchInput?.addEventListener("input", renderProducts);
  document
    .querySelector<HTMLSelectElement>("#sort-products")
    ?.addEventListener("change", renderProducts);
}

function updateCartCount(): void {
  const cartCount = document.querySelector<HTMLElement>("#cart-count");
  if (cartCount) {
    cartCount.textContent = String(getCartItemsCount());
  }
}
