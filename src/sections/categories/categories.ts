import { getCategories } from "../../data/data";
import { getSelectedCategory, setSelectedCategory } from "../../utils/store";
import { renderProducts } from "../products/products";

export function initCategories(): void {
  renderCategories();
}

function renderCategories(): void {
  const container = document.querySelector<HTMLElement>("#container-categories");
  if (!container) return;

  const selectedCategory = getSelectedCategory();

  container.innerHTML = "";

  const categories = ["Todos", ...getCategories().map(c => c.name)];

  categories.forEach((categoryName) => {
    const li = document.createElement("li");
    const button = document.createElement("button");

    button.textContent = categoryName;
    button.classList.add("category-btn");

    if (categoryName === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      setSelectedCategory(categoryName);
      renderCategories();
      renderProducts();
    });

    li.appendChild(button);
    container.appendChild(li);
  });
}
