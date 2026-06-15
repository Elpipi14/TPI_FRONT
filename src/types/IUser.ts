import type { Rol } from "./rol";

export interface IUser {
  id: number;
  nombre: string;
  celular: string;
  email: string;
  password: string;
  role: Rol;
}
