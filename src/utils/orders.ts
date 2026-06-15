import { decreaseProductsStock, getInitialOrders } from "../data/data";
import type { IUser } from "../types/IUser";
import type { Order, OrderStatus, PaymentMethod } from "../types/order";
import type { CartItem } from "./cart";
import { calculateCartTotal, clearCart } from "./cart";

const ORDERS_KEY = "food-store-orders";
const LEGACY_TIMESTAMP_ID = 100000;

function parseOrders(data: string | null): Order[] {
  if (!data) return [];

  try {
    return JSON.parse(data) as Order[];
  } catch {
    localStorage.removeItem(ORDERS_KEY);
    return [];
  }
}

export function getOrders(): Order[] {
  const savedData = localStorage.getItem(ORDERS_KEY);
  if (!savedData) return getInitialOrders();

  const savedOrders = parseOrders(savedData);
  const orders = savedOrders.length > 0 ? savedOrders : getInitialOrders();
  return normalizeLegacyOrderIds(orders);
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrdersByUser(userId: number): Order[] {
  return getOrders().filter((order) => order.userId === userId);
}

export function createOrder(user: IUser, cart: CartItem[], paymentMethod: PaymentMethod): Order {
  const orders = getOrders();
  const stockResult = decreaseProductsStock(cart);

  if (!stockResult.ok) {
    throw new Error(stockResult.message);
  }

  const order: Order = {
    id: getNextOrderId(orders),
    userId: user.id,
    userEmail: user.email,
    date: new Date().toISOString(),
    status: "PENDIENTE",
    paymentMethod,
    items: cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
    total: calculateCartTotal(cart),
  };

  saveOrders([...orders, order]);
  clearCart();
  return order;
}

export function getOrderStatuses(): OrderStatus[] {
  return ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];
}

export function updateOrderStatus(orderId: number, status: OrderStatus): void {
  const orders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order
  );

  saveOrders(orders);
}

function getNextOrderId(orders: Order[]): number {
  if (orders.length === 0) return 1;
  return Math.max(...orders.map((order) => order.id)) + 1;
}

function normalizeLegacyOrderIds(orders: Order[]): Order[] {
  const hasLegacyId = orders.some((order) => order.id >= LEGACY_TIMESTAMP_ID);
  if (!hasLegacyId) return orders;

  let nextOrderId = Math.max(
    ...orders
      .filter((order) => order.id < LEGACY_TIMESTAMP_ID)
      .map((order) => order.id),
    1000
  ) + 1;

  const normalizedOrders = orders.map((order) => {
    if (order.id < LEGACY_TIMESTAMP_ID) return order;

    const normalizedOrder = {
      ...order,
      id: nextOrderId,
    };

    nextOrderId += 1;
    return normalizedOrder;
  });

  saveOrders(normalizedOrders);
  return normalizedOrders;
}
