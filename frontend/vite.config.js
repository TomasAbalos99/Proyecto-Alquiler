import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // Redirige las llamadas /api al backend Express en desarrollo
      "/api": "http://localhost:3000",
    },
  },
});
