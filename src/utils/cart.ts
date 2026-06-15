import { getProductById } from "../data/data";
import { getCurrentUser } from "./auth";
import type { Product } from "../types/products";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type CartResult = {
  ok: boolean;
  message: string;
};

const CART_KEY = "food-store-cart";

function getCartKey(): string {
  const user = getCurrentUser();
  return user ? `${CART_KEY}-${user.id}` : CART_KEY;
}

export function getCart(): CartItem[] {
  const data = localStorage.getItem(getCartKey());
  if (!data) return [];

  try {
    return JSON.parse(data) as CartItem[];
  } catch {
    localStorage.removeItem(getCartKey());
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

export function addToCart(product: Product, quantity = 1): CartResult {
  if (!product.available || product.stock <= 0) {
    return { ok: false, message: "El producto no esta disponible." };
  }

  const normalizedQuantity = Math.max(1, quantity);
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === product.id);
  const currentQuantity = existingItem?.quantity ?? 0;
  const newQuantity = currentQuantity + normalizedQuantity;

  if (newQuantity > product.stock) {
    return {
      ok: false,
      message: `No hay stock suficiente. Stock disponible: ${product.stock}.`,
    };
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: normalizedQuantity,
      image: product.image,
    });
  }

  saveCart(cart);
  return { ok: true, message: "Producto agregado al carrito." };
}

export function updateCartItemQuantity(productId: number, quantity: number): CartResult {
  const cart = getCart();

  if (quantity <= 0) {
    saveCart(cart.filter((item) => item.productId !== productId));
    return { ok: true, message: "Producto eliminado del carrito." };
  }

  const product = getProductById(productId);
  if (!product || !product.available || product.stock <= 0) {
    return { ok: false, message: "El producto ya no esta disponible." };
  }

  if (quantity > product.stock) {
    return {
      ok: false,
      message: `No podes superar el stock disponible (${product.stock}).`,
    };
  }

  const item = cart.find((cartItem) => cartItem.productId === productId);
  if (!item) return { ok: false, message: "Producto no encontrado en el carrito." };

  item.quantity = quantity;
  saveCart(cart);
  return { ok: true, message: "Carrito actualizado." };
}

export function removeFromCart(productId: number): void {
  saveCart(getCart().filter((item) => item.productId !== productId));
}

export function clearCart(): void {
  localStorage.removeItem(getCartKey());
}

export function calculateCartTotal(cart: CartItem[] = getCart()): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemsCount(cart: CartItem[] = getCart()): number {
  return cart.reduce((total, item) => total + item.quantity, 0);
}
