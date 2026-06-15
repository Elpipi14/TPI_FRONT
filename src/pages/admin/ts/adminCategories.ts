import Swal from "sweetalert2";
import {
  deleteCategory,
  getCategories,
  getProducts,
  saveCategory,
} from "../../../data/data";
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  normalizeSpaces,
} from "../../../utils/validators";
import {
  escapeHtml,
  formatDate,
  getEditingId,
  getInputValue,
  setInputValue,
  setText,
  showError,
} from "./adminHelpers";

export function initCategoryForm(onChange: () => void): void {
  const form = document.querySelector<HTMLFormElement>("#category-form");

  if (!form) {
    return;
  }

  initCategoryModalEvents();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = getEditingId(form);
    const name = normalizeSpaces(getInputValue("#category-name"));
    const description = normalizeSpaces(getInputValue("#category-description"));

    if (!name || !description) {
      await showError("Completá nombre y descripción de la categoría.");
      return;
    }

    if (
      name.length > NAME_MAX_LENGTH ||
      description.length > DESCRIPTION_MAX_LENGTH
    ) {
      await showError("La categoría supera la longitud máxima permitida.");
      return;
    }

    if (categoryNameExists(name, id)) {
      await showError("Ya existe una categoría activa con ese nombre.");
      return;
    }

    saveCategory({ id, name, description });

    resetCategoryForm();
    closeCategoryModal();
    onChange();

    await Swal.fire({
      icon: "success",
      title: "Categoría guardada",
      text: "La categoría se actualizó correctamente.",
      confirmButtonText: "Aceptar",
    });
  });
}

export function initCategoryActions(onChange: () => void): void {
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const editButton = target.closest<HTMLButtonElement>(".edit-category-btn");
    const deleteButton = target.closest<HTMLButtonElement>(
      ".delete-category-btn",
    );

    if (editButton) {
      const id = Number(editButton.dataset.id);

      if (Number.isInteger(id)) {
        editCategory(id);
      }

      return;
    }

    if (deleteButton) {
      const id = Number(deleteButton.dataset.id);

      if (Number.isInteger(id)) {
        void removeCategory(id, onChange);
      }
    }
  });
}

export function renderCategoryOptions(): void {
  const select = document.querySelector<HTMLSelectElement>("#product-category");

  if (!select) {
    return;
  }

  select.innerHTML = getCategories()
    .map(
      (category) =>
        `<option value="${category.id}">${escapeHtml(category.name)}</option>`,
    )
    .join("");
}

export function renderCategoriesTable(): void {
  const body = document.querySelector<HTMLElement>("#categories-table-body");

  if (!body) {
    return;
  }

  body.innerHTML = getCategories()
    .map(
      (category) => `
        <tr>
          <td>${category.id}</td>
          <td>${escapeHtml(category.name)}</td>
          <td>${escapeHtml(category.description)}</td>
          <td>${formatDate(category.createdAt)}</td>
          <td>
            <div class="table-actions">
              <button
                type="button"
                class="table-btn edit-category-btn"
                data-id="${category.id}"
              >
                Editar
              </button>

              <button
                type="button"
                class="table-btn danger delete-category-btn"
                data-id="${category.id}"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function initCategoryModalEvents(): void {
  const openButton = document.querySelector<HTMLButtonElement>(
    "#open-category-modal-btn",
  );
  const closeButton = document.querySelector<HTMLButtonElement>(
    "#close-category-modal",
  );
  const cancelButton = document.querySelector<HTMLButtonElement>(
    "#cancel-category-edit",
  );
  const modal = document.querySelector<HTMLElement>("#category-modal");

  openButton?.addEventListener("click", () => {
    resetCategoryForm();
    openCategoryModal();
  });

  closeButton?.addEventListener("click", () => {
    resetCategoryForm();
    closeCategoryModal();
  });

  cancelButton?.addEventListener("click", () => {
    resetCategoryForm();
    closeCategoryModal();
  });

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      resetCategoryForm();
      closeCategoryModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resetCategoryForm();
      closeCategoryModal();
    }
  });
}

function editCategory(categoryId: number): void {
  const category = getCategories().find((item) => item.id === categoryId);
  const form = document.querySelector<HTMLFormElement>("#category-form");

  if (!category || !form) {
    return;
  }

  form.dataset.editingId = String(category.id);

  setInputValue("#category-name", category.name);
  setInputValue("#category-description", category.description);
  setText("#category-form-title", "Editar categoría");
  openCategoryModal();
}

async function removeCategory(
  categoryId: number,
  onChange: () => void,
): Promise<void> {
  const productsUsingCategory = getProducts().some(
    (product) => product.categoryId === categoryId,
  );

  if (productsUsingCategory) {
    await showError(
      "No se puede eliminar una categoría que tiene productos asociados.",
    );
    return;
  }

  const result = await Swal.fire({
    title: "Eliminar categoría",
    text: "La categoría dejará de verse en el inicio y en el panel.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) {
    return;
  }

  deleteCategory(categoryId);
  onChange();
}

function resetCategoryForm(): void {
  const form = document.querySelector<HTMLFormElement>("#category-form");

  form?.reset();

  if (form) {
    delete form.dataset.editingId;
  }

  setText("#category-form-title", "Nueva categoría");
}

function categoryNameExists(name: string, currentId?: number): boolean {
  const normalizedName = normalizeSpaces(name).toLowerCase();

  return getCategories().some(
    (category) =>
      category.name.trim().toLowerCase() === normalizedName &&
      category.id !== currentId,
  );
}

function openCategoryModal(): void {
  const modal = document.querySelector<HTMLElement>("#category-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCategoryModal(): void {
  const modal = document.querySelector<HTMLElement>("#category-modal");

  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}
