import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập từ các subdomain
    port: 5173,
    strictPort: false, // Tự động tìm port khác nếu 5173 đang dùng
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/provinces-api": {
        target: "https://provinces.open-api.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provinces-api/, ""),
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Tránh minify biến thành $ để tránh conflict
        manualChunks: undefined,
      },
    },
    // Sử dụng esbuild (default) thay vì terser
    minify: 'esbuild',
  },
});
