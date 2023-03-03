import { server } from "@/lib/supabaseServer";
import Profile from "./Profile";
import Project, {
  BaseProjectCreatable,
  BaseProjectData,
  BaseProjectEditable,
} from "./Project";

export type ImageContent = {
  image_url: string;
};
export type ImageData = BaseProjectData<"image", ImageContent>;
export type ImageCreatable = BaseProjectCreatable<"image", ImageContent>;
export type ImageEditable = BaseProjectEditable<ImageContent>;

export type VideoContent = {
  video_url: string;
};
export type VideoData = BaseProjectData<"video", VideoContent>;
export type VideoCreatable = BaseProjectCreatable<"video", VideoContent>;
export type VideoEditable = BaseProjectEditable<VideoContent>;

export type MediaContent = ImageContent | VideoContent;
export type MediaData = ImageData | VideoData;
export type MediaCreatable = ImageCreatable | VideoCreatable;
export type MediaEditable = ImageEditable | VideoEditable;

export default class Media extends Project {
  static placeholders: MediaData[] = new Array(8)
    .fill([
      {
        id: 1,
        created_at: new Date(),
        author: Profile.placeholders[0],
        type: "image",
        thumbnail_url: "https://i.imgur.com/gdDSa7b.png",
        content: {
          image_url: "https://i.imgur.com/gdDSa7b.png",
        },
        title: "Imagem",
        description: "Descrição da imagem",
        tags: ["especulativo", "doido"],
        nsfw: true,
      },
      {
        id: 2,
        created_at: new Date(),
        author: Profile.placeholders[0],
        type: "image",
        thumbnail_url: "https://i.imgur.com/gdDSa7b.png",
        content: {
          image_url: "https://i.imgur.com/gdDSa7b.png",
        },
        title: "Imagem",
        description: "Descrição da imagem",
        tags: ["especulativo", "doido"],
        nsfw: true,
      },
      {
        id: 3,
        created_at: new Date(),
        author: Profile.placeholders[0],
        type: "image",
        thumbnail_url: "https://i.imgur.com/gdDSa7b.png",
        content: {
          image_url: "https://i.imgur.com/gdDSa7b.png",
        },
        title: "Imagem",
        description: "Descrição da imagem",
        tags: ["especulativo", "doido"],
        nsfw: true,
      },
    ] as MediaData[])
    .flat();

  static async get(id?: number): Promise<MediaData | null> {
    return (await Project.get(id)) as MediaData;
  }

  static async all(): Promise<MediaData[]> {
    if (!server) return this.placeholders;

    const { data, error } = await server
      .from("projects")
      .select("*, author (*)")
      .or("type.eq.image,type.eq.video")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  }

  static async put(id?: number, fields?: MediaEditable): Promise<MediaData> {
    return (await Project.put(id, fields)) as MediaData;
  }

  static async post(fields: MediaCreatable): Promise<MediaData> {
    return (await Project.post(fields)) as MediaData;
  }

  static async del(id?: number) {
    await Project.del(id);
  }
}
