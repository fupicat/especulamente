export function escapeAngleBrackets(string: string | undefined): string | null {
  if (!string) {
    return null;
  }
  let escaped = string.replace(/</g, "&lt;");
  escaped = escaped.replace(/>/g, "&gt;");
  return escaped;
}
