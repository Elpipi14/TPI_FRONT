import Swal from "sweetalert2";
import "../../../style.css";
import { initNavbar } from "../../../sections/navBar/navBar";
import { getCurrentUser, isLoggedIn } from "../../../utils/auth";
import {calculateCartTotal, clearCart, getCart, getCartItemsCount, removeFromCart, updateCartItemQuantity } from "../../../utils/cart";
import { createOrder } from "../../../utils/orders";
import type { PaymentMethod } from "../../../types/order";
import { isValidEmail, isValidPhone } from "../../../utils/validators";

function formatPrice(price: number): string {
  return `$ ${price.toLocaleString("es-AR")}`;
}

function updateCartCount(): void {
  const cartCount = document.querySelector<HTMLElement>("#cart-count");
  if (cartCount) cartCount.textContent = String(getCartItemsCount());
}

function renderCart(): void {
  const container = document.querySelector<HTMLElement>("#cart-container");
  const totalContainer = document.querySelector<HTMLElement>("#cart-total");
  const clearButton = document.querySelector<HTMLButtonElement>("#clear-cart-btn");
  const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-btn");
  const checkoutOptions = document.querySelector<HTMLElement>("#checkout-options");

  if (!container || !totalContainer || !clearButton || !checkoutButton || !checkoutOptions) return;

  const cart = getCart();
  updateCartCount();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-wrapper">
        <p class="empty-cart">Tu carrito esta vacio.</p>
        <a href="/src/pages/store/home/home.html" class="back-home-btn">Volver a productos</a>
      </div>
    `;

    totalContainer.textContent = "Total: $ 0";
    clearButton.classList.add("hidden");
    checkoutButton.classList.add("hidden");
    checkoutOptions.classList.add("hidden");
    return;
  }

  clearButton.classList.remove("hidden");
  checkoutButton.classList.remove("hidden");
  checkoutOptions.classList.remove("hidden");

  container.innerHTML = "";

  cart.forEach((item) => {
    const article = document.createElement("article");
    article.classList.add("cart-item");

    article.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h2>${item.name}</h2>
        <p>Precio: ${formatPrice(item.price)}</p>
        <p>Cantidad: ${item.quantity}</p>
        <p>Subtotal: ${formatPrice(item.price * item.quantity)}</p>
      </div>
      <div class="cart-actions">
        <button type="button" class="decrease-btn">-</button>
        <button type="button" class="increase-btn">+</button>
        <button type="button" class="remove-btn">Eliminar</button>
      </div>
    `;

    article.querySelector<HTMLButtonElement>(".decrease-btn")?.addEventListener("click", () => {
      updateCartItemQuantity(item.productId, item.quantity - 1);
      renderCart();
    });

    article.querySelector<HTMLButtonElement>(".increase-btn")?.addEventListener("click", () => {
      const result = updateCartItemQuantity(item.productId, item.quantity + 1);
      if (!result.ok) {
        void Swal.fire({
          title: "Stock insuficiente",
          text: result.message,
          icon: "error",
        });
      }
      renderCart();
    });

    article.querySelector<HTMLButtonElement>(".remove-btn")?.addEventListener("click", () => {
      removeFromCart(item.productId);
      renderCart();
    });

    container.appendChild(article);
  });

  totalContainer.textContent = `Total: ${formatPrice(calculateCartTotal(cart))}`;
}

function initCartPage(): void {
  initNavbar();

  if (!isLoggedIn()) {
    window.location.href = "/src/pages/auth/login/login.html";
    return;
  }

  renderCart();
  initClearCartButton();
  initCheckoutButton();
}

function initClearCartButton(): void {
  document.querySelector<HTMLButtonElement>("#clear-cart-btn")?.addEventListener("click", async () => {
    const result = await Swal.fire({
      title: "Vaciar carrito?",
      text: "Se eliminaran todos los productos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, vaciar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      clearCart();
      renderCart();
    }
  });
}

function initCheckoutButton(): void {
  document.querySelector<HTMLButtonElement>("#checkout-btn")?.addEventListener("click", async () => {
    const user = getCurrentUser();
    const cart = getCart();
    const paymentMethod = getSelectedPaymentMethod();

    if (!user || cart.length === 0) return;

    if (!isValidEmail(user.email) || !isValidPhone(user.celular)) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Antes de confirmar el pedido, completa un email y celular validos en tu perfil.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar pedido",
      text: `Total a pagar: ${formatPrice(calculateCartTotal(cart))} - Pago: ${formatPaymentMethod(paymentMethod)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const order = createOrder(user, cart, paymentMethod);

      await Swal.fire({
        title: "Pedido confirmado",
        text: `Tu pedido #${order.id} fue registrado correctamente.`,
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      await Swal.fire({
        title: "No se pudo confirmar",
        text: error instanceof Error ? error.message : "No hay stock suficiente para completar el pedido.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }

    renderCart();
  });
}

function getSelectedPaymentMethod(): PaymentMethod {
  const select = document.querySelector<HTMLSelectElement>("#payment-method");
  return (select?.value as PaymentMethod) || "EFECTIVO";
}

function formatPaymentMethod(paymentMethod: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
    TARJETA: "Tarjeta",
  };

  return labels[paymentMethod];
}

document.addEventListener("DOMContentLoaded", initCartPage);
