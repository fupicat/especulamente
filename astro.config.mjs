import { defineConfig } from "astro/config";

// https://astro.build/config
import svelte from "@astrojs/svelte";
import deno from "@astrojs/deno";

export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [svelte()],
});
