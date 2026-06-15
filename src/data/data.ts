import categoriesJson from "./categorias.json";
import ordersJson from "./pedidos.json";
import productsJson from "./productos.json";
import usersJson from "./usuarios.json";
import type { Category } from "../types/category";
import type { IUser } from "../types/IUser";
import type { Order } from "../types/order";
import type { Product } from "../types/products";

const CATEGORIES_KEY = "food-store-categories";
const PRODUCTS_KEY = "food-store-products";

const initialCategories = categoriesJson as Category[];
const initialProducts = productsJson as Omit<Product, "categories">[];
const LEGACY_TIMESTAMP_ID = 100000;

type StoredProduct = Omit<Product, "categories">;

function parseLocalData<T>(key: string, fallback: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) return fallback;

  try {
    return JSON.parse(data) as T[];
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveLocalData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getNextId(items: Array<{ id: number }>): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

export function getAllCategories(): Category[] {
  migrateCatalogIds();
  return parseLocalData<Category>(CATEGORIES_KEY, initialCategories);
}

export function getCategories(): Category[] {
  return getAllCategories().filter((category) => !category.deleted);
}

export function saveCategory(category: Omit<Category, "id" | "createdAt" | "deleted"> & { id?: number }): Category {
  const categories = getAllCategories();
  const existingCategory = category.id
    ? categories.find((item) => item.id === category.id)
    : undefined;

  const savedCategory: Category = {
    id: existingCategory?.id ?? getNextId(categories),
    name: category.name.trim(),
    description: category.description.trim(),
    createdAt: existingCategory?.createdAt ?? new Date().toISOString(),
    deleted: false,
  };

  const nextCategories = existingCategory
    ? categories.map((item) => (item.id === savedCategory.id ? savedCategory : item))
    : [...categories, savedCategory];

  saveLocalData(CATEGORIES_KEY, nextCategories);
  return savedCategory;
}

export function deleteCategory(categoryId: number): void {
  const categories = getAllCategories().map((category) =>
    category.id === categoryId ? { ...category, deleted: true } : category
  );

  saveLocalData(CATEGORIES_KEY, categories);
}

function getAllStoredProducts(): StoredProduct[] {
  migrateCatalogIds();
  return parseLocalData<StoredProduct>(PRODUCTS_KEY, initialProducts);
}

function migrateCatalogIds(): void {
  const categories = parseLocalData<Category>(CATEGORIES_KEY, initialCategories);
  const productsFromStorage = parseLocalData<StoredProduct>(PRODUCTS_KEY, initialProducts);
  const hasLegacyCategoryId = categories.some((category) => category.id >= LEGACY_TIMESTAMP_ID);
  const hasLegacyProductId = productsFromStorage.some((product) => product.id >= LEGACY_TIMESTAMP_ID);

  if (!hasLegacyCategoryId && !hasLegacyProductId) return;

  const categoryIdMap = new Map<number, number>();
  const normalizedCategories = categories.map((category, index) => {
    const nextId = index + 1;
    categoryIdMap.set(category.id, nextId);
    return { ...category, id: nextId };
  });

  const normalizedProducts = productsFromStorage.map((product, index) => ({
    ...product,
    id: index + 1,
    categoryId: categoryIdMap.get(product.categoryId) ?? product.categoryId,
  }));

  saveLocalData(CATEGORIES_KEY, normalizedCategories);
  saveLocalData(PRODUCTS_KEY, normalizedProducts);
}

function withCategories(product: StoredProduct): Product {
  const categories = getCategories();
  return {
    ...product,
    categories: categories.filter((category) => category.id === product.categoryId),
  };
}

export const products: Product[] = getAllStoredProducts().map(withCategories);

export function getProducts(): Product[] {
  return getAllStoredProducts()
    .filter((product) => !product.deleted)
    .map(withCategories);
}

export function getProductById(productId: number): Product | undefined {
  return getProducts().find((product) => product.id === productId);
}

export function saveProduct(
  product: Omit<StoredProduct, "id" | "createdAt" | "deleted"> & { id?: number }
): Product {
  const productsFromStorage = getAllStoredProducts();
  const existingProduct = product.id
    ? productsFromStorage.find((item) => item.id === product.id)
    : undefined;

  const savedProduct: StoredProduct = {
    id: existingProduct?.id ?? getNextId(productsFromStorage),
    name: product.name.trim(),
    price: product.price,
    description: product.description.trim(),
    stock: product.stock,
    image: product.image.trim(),
    available: product.available,
    categoryId: product.categoryId,
    createdAt: existingProduct?.createdAt ?? new Date().toISOString(),
    deleted: false,
  };

  const nextProducts = existingProduct
    ? productsFromStorage.map((item) => (item.id === savedProduct.id ? savedProduct : item))
    : [...productsFromStorage, savedProduct];

  saveLocalData(PRODUCTS_KEY, nextProducts);
  return withCategories(savedProduct);
}

export function deleteProduct(productId: number): void {
  const nextProducts = getAllStoredProducts().map((product) =>
    product.id === productId ? { ...product, deleted: true } : product
  );

  saveLocalData(PRODUCTS_KEY, nextProducts);
}

export function toggleProductAvailability(productId: number): Product | undefined {
  let updatedProduct: StoredProduct | undefined;
  const nextProducts = getAllStoredProducts().map((product) => {
    if (product.id !== productId) return product;

    updatedProduct = {
      ...product,
      available: !product.available,
    };

    return updatedProduct;
  });

  saveLocalData(PRODUCTS_KEY, nextProducts);
  return updatedProduct ? withCategories(updatedProduct) : undefined;
}

export function decreaseProductsStock(
  items: Array<{ productId: number; quantity: number }>
): { ok: boolean; message: string } {
  const productsFromStorage = getAllStoredProducts();

  for (const item of items) {
    const product = productsFromStorage.find((storedProduct) => storedProduct.id === item.productId);

    if (!product || product.deleted || !product.available) {
      return {
        ok: false,
        message: `El producto ${item.productId} ya no esta disponible.`,
      };
    }

    if (item.quantity > product.stock) {
      return {
        ok: false,
        message: `No hay stock suficiente de ${product.name}. Stock disponible: ${product.stock}.`,
      };
    }
  }

  const nextProducts = productsFromStorage.map((product) => {
    const item = items.find((cartItem) => cartItem.productId === product.id);
    if (!item) return product;

    const nextStock = product.stock - item.quantity;

    return {
      ...product,
      stock: nextStock,
      available: nextStock > 0 ? product.available : false,
    };
  });

  saveLocalData(PRODUCTS_KEY, nextProducts);

  return {
    ok: true,
    message: "Stock actualizado correctamente.",
  };
}

export function getInitialUsers(): IUser[] {
  return usersJson as IUser[];
}

export function getInitialOrders(): Order[] {
  return ordersJson as Order[];
}
