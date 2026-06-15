export type OrderStatus = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  date: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  items: OrderItem[];
  total: number;
}
