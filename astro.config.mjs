// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import icon from "astro-icon";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: "https://travasstineni.cz",

    integrations: [react(), icon()],
    output: "static",
    adapter: cloudflare(),

    vite: {
        plugins: [tailwindcss()],
    },
});
