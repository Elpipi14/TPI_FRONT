import type { IUser } from "../../../types/IUser";
import { setText } from "./userHelpers";

export function renderProfile(user: IUser): void {

  setText("#profile-email", user.email);
  setText("#profile-phone", user.celular || "Sin cargar");
  setText("#profile-role", user.role);
  
}
