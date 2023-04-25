import { server } from "@/lib/supabaseServer";
import type { ProfileData } from "./Profile";

export type BaseProjectData<Type, Content> = {
  id: number;
  created_at: Date;
  author: ProfileData;
  type: Type;
  title: string;
  description?: string;
  thumbnail_url?: string;
  content?: Content;
  tags?: string[];
  nsfw: boolean;
};

export type BaseProjectCreatable<Type, Content> = {
  author: string;
  type?: Type;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  content?: Content;
  tags?: string[] | null;
  nsfw: boolean;
};

export type BaseProjectEditable<Content> = {
  title?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  content?: Content | null;
  tags?: string[] | null;
  nsfw?: boolean | null;
};

export type ProjectData = BaseProjectData<string, any>;
export type ProjectCreatable = BaseProjectCreatable<string, any>;
export type ProjectEditable = BaseProjectEditable<any>;

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

    return data || null;
  }

  static async all(): Promise<ProjectData[]> {
    if (!server) return this.placeholders;

    const { data, error } = await server
      .from("projects")
      .select("*, author (*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
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

    return { data, pageCount };
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

    return data;
  }

  static async post(fields: ProjectCreatable): Promise<ProjectData> {
    if (!server) return this.placeholders[0];

    const { data, error } = await server
      .from("projects")
      .insert(fields)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async del(id?: number) {
    if (!server) return;
    if (!id) throw { error: { message: "Esse projeto não existe." } };

    const { error } = await server.from("projects").delete().eq("id", id);

    if (error) throw error;
  }
}
