import { initNavbar } from "../../sections/navBar/navBar";
import { getCurrentUser } from "../../utils/auth";
import { protectRoutes } from "../../utils/guards";
import { initLogoutButton, updateCartCount } from "./ts/userHelpers";
import { renderProfile } from "./ts/userProfile";
import { renderOrders } from "./ts/userOrders";
import { initEditForm } from "./ts/userEditForm";

function initUserPanel(): void {

  protectRoutes(); 
  initNavbar();

  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "/src/pages/auth/login/login.html"; 
    return; 
  } 
    
  renderProfile(currentUser); 
  renderOrders(currentUser); 
  updateCartCount(); 
  initLogoutButton(); 
  initEditForm(currentUser);

} 

document.addEventListener("DOMContentLoaded", initUserPanel);