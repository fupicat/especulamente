import { server } from "@/lib/supabaseServer";
import type { ProfileData } from "./Profile";

type ProjectType = "image" | "video" | "game" | "document" | "blog" | "page";

export type ProjectData = {
  id: number;
  created_at: string;
  author: ProfileData;
  type: ProjectType;
  title: string;
  description?: string;
  thumbnail_url?: string;
  content?: any;
  tags?: string[];
  nsfw: boolean;
};

export type ProjectCreatable = {
  author: string;
  type?: ProjectType;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  content?: any;
  tags?: string[] | null;
  nsfw: boolean;
};

export type ProjectEditable = {
  title?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  content?: any | null;
  tags?: string[] | null;
  nsfw?: boolean | null;
};

export default class Project {
  static placeholders: ProjectData[] = [];

  static async get(id?: number): Promise<ProjectData | null> {
    if (!server) return this.placeholders.find((m) => id === m.id) || null;
    if (!id) return null;

    const { data, error } = await server
      .from("projects")
      .select("*, author (*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return (data as ProjectData) || null;
  }

  static async search({
    query = "",
    page = 0,
    types = [],
    tags = [],
    authors = [],
    nsfw = true,
    oldest = false,
    perPage = 10,
  }: {
    query?: string;
    page?: number;
    types?: string[];
    tags?: string[];
    authors?: string[];
    nsfw?: boolean;
    oldest?: boolean;
    perPage?: number;
  }): Promise<{ data: ProjectData[]; pageCount: number }> {
    if (!server)
      return { data: this.placeholders, pageCount: this.placeholders.length };

    page = page - 1;

    let selection = server
      .from("projects")
      .select("*, author!inner (*)", {
        count: "exact",
      })
      .order("created_at", {
        ascending: oldest,
      });

    if (query.length > 0)
      selection = selection.or(
        `title.fts.${encodeURIComponent(
          query
        )}, description.fts.${encodeURIComponent(query)}`
      );
    if (types.length > 0) selection = selection.in("type", types);
    if (tags.length > 0) selection = selection.overlaps("tags", tags);
    if (authors.length > 0)
      selection = selection.in("author.username", authors);

    if (!nsfw) selection = selection.eq("nsfw", false);

    const pageCount = Math.ceil((await selection).count! / perPage);
    if (page >= pageCount) return { data: [], pageCount };

    const { data, error } = await selection.range(
      page * perPage,
      page * perPage + perPage - 1
    );
    if (error) throw error;

    return { data: data as ProjectData[], pageCount };
  }

  /**
   * Returns a list of featured projects based on the provided username (if any).
   * If no username is provided, returns all featured projects.
   *
   * @param {string} by - (Optional) The username of the user whose featured projects to retrieve.
   * @return {Promise<ProjectData[]>} A promise that resolves to an array of ProjectData objects representing the featured projects.
   * @throws {Error} If there is an error retrieving the data from the server.
   */
  static async featured(by: string = ""): Promise<ProjectData[]> {
    if (!server) return [];
    if (by) {
      const { data, error } = await server
        .from("featured_projects")
        .select("*, featured_by!inner (username), project (*, author (*))")
        .eq("featured_by.username", by)
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      return data.map((m) => m.project) as ProjectData[];
    }

    const { data, error } = await server
      .from("featured_projects")
      .select("*, featured_by!inner (username), project (*, author (*))")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data.map((m) => m.project) as ProjectData[];
  }

  static async put(
    id?: number,
    fields?: ProjectEditable
  ): Promise<ProjectData> {
    if (!server) return this.placeholders[0];
    if (!id || !fields)
      throw { error: { message: "Esse projeto não existe." } };

    const { data, error } = await server
      .from("projects")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as ProjectData;
  }

  static async post(fields: ProjectCreatable): Promise<ProjectData> {
    if (!server) return this.placeholders[0];

    const { data, error } = await server
      .from("projects")
      .insert(fields)
      .select()
      .single();

    if (error) throw error;

    return data as ProjectData;
  }

  static async del(id?: number) {
    if (!server) return;
    if (!id) throw { error: { message: "Esse projeto não existe." } };

    const { error } = await server.from("projects").delete().eq("id", id);

    if (error) throw error;
  }
}
