import { getUser } from "@/lib/supabaseServer";
import { uploadImage } from "@/lib/imgur";
import type { APIRoute } from "astro";
//@ts-ignore
import sanitizeHtml from "sanitize-html";
import Profile, { ProfileEditable } from "@/models/Profile";
import { errorResponse } from "@/lib/serverShorthand";

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
    return errorResponse("Faça login!", 401);
  }

  const avatarFile = form.get("avatar") as File;
  const fields: ProfileEditable = {
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
  } catch (error) {
    return errorResponse(error as string, 400);
  }

  try {
    return {
      body: JSON.stringify(await Profile.put(user.id, fields)),
    };
  } catch (error) {
    return errorResponse(error as string, 400);
  }
};
