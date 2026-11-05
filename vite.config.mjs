import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { embedTags } from "./src/embed.js";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Puts the current timer into index.html as link-preview tags (for Discord embeds)
function linkPreview() {
  return {
    name: "link-preview",
    transformIndexHtml(html) {
      const data = JSON.parse(readFileSync(new URL("./src/data.json", import.meta.url), "utf8"));
      return html.replace("<!-- link-preview -->", embedTags(data, { url: pkg.homepage }));
    },
  };
}

export default defineConfig({
  plugins: [react(), linkPreview()],
  // Relative asset paths so `npm run deploy` works on a GitHub Pages project URL
  base: "./",
});
