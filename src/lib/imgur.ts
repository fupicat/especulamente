export async function uploadImage(file: File | null) {
  if (!file) {
    return null;
  }

  const headers = new Headers();
  headers.append(
    "Authorization",
    `Client-ID ${import.meta.env.IMGUR_CLIENT_ID}`
  );

  const form = new FormData();
  form.append("image", file);

  const request: RequestInit = {
    method: "POST",
    headers,
    body: form,
    redirect: "follow",
  };

  const uploaded = (await (
    await fetch("https://api.imgur.com/3/upload", request)
  ).json()) as any;
  if (!uploaded.success) {
    throw new Error("Erro ao upar imagem! Confira se o arquivo está certo.");
  }
  return uploaded.data.link;
}

export async function uploadVideo(file: File | null) {
  if (!file) {
    return null;
  }

  const headers = new Headers();
  headers.append(
    "Authorization",
    `Client-ID ${import.meta.env.IMGUR_CLIENT_ID}`
  );

  const form = new FormData();
  form.append("video", file);
  form.append("disable_audio", "0");

  const request: RequestInit = {
    method: "POST",
    headers,
    body: form,
    redirect: "follow",
  };

  const uploaded = (await (
    await fetch("https://api.imgur.com/3/upload", request)
  ).json()) as any;
  if (!uploaded.success) throw uploaded;

  return uploaded.data.link;
}
