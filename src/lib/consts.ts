export const sanitizeHTMLOptions = {
  allowedTags: ["span", "p"],
  allowedAttributes: {
    span: ["style"],
  },
  disallowedTagsMode: "escape",
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
};
