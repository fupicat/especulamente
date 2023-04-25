import Project from "@/models/Project";
import type { APIRoute } from "astro";

export const get: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const types = url.searchParams.get("types")?.split(",") || [];
  const tags =
    url.searchParams
      .get("tags")
      ?.split(",")
      .map((tag) => decodeURIComponent(tag)) || [];
  const authors = url.searchParams.get("authors")?.split(",") || [];
  const sfw = url.searchParams.has("sfw");
  const perPage = Number(url.searchParams.get("perPage") || 10);

  const page = Number(url.searchParams.get("page")) || 0;

  return new Response(
    JSON.stringify(
      await Project.search({
        query,
        types,
        page,
        tags,
        authors,
        nsfw: !sfw,
        perPage,
      })
    ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
