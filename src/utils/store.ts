let selectedCategory: string = "Todos";

export function getSelectedCategory(): string {
  return selectedCategory;
}

export function setSelectedCategory(category: string): void {
  selectedCategory = category;
}
