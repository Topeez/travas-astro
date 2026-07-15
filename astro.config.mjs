import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
    site: "https://travasstineni.cz",
    integrations: [react(), icon(), tailwind()],
    output: "static",
});
