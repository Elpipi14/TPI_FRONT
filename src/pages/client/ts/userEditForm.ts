import Swal from "sweetalert2";
import type { IUser } from "../../../types/IUser";
import { getUsers, saveUsers } from "../../../utils/auth";
import { isValidEmail, isValidPassword, isValidPhone, MIN_PASSWORD_LENGTH} from "../../../utils/validators";
import { renderProfile } from "./userProfile";
import { showError } from "./userHelpers";

export function initEditForm(currentUser: IUser): void {
  const form = document.querySelector<HTMLFormElement>("#edit-user-form");
  const emailInput = document.querySelector<HTMLInputElement>("#new-email");
  const phoneInput = document.querySelector<HTMLInputElement>("#new-phone");
  const passwordInput = document.querySelector<HTMLInputElement>("#new-password");

  if (!form || !emailInput || !phoneInput || !passwordInput) {
    return;
  }

  let activeUser = currentUser;

  emailInput.value = activeUser.email;

  phoneInput.value = activeUser.celular || "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newEmail = emailInput.value.trim().toLowerCase();
    const newPhone = phoneInput.value.trim();
    const newPassword = passwordInput.value.trim();

    if (!isValidEmail(newEmail)) {
      await showError("Email inválido", "Ingresá un email con formato válido.");
      return;
    }

    if (!isValidPhone(newPhone)) {
      await showError(
        "Celular inválido",
        "Ingresá solo números, entre 8 y 15 dígitos.",
      );
      return;
    }

    if (newPassword && !isValidPassword(newPassword)) {
      await showError(
        "Contraseña inválida",
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    const users = getUsers();
    const emailAlreadyExists = users.some(
      (user) => user.email === newEmail && user.id !== activeUser.id,
    );

    if (emailAlreadyExists) {
      await showError("Email en uso", "Ese email ya está registrado.");
      return;
    }

    const updatedUser: IUser = {
      ...activeUser,
      email: newEmail,
      celular: newPhone,
      password: newPassword || activeUser.password,
    };

    const updatedUsers = users.map((user) =>
      user.id === activeUser.id ? updatedUser : user,
    );

    saveUsers(updatedUsers);
    localStorage.setItem("food-store-session", JSON.stringify(updatedUser));
    activeUser = updatedUser;
    renderProfile(updatedUser);
    passwordInput.value = "";
    await Swal.fire({
      icon: "success",
      title: "Datos actualizados",
      text: "Tu perfil se actualizó correctamente.",
      confirmButtonText: "Aceptar",
    });
  });
  
}
