import { getMediaByID, getUser, supabase } from "@/lib/supabaseServer";
import { uploadImage, uploadVideo } from "@/lib/imgur";
import type { APIRoute } from "astro";
//@ts-ignore
import sanitizeHtml from "sanitize-html";
import { sanitizeHTMLOptions } from "@/lib/consts";
import { errorResponse, getCookie } from "@/lib/serverShorthand";

interface mediaFields {
  author?: string;
  image_url?: string;
  video_url?: string;
  title?: string;
  description?: string;
  tags?: Array<string>;
  nsfw?: boolean;
}

export const post: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const user = await getUser(
    getCookie(request, "my-refresh-token"),
    getCookie(request, "my-access-token")
  );
  if (!user) {
    return errorResponse("Você não está logado!", 401);
  }

  const fields: mediaFields = {
    author: user.id,
    title: form.get("title") as string,
    description: sanitizeHtml(
      form.get("description") as string,
      sanitizeHTMLOptions
    ),
    tags: (form.get("tags") as string).split(",").map((tag) => tag.trim()),
    nsfw: form.get("nsfw") === "on",
  };

  const uploadedFile = form.get("file") as File;
  const urlFile = form.get("url");

  if (urlFile) {
    const url = new URL(urlFile as string);
    if (url.hostname.includes("youtu")) {
      fields.video_url = urlFile as string;

      const thumbnail = form.get("thumbnail") as File;
      if (thumbnail.size > 0) {
        fields.image_url = await uploadImage(thumbnail);
      }
    } else {
      fields.image_url = urlFile as string;
    }
  } else {
    try {
      if (uploadedFile.size > 0) {
        if (uploadedFile.type.split("/")[0] === "image") {
          fields.image_url = await uploadImage(uploadedFile);
        } else if (
          [
            "video/mp4",
            "video/webm",
            "video/x-matroska",
            "video/quicktime",
            "video/x-flv",
            "video/x-msvideo",
            "video/x-ms-wmv",
            "video/mpeg",
          ].includes(uploadedFile.type)
        ) {
          console.log("Tentando upar vídeo...");
          fields.video_url = await uploadVideo(uploadedFile);
          console.log("Conseguiu upar o vídeo.");

          const thumbnail = form.get("thumbnail") as File;
          if (thumbnail.size > 0) {
            fields.image_url = await uploadImage(thumbnail);
          }
        }
      } else {
        return errorResponse("Nenhum arquivo selecionado.", 400);
      }
    } catch (error: any) {
      return errorResponse(
        `Deu um erro no try catch. ${JSON.stringify(error)}`,
        400
      );
    }
  }

  const responseCreate = await supabase
    .from("media")
    .insert(fields)
    .select("id")
    .single();

  if (responseCreate.error) {
    return errorResponse(
      `Deu um erro no create. ${JSON.stringify(responseCreate.error)}`,
      400
    );
  }

  return {
    body: JSON.stringify(responseCreate),
  };
};

export const put: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const user = await getUser(
    getCookie(request, "my-refresh-token"),
    getCookie(request, "my-access-token")
  );
  if (!user) {
    return errorResponse("Você não está logado!", 401);
  }

  const media = await getMediaByID(form.get("id") as string);
  if (!media) {
    return errorResponse("Essa mídia não existe!", 404);
  }
  if (user.id !== media.author.id) {
    return errorResponse("Essa mídia não é sua!", 403);
  }

  const fields: mediaFields = {
    title: form.get("title") as string,
    description: sanitizeHtml(
      form.get("description") as string,
      sanitizeHTMLOptions
    ),
    tags: (form.get("tags") as string)
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ""),
    nsfw: form.get("nsfw") === "on",
  };

  const uploadedFile = form.get("file") as File;
  const urlFile = form.get("url");

  if (urlFile) {
    const url = new URL(urlFile as string);
    if (url.hostname.includes("youtu")) {
      fields.video_url = urlFile as string;

      const thumbnail = form.get("thumbnail") as File;
      if (thumbnail.size > 0) {
        fields.image_url = await uploadImage(thumbnail);
      }
    } else {
      fields.image_url = urlFile as string;
    }
  } else {
    try {
      if (uploadedFile.size > 0) {
        if (uploadedFile.type.split("/")[0] === "image") {
          fields.image_url = await uploadImage(uploadedFile);
        } else if (
          [
            "video/mp4",
            "video/webm",
            "video/x-matroska",
            "video/quicktime",
            "video/x-flv",
            "video/x-msvideo",
            "video/x-ms-wmv",
            "video/mpeg",
          ].includes(uploadedFile.type)
        ) {
          fields.video_url = await uploadVideo(uploadedFile);

          const thumbnail = form.get("thumbnail") as File;
          if (thumbnail.size > 0) {
            fields.image_url = await uploadImage(thumbnail);
          }
        }
      }
      // Else, nenhum arquivo para alterar
    } catch (error: any) {
      return errorResponse(
        `Deu um erro no try catch. ${JSON.stringify(error)}`,
        400
      );
    }
  }

  const responseUpdate = await supabase
    .from("media")
    .update(fields)
    .eq("id", form.get("id"))
    .select("id")
    .single();

  if (responseUpdate.error) {
    return errorResponse(
      `Deu um erro no update. ${JSON.stringify(responseUpdate.error)}`,
      400
    );
  }

  return {
    body: JSON.stringify(responseUpdate),
  };
};

export const del: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const user = await getUser(
    getCookie(request, "my-refresh-token"),
    getCookie(request, "my-access-token")
  );
  if (!user) {
    return errorResponse("Você não está logado!", 401);
  }

  const media = await getMediaByID(form.get("id") as string);
  if (!media) {
    return errorResponse("Essa mídia não existe!", 404);
  }
  if (user.id !== media.author.id) {
    return errorResponse("Essa mídia não é sua!", 403);
  }

  const responseUpdate = await supabase
    .from("media")
    .delete()
    .eq("id", form.get("id"));

  if (responseUpdate.error) {
    return errorResponse(
      `Deu um erro no delete. ${JSON.stringify(responseUpdate.error)}`,
      400
    );
  }

  return {
    body: JSON.stringify(responseUpdate),
  };
};
