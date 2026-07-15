// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import icon from "astro-icon";
import tsconfigPaths from "vite-tsconfig-paths";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: "https://travasstineni.cz",

    integrations: [react(), icon()],
    output: "static",

    vite: {
        plugins: [tailwindcss(), tsconfigPaths()],
    },
});
