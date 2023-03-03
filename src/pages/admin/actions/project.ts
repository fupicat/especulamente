import { uploadImage, uploadVideo } from "@/lib/imgur";
import type { APIRoute } from "astro";
//@ts-ignore
import sanitizeHtml from "sanitize-html";
import { sanitizeHTMLOptions } from "@/lib/consts";
import { errorResponse } from "@/lib/serverShorthand";
import { getLoggedInID } from "@/lib/supabaseServer";
import type { ProjectCreatable, ProjectEditable } from "@/models/Project";
import Project from "@/models/Project";

export const post: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  if (!form.has("type")) {
    return errorResponse("É necessário informar o tipo de conteúdo!", 400);
  }
  const type = form.get("type") as string;

  if (!form.has("title")) {
    return errorResponse(
      "Campos obrigatórios faltando! Obrigatórios: title",
      400
    );
  }

  // Detalhes básicos
  const data: ProjectCreatable = {
    type,
    author: userId,
    nsfw: form.get("nsfw") === "on",
    title: form.get("title") as string,
    description:
      sanitizeHtml(form.get("description") as string, sanitizeHTMLOptions) ||
      null,
    tags: form.get("tags")
      ? (form.get("tags") as string)
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : null,
    thumbnail_url: (form.get("thumbnail_url") as string) || null,
  };

  // Conteúdo
  try {
    if (type === "image") {
      if (!form.has("image")) {
        return errorResponse("Nenhuma imagem para upload!", 400);
      }
      const imageField = form.get("image") as File | string;
      const image =
        typeof imageField === "string"
          ? imageField
          : await uploadImage(imageField);

      data.content = {
        image_url: image,
      };
    } else if (type === "video") {
      if (!form.has("video")) {
        return errorResponse("Nenhum vídeo para upload!", 400);
      }
      const videoField = form.get("video") as File | string;
      const video =
        typeof videoField === "string"
          ? videoField
          : await uploadVideo(videoField);

      data.content = {
        video_url: video,
      };
    } else {
      // Se não for nenhum dos tipos acima, vc pode criar um projeto genérico
      // passando o conteúdo como JSON no campo "content"

      if (!form.has("content")) {
        return errorResponse("É necessário informar o conteúdo!", 400);
      }

      data.content = JSON.parse(form.get("content") as string);
    }
  } catch (error) {
    return errorResponse(JSON.stringify(error), 400);
  }

  const project = await Project.post(data);
  return {
    body: JSON.stringify(project),
  };
};

export const put: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  const project = await Project.get(Number(form.get("id")));
  if (!project) {
    return errorResponse("Esse projeto não existe!", 404);
  }
  if (userId !== project.author.id) {
    return errorResponse("Esse projeto não é seu!", 403);
  }

  const type = project.type;

  // Detalhes básicos
  let data: ProjectEditable = {
    nsfw: form.get("nsfw") === "on",
    title: form.get("title") as string,
    description:
      sanitizeHtml(form.get("description") as string, sanitizeHTMLOptions) ||
      null,
    tags: form.get("tags")
      ? (form.get("tags") as string)
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : null,
    thumbnail_url: (form.get("thumbnail_url") as string) || null,
  };

  // Conteúdo
  try {
    if (type === "image" && form.has("image")) {
      const imageField = form.get("image") as File | string;
      const image =
        typeof imageField === "string"
          ? imageField
          : await uploadImage(imageField);

      data.content = {
        image_url: image,
      };
    } else if (type === "video" && form.has("video")) {
      if (!form.has("video")) {
        return errorResponse("Nenhum vídeo para upload!", 400);
      }
      const videoField = form.get("video") as File | string;
      const video =
        typeof videoField === "string"
          ? videoField
          : await uploadVideo(videoField);

      data.content = {
        video_url: video,
      };
    } else if (form.has("content")) {
      // Se não for nenhum dos tipos acima, vc pode editar um projeto genérico
      // passando o conteúdo como JSON no campo "content"

      data.content = JSON.parse(form.get("content") as string);
    }
  } catch (error) {
    return errorResponse(JSON.stringify(error), 400);
  }

  const newProject = await Project.put(project.id, data);
  return {
    body: JSON.stringify(newProject),
  };
};

export const del: APIRoute = async ({ request }) => {
  const form = await request.formData();

  const userId = await getLoggedInID(request);
  if (!userId) {
    return errorResponse("Faça login!", 401);
  }

  const id = Number(form.get("id"));
  const project = await Project.get(id);
  if (!project) return errorResponse("Esse projeto não existe!", 404);
  if (userId !== project.author.id)
    return errorResponse("Esse projeto não é seu!", 403);

  try {
    await Project.del(id);

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
