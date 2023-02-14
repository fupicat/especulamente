import { getUser, supabase } from "@/lib/supabaseServer";
import { uploadImage } from "@/lib/imgur";
import type { APIRoute } from "astro";
//@ts-ignore
import sanitizeHtml from "sanitize-html";

interface contaFields {
  username?: string;
  nickname?: string;
  bio?: string;
  avatar_url?: string;
}

export const put: APIRoute = async ({ request }) => {
  const form = await request.formData();
  function getCookie(name: string) {
    return (
      (request.headers.get("Cookie") as string)
        .match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")
        ?.pop() || null
    );
  }

  const user = await getUser(
    getCookie("my-refresh-token"),
    getCookie("my-access-token")
  );
  if (!user) {
    return {
      body: JSON.stringify({
        error: { message: "Você não está logado." },
      }),
      status: 401,
    };
  }

  const avatarFile = form.get("avatar") as File;
  const fields: contaFields = {
    username: form.get("username") as string,
    nickname: form.get("nickname") as string,
    bio: sanitizeHtml(form.get("bio") as string, {
      allowedTags: ["span", "p"],
      allowedAttributes: {
        span: ["style"],
      },
      disallowedTagsMode: "escape",
      allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    }),
  };

  try {
    if (avatarFile.size > 0) fields.avatar_url = await uploadImage(avatarFile);
  } catch (error: any) {
    return {
      body: JSON.stringify({ error: { message: error } }),
      status: 400,
    };
  }

  const responseEdit = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", user.id);

  if (responseEdit.error) {
    return {
      body: JSON.stringify({
        error: responseEdit.error,
      }),
      status: 400,
    };
  }

  return {
    body: JSON.stringify({}),
  };
};
