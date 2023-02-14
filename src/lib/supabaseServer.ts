import { createClient } from "@supabase/supabase-js";
import type { AstroGlobal } from "astro";

const supabaseUrl = "https://rqajdbmoinhxkzqtzidd.supabase.co";
const supabaseServerKey = import.meta.env.SUPABASE_SERVER;
export const supabase = createClient(supabaseUrl, supabaseServerKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

export async function getUser(
  refreshToken?: string | null,
  accessToken?: string | null
) {
  if (refreshToken && accessToken) {
    const response = await supabase.auth.setSession({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    const user = await supabase.auth.getUser();

    if (user.error) {
      return null;
    }

    return user.data.user;
  }

  return null;
}

export async function getCurrentUserProfile(
  astroInstance: Readonly<AstroGlobal<Record<string, any>>>
) {
  const user = await getUser(
    astroInstance.cookies.get("my-refresh-token").value,
    astroInstance.cookies.get("my-access-token").value
  );

  const profileRequest = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();
  let profile = null;

  if (profileRequest.data) {
    profile = profileRequest.data;
  }
  return profile;
}

export async function getProfileByUsername(username?: string) {
  if (!username) {
    return null;
  }

  const profileRequest = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  return profileRequest.data || null;
}

export async function getMediaByID(id?: string) {
  if (!id) {
    return null;
  }

  const mediaRequest = await supabase
    .from("media")
    .select("*, author (*)")
    .eq("id", id)
    .single();

  return mediaRequest.data || null;
}
