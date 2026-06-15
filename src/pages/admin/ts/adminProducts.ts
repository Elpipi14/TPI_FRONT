import Swal from "sweetalert2";
import {
  deleteProduct,
  getProducts,
  saveProduct,
  toggleProductAvailability,
} from "../../../data/data";
import {
  DESCRIPTION_MAX_LENGTH,
  isValidHttpUrl,
  NAME_MAX_LENGTH,
  normalizeSpaces,
} from "../../../utils/validators";
import {
  escapeHtml,
  formatPrice,
  getEditingId,
  getInputValue,
  setInputValue,
  setText,
  showError,
} from "./adminHelpers";

export function initProductForm(onChange: () => void): void {
  const form = document.querySelector<HTMLFormElement>("#product-form");

  if (!form) {
    return;
  }

  initProductModalEvents();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = getEditingId(form);
    const name = normalizeSpaces(getInputValue("#product-name"));
    const description = normalizeSpaces(getInputValue("#product-description"));
    const image = getInputValue("#product-image");
    const price = Number(getInputValue("#product-price"));
    const stock = Number(getInputValue("#product-stock"));
    const categoryId = Number(getInputValue("#product-category"));
    const available = Boolean(
      document.querySelector<HTMLInputElement>("#product-available")?.checked
    );

    if (
      !name ||
      !description ||
      !image ||
      !Number.isFinite(price) ||
      !Number.isFinite(stock) ||
      !categoryId
    ) {
      await showError("Completá todos los campos del producto.");
      return;
    }

    if (name.length > NAME_MAX_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
      await showError("El nombre o la descripción del producto superan la longitud máxima permitida.");
      return;
    }

    if (price <= 0 || stock < 0 || !Number.isInteger(stock)) {
      await showError("El precio debe ser mayor a 0 y el stock debe ser un número entero no negativo.");
      return;
    }

    if (!isValidHttpUrl(image)) {
      await showError("La imagen debe ser una URL válida que empiece con http:// o https://.");
      return;
    }

    saveProduct({
      id,
      name,
      description,
      image,
      price,
      stock,
      categoryId,
      available,
    });

    resetProductForm();
    closeProductModal();
    onChange();

    await Swal.fire({
      icon: "success",
      title: "Producto guardado",
      text: "El producto se actualizó correctamente.",
      confirmButtonText: "Aceptar",
    });
  });
}

export function initProductActions(onChange: () => void): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const editButton = target.closest<HTMLButtonElement>(".edit-product-btn");
    const toggleButton = target.closest<HTMLButtonElement>(".toggle-product-btn");
    const deleteButton = target.closest<HTMLButtonElement>(".delete-product-btn");

    if (editButton) {
      const id = Number(editButton.dataset.id);
      if (Number.isInteger(id)) {
        editProduct(id);
      }
      return;
    }

    if (toggleButton) {
      const id = Number(toggleButton.dataset.id);
      if (Number.isInteger(id)) {
        void toggleProduct(id, onChange);
      }
      return;
    }

    if (deleteButton) {
      const id = Number(deleteButton.dataset.id);
      if (Number.isInteger(id)) {
        void removeProduct(id, onChange);
      }
    }
  });
}

export function renderProductsTable(): void {
  const body = document.querySelector<HTMLElement>("#products-table-body");

  if (!body) {
    return;
  }

  body.innerHTML = getProducts()
    .map((product) => {
      const category = product.categories[0]?.name ?? "Sin categoría";
      const isAvailable = product.available && product.stock > 0;
      const availability = isAvailable ? "Disponible" : "No disponible";

      return `
        <tr>
          <td>${product.id}</td>

          <td>
            <img
              src="${escapeHtml(product.image)}"
              alt="${escapeHtml(product.name)}"
              width="70"
            />
          </td>

          <td>${escapeHtml(product.name)}</td>
          <td>${escapeHtml(category)}</td>
          <td>${formatPrice(product.price)}</td>
          <td>${product.stock}</td>

          <td>
            <span class="status-badge ${isAvailable ? "available" : "unavailable"}">
              ${availability}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="table-btn edit-product-btn"
              data-id="${product.id}"
            >
              Editar
            </button>

            <button
              type="button"
              class="table-btn toggle-product-btn"
              data-id="${product.id}"
            >
              ${product.available ? "Desactivar" : "Activar"}
            </button>

            <button
              type="button"
              class="table-btn danger delete-product-btn"
              data-id="${product.id}"
            >
              Eliminar
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function initProductModalEvents(): void {
  const openButton = document.querySelector<HTMLButtonElement>("#open-product-modal-btn");
  const closeButton = document.querySelector<HTMLButtonElement>("#close-product-modal");
  const cancelButton = document.querySelector<HTMLButtonElement>("#cancel-product-edit");
  const modal = document.querySelector<HTMLElement>("#product-modal");

  openButton?.addEventListener("click", () => {
    resetProductForm();
    openProductModal();
  });

  closeButton?.addEventListener("click", () => {
    resetProductForm();
    closeProductModal();
  });

  cancelButton?.addEventListener("click", () => {
    resetProductForm();
    closeProductModal();
  });

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      resetProductForm();
      closeProductModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resetProductForm();
      closeProductModal();
    }
  });
}

function editProduct(productId: number): void {
  const product = getProducts().find((item) => item.id === productId);
  const form = document.querySelector<HTMLFormElement>("#product-form");

  if (!product || !form) {
    return;
  }

  form.dataset.editingId = String(product.id);

  setInputValue("#product-name", product.name);
  setInputValue("#product-description", product.description);
  setInputValue("#product-image", product.image);
  setInputValue("#product-price", String(product.price));
  setInputValue("#product-stock", String(product.stock));
  setInputValue("#product-category", String(product.categoryId));

  const availableInput = document.querySelector<HTMLInputElement>("#product-available");

  if (availableInput) {
    availableInput.checked = product.available;
  }

  setText("#product-form-title", "Editar producto");
  openProductModal();
}

async function removeProduct(productId: number, onChange: () => void): Promise<void> {
  const result = await Swal.fire({
    title: "Eliminar producto",
    text: "El producto dejará de verse en el inicio.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) {
    return;
  }

  deleteProduct(productId);
  onChange();
}

async function toggleProduct(productId: number, onChange: () => void): Promise<void> {
  const product = toggleProductAvailability(productId);

  if (!product) {
    return;
  }

  onChange();

  await Swal.fire({
    icon: "success",
    title: "Disponibilidad actualizada",
    text: `${product.name} ahora está ${product.available ? "disponible" : "no disponible"}.`,
    confirmButtonText: "Aceptar",
  });
}

function resetProductForm(): void {
  const form = document.querySelector<HTMLFormElement>("#product-form");

  form?.reset();

  if (form) {
    delete form.dataset.editingId;
  }

  const availableInput = document.querySelector<HTMLInputElement>("#product-available");

  if (availableInput) {
    availableInput.checked = true;
  }

  setText("#product-form-title", "Nuevo producto");
}

function openProductModal(): void {
  const modal = document.querySelector<HTMLElement>("#product-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeProductModal(): void {
  const modal = document.querySelector<HTMLElement>("#product-modal");

  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}

