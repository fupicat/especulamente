import { uploadImage, uploadVideo } from "@/lib/imgur";
import type { APIRoute } from "astro";
//@ts-ignore
import sanitizeHtml from "sanitize-html";
import { sanitizeHTMLOptions } from "@/lib/consts";
import { errorResponse } from "@/lib/serverShorthand";
import Media, { MediaEditable, MediaCreatable } from "@/models/Media";
import Profile, { ProfileType } from "@/models/Profile";
import { getLoggedInID } from "@/lib/supabaseServer";

async function resolveMediaUpload(
  oldFields: MediaCreatable | MediaEditable,
  form: FormData
): Promise<MediaCreatable | MediaEditable | null> {
  const fields: MediaCreatable | MediaEditable = { ...oldFields };
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

    return fields;
  }

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
  } else {
    return null;
  }

  return fields;
}

export const post: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  const fields: MediaCreatable = {
    author: userId,
    title: form.get("title") as string,
    description: sanitizeHtml(
      form.get("description") as string,
      sanitizeHTMLOptions
    ),
    tags: (form.get("tags") as string).split(",").map((tag) => tag.trim()),
    nsfw: form.get("nsfw") === "on",
    video_url: null,
    image_url: null,
  };

  try {
    const uploadedFields = await resolveMediaUpload(fields, form);
    if (uploadedFields === null)
      throw { error: { message: "Nenhum arquivo selecionado." } };

    const media = await Media.post(uploadedFields as MediaCreatable);

    return {
      body: JSON.stringify(media),
    };
  } catch (error) {
    return {
      body: JSON.stringify(error),
      status: 400,
    };
  }
};

export const put: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  const media = await Media.get(Number(form.get("id")));
  if (!media) {
    return errorResponse("Essa mídia não existe!", 404);
  }
  if (userId !== media.author.id) {
    return errorResponse("Essa mídia não é sua!", 403);
  }

  let fields: MediaEditable = {
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

  try {
    const uploadedFields = await resolveMediaUpload(fields, form);
    if (uploadedFields !== null) fields = uploadedFields as MediaEditable;

    const media = await Media.put(
      Number(form.get("id")),
      uploadedFields as MediaCreatable
    );

    return {
      body: JSON.stringify(media),
    };
  } catch (error) {
    return {
      body: JSON.stringify(error),
      status: 400,
    };
  }
};

export const del: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  const media = await Media.get(Number(form.get("id")));
  if (!media) return errorResponse("Essa mídia não existe!", 404);
  if (userId !== media.author.id)
    return errorResponse("Essa mídia não é sua!", 403);

  try {
    await Media.del(Number(form.get("id")));

    return {
      body: JSON.stringify({}),
    };
  } catch (error) {
    return {
      body: JSON.stringify(error),
      status: 400,
    };
  }
};
