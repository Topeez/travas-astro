import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
    site: "https://travasstineni.cz",
    output: "static",
    adapter: cloudflare(),
    integrations: [react(), icon()],
    vite: {
        plugins: [tailwindcss()],
    },
});