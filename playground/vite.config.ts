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
    fs: {
      allow: [packageRoot],
    },
  },
});
