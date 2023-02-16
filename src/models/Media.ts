import { server } from "@/lib/supabaseServer";
import Profile, { ProfileType } from "./Profile";

export interface MediaType {
  id: number;
  created_at: Date;
  author: ProfileType;
  image_url: string | null;
  video_url: string | null;
  title: string;
  description: string;
  tags: string[];
  nsfw: boolean;
}

export interface MediaCreatable {
  id?: number;
  created_at?: Date;
  author: string;
  image_url: string | null;
  video_url: string | null;
  title: string;
  description: string;
  tags: string[];
  nsfw: boolean;
}

export interface MediaEditable {
  image_url?: string | null;
  video_url?: string | null;
  title?: string;
  description?: string;
  tags?: string[];
  nsfw?: boolean;
}

export default class Media {
  static placeholders: MediaType[] = new Array(8)
    .fill([
      {
        id: 1,
        created_at: new Date(),
        author: Profile.placeholders[0],
        image_url: "https://i.imgur.com/gdDSa7b.png",
        video_url: null,
        title: "Imagem",
        description: "Descrição da imagem",
        tags: ["especulativo", "doido"],
        nsfw: false,
      },
      {
        id: 2,
        created_at: new Date(),
        author: Profile.placeholders[0],
        image_url: null,
        video_url: "https://i.imgur.com/mHJaHCt.mp4",
        title: "Vídeo",
        description: "Descrição do vídeo",
        tags: ["bfdi", "neon", "fupi"],
        nsfw: false,
      },
      {
        id: 3,
        created_at: new Date(),
        author: Profile.placeholders[0],
        image_url: "https://i.imgur.com/gdDSa7b.png",
        video_url: null,
        title: "Imagem",
        description: "Descrição da imagem",
        tags: ["especulativo", "doido"],
        nsfw: true,
      },
    ])
    .flat();

  static async get(id?: number | string): Promise<MediaType | null> {
    if (!server) return this.placeholders.find((m) => id === m.id) || null;
    if (!id) return null;

    const { data, error } = await server
      .from("media")
      .select("*, author (*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data || null;
  }

  static async all(): Promise<MediaType[]> {
    if (!server) return this.placeholders;

    const { data, error } = await server
      .from("media")
      .select("*, author (*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  static async put(
    id?: number | string,
    fields?: MediaEditable
  ): Promise<MediaType> {
    if (!server) return this.placeholders[0];
    if (!id || !fields) throw { error: { message: "Essa mídia não existe." } };

    const { data, error } = await server
      .from("media")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async post(fields: MediaCreatable): Promise<MediaType> {
    if (!server) return this.placeholders[0];

    const { data, error } = await server
      .from("media")
      .insert(fields)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async del(id?: number | string) {
    if (!server) return;
    if (!id) throw { error: { message: "Essa mídia não existe." } };

    const { error } = await server.from("media").delete().eq("id", id);

    if (error) throw error;
  }
}
