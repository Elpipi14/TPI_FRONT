import Swal from "sweetalert2";
import { loginUser } from "../../../utils/auth";

export function initLogin(): void {
  const form = document.querySelector<HTMLFormElement>("#login-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = document.querySelector<HTMLInputElement>("#email");
    const passwordInput = document.querySelector<HTMLInputElement>("#password");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      await Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Completá email y contrasena.",
      });
      return;
    }

    const result = loginUser(email, password);

    if (!result.ok || !result.user) {
      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesion",
        text: result.message,
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: "Inicio de sesion correcto.",
      confirmButtonText: "Aceptar",
    });

    window.location.href =
      result.user.role === "ADMIN"
        ? "/src/pages/admin/admin.html"
        : "/src/pages/store/home/home.html";
  });
}

document.addEventListener("DOMContentLoaded", initLogin);
