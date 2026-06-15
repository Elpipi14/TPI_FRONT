import type { Category } from "./category";

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  available: boolean;
  deleted: boolean;
  createdAt: string;
  categoryId: number;
  categories: Category[];
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
