import type { APIRoute } from "astro";
import { errorResponse } from "@/lib/serverShorthand";
import { getLoggedInID } from "@/lib/supabaseServer";
import { uploadVideo } from "@/lib/imgur";

export const post: APIRoute = async ({ request }) => {
  if (!(await getLoggedInID(request))) {
    return errorResponse("Você não está logado!", 403);
  }

  const body = await request.formData();
  const file = body.get("file") as File;
  if (!file) {
    return errorResponse("Nenhum arquivo selecionado!", 400);
  }

  let video_url: string;
  try {
    video_url = await uploadVideo(file);
  } catch (e: any) {
    return errorResponse(e.error.message, 500);
  }

  return {
    body: JSON.stringify({
      video_url,
    }),
  };
};
