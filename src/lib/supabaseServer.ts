import { createClient } from "@supabase/supabase-js";
import type { AstroGlobal } from "astro";
import { getCookie } from "./serverShorthand";

const supabaseUrl = "https://rqajdbmoinhxkzqtzidd.supabase.co";
const supabaseServerKey = import.meta.env.SUPABASE_SERVER;
export const server = supabaseServerKey
  ? createClient(supabaseUrl, supabaseServerKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    })
  : null;

export async function getUser(
  refreshToken?: string | null,
  accessToken?: string | null
) {
  if (!server) return null;
  if (refreshToken && accessToken) {
    const response = await server.auth.setSession({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    const user = await server.auth.getUser();

    if (user.error) {
      return null;
    }

    return user.data.user;
  }

  return null;
}

/**
 * Use isso quando você só quer saber se o usuário está logado, e usar o seu ID para algo.
 *
 * @param req
 * @returns
 */
export async function getLoggedInID(
  req: Readonly<AstroGlobal<Record<string, any>>> | Request
): Promise<string | null> {
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

  return user.id;
}
