export function getCookie(request: Request, name: string) {
  return (
    (request.headers.get("Cookie") as string)
      ?.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")
      ?.pop() || null
  );
}

export function errorResponse(message: string, statusCode: number) {
  return {
    body: JSON.stringify({
      error: { message },
    }),
    status: statusCode,
  };
}
