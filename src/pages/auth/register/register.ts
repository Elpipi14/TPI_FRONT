import Swal from "sweetalert2";
import { registerUser } from "../../../utils/auth";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  MIN_PASSWORD_LENGTH,
  normalizeSpaces,
} from "../../../utils/validators";

export function initRegister(): void {
  const form = document.querySelector<HTMLFormElement>("#register-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = normalizeSpaces(getInputValue("#name"));
    const phone = getInputValue("#phone");
    const email = getInputValue("#email").toLowerCase();
    const password = getInputValue("#password");

    if (!name || !phone || !email || !password) {
      await showError("Campos incompletos", "Completa todos los campos.");
      return;
    }

    if (!isValidPhone(phone)) {
      await showError("Celular invalido", "Ingresa solo numeros, entre 8 y 15 digitos.");
      return;
    }

    if (!isValidEmail(email)) {
      await showError("Email invalido", "Ingresa un email con formato valido.");
      return;
    }

    if (!isValidPassword(password)) {
      await showError(
        "Contrasena invalida",
        `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      return;
    }

    const result = registerUser(name, phone, email, password);

    if (!result.ok) {
      await showError("Error", result.message);
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: result.message,
      confirmButtonText: "Aceptar",
    });

    window.location.href = "/src/pages/auth/login/login.html";
  });
}

function getInputValue(selector: string): string {
  return document.querySelector<HTMLInputElement>(selector)?.value.trim() ?? "";
}

async function showError(title: string, text: string): Promise<void> {
  await Swal.fire({
    icon: "error",
    title,
    text,
  });
}

document.addEventListener("DOMContentLoaded", initRegister);
