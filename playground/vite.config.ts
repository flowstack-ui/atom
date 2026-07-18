import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const packageRoot = resolve(__dirname, "..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@flowstack-ui\/atom$/,
        replacement: resolve(packageRoot, "src/index.ts"),
      },
      {
        find: /^@flowstack-ui\/atom\/(.+)$/,
        replacement: `${resolve(packageRoot, "src")}/$1.ts`,
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    fs: {
      allow: [packageRoot],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4000,
    strictPort: true,
  },
});
