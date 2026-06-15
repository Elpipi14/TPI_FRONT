import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "src/pages/store/home/home.html"),
        cart: resolve(__dirname, "src/pages/store/cart/cart.html"),
        product: resolve(__dirname, "src/pages/store/products/product.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        register: resolve(__dirname, "src/pages/auth/register/register.html"),
        admin: resolve(__dirname, "src/pages/admin/admin.html"),
        user: resolve(__dirname, "src/pages/client/user.html"),
        orders: resolve(__dirname, "src/pages/client/orders/orders.html"),
      },
    },
  },
  base: "./",
});
