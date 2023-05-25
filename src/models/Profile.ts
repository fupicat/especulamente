import { getCookie } from "@/lib/serverShorthand";
import { getUser, server } from "@/lib/supabaseServer";
import type { AstroGlobal } from "astro";

export type SitePreferences = {
  background_url?: string;
  color?: string;
  custom_css?: string;
};

export type ProfileData = {
  username: string;
  id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string;
  created_at: Date;
  banner_url: string | null;
  background_url: string | null;
  custom_css: string | null;
  color: string | null;
  preferences: SitePreferences | null;
};

export type ProfileEditable = {
  username?: string | null;
  nickname?: string | null;
  avatar_url?: string | null;
  bio?: string;
  banner_url?: string | null;
  background_url?: string | null;
  custom_css?: string | null;
  color?: string | null;
  preferences: SitePreferences | null;
};

export default class Profile {
  static placeholders: ProfileData[] = new Array(20).fill({
    id: "00000000-0000-0000-0000-0000000000",
    username: "placeholder",
    nickname: "Placeholder",
    avatar_url: null,
    bio: "Bio placeholder para o usuário placeholder!!",
    created_at: new Date(),
  });

  static async get({
    username,
    id,
  }: {
    username?: string;
    id?: string;
  }): Promise<ProfileData | null> {
    if (!server) {
      if (username)
        return this.placeholders.find((p) => p.username === username) || null;
      if (id) return this.placeholders.find((p) => p.id === id) || null;
      return null;
    }

    if (username) {
      const { data, error } = await server
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;

      return (data as ProfileData) || null;
    }

    if (id) {
      const { data, error } = await server
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      return (data as ProfileData) || null;
    }

    return null;
  }

  static async all(): Promise<ProfileData[]> {
    if (!server) return this.placeholders;

    const { data, error } = await server.from("profiles").select("*");

    if (error) throw error;

    return data as ProfileData[];
  }

  static async put(id: string, fields: ProfileEditable): Promise<ProfileData> {
    if (!server) return this.placeholders[0];

    const { data, error } = await server
      .from("profiles")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as ProfileData;
  }

  /**
   * Obtém a profile do usuário logado.
   *
   * @param req
   * @returns
   */
  static async current(
    req: Readonly<AstroGlobal<Record<string, any>>> | Request
  ): Promise<ProfileData | null> {
    if (!server) return null;
    const user =
      req instanceof Request
        ? await getUser(
            getCookie(req, "my-refresh-token"),
            getCookie(req, "my-access-token")
          )
        : await getUser(
            req.cookies.get("my-refresh-token").value,
            req.cookies.get("my-access-token").value
          );

    if (!user) return null;

    return await this.get({ id: user.id });
  }
}
