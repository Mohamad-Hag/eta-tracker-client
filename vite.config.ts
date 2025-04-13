import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@tabler/icons-react"],
  },
  server: {
    host: true,
    port: 5173,
  },
});
