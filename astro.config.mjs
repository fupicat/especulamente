import { defineConfig } from "astro/config";

// https://astro.build/config
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  output: "server",
  adapter: netlify(),
});
