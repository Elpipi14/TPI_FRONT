import { getInitialUsers } from "../data/data";
import type { IUser } from "../types/IUser";

const USERS_KEY = "food-store-users";
const USER_DATA_KEY = "food-store-session";

type AuthResult = {
  ok: boolean;
  message: string;
  user?: IUser;
};

function parseUsers(data: string | null): IUser[] {
  if (!data) return [];

  try {
    return JSON.parse(data) as IUser[];
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

export function getUsers(): IUser[] {
  const savedUsers = parseUsers(localStorage.getItem(USERS_KEY));
  const users = savedUsers.length > 0 ? savedUsers : getInitialUsers();

  return users.map((user) => ({
    ...user,
    celular: user.celular ?? "",
    email: user.email.trim().toLowerCase(),
  }));
}

export function saveUsers(users: IUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(
  nombre: string,
  celular: string,
  email: string,
  password: string
): AuthResult {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const userExists = users.some((user) => user.email === normalizedEmail);

  if (userExists) {
    return {
      ok: false,
      message: "Ese email ya esta registrado.",
    };
  }

  const newUser: IUser = {
    id: getNextUserId(users),
    nombre: nombre.trim(),
    celular: celular.trim(),
    email: normalizedEmail,
    password,
    role: "USUARIO",
  };

  saveUsers([...users, newUser]);

  return {
    ok: true,
    message: "Usuario registrado correctamente.",
    user: newUser,
  };
}

export function loginUser(email: string, password: string): AuthResult {
  const normalizedEmail = email.trim().toLowerCase();
  const foundUser = getUsers().find(
    (user) => user.email === normalizedEmail && user.password === password
  );

  if (!foundUser) {
    return {
      ok: false,
      message: "Email o contrasena incorrectos.",
    };
  }

  localStorage.setItem(USER_DATA_KEY, JSON.stringify(foundUser));

  return {
    ok: true,
    message: "Inicio de sesion correcto.",
    user: foundUser,
  };
}

export function getCurrentUser(): IUser | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as IUser;
  } catch {
    localStorage.removeItem(USER_DATA_KEY);
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

export function logout(): void {
  localStorage.removeItem(USER_DATA_KEY);
}

function getNextUserId(users: IUser[]): number {
  if (users.length === 0) return 1;
  return Math.max(...users.map((user) => user.id)) + 1;
}
