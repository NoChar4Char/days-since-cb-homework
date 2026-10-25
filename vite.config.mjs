import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so `npm run deploy` works on a GitHub Pages project URL
  base: "./",
});
