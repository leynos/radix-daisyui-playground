import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoBasePath = "/radix-daisyui-playground/";

export default defineConfig({
  // Configure GitHub Pages project deployments to resolve assets from /<repo>/.
  base: repoBasePath,
  plugins: [react()],
});
