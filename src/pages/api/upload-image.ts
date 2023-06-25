import type { APIRoute } from "astro";
import { errorResponse } from "@/lib/serverShorthand";
import { getLoggedInID } from "@/lib/supabaseServer";
import { uploadImage } from "@/lib/imgur";

export const post: APIRoute = async ({ request }) => {
  if (!(await getLoggedInID(request))) {
    return errorResponse("Você não está logado!", 403);
  }

  const body = await request.formData();
  const file = body.get("file") as File;
  if (!file) {
    return errorResponse("Nenhum arquivo selecionado!", 400);
  }

  let image_url: string;
  try {
    image_url = await uploadImage(file);
  } catch (e: any) {
    return errorResponse(e.error.message, 500);
  }

  return {
    body: JSON.stringify({
      image_url,
    }),
  };
};
