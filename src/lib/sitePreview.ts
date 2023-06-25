export function updateSitePreview(customColor?: string, customBg?: string) {
  document.body.style.setProperty(
    "--background_url",
    customBg ? `url(${customBg})` : "initial"
  );

  document.body.classList.toggle("rainbow", customColor === "rainbow");
  if (customColor !== "rainbow") {
    document.body.style.setProperty("--custom_color", customColor || "initial");

    document.body.style.setProperty(
      "--bg_custom_color",
      !customBg || customBg === "initial" ? customColor || "initial" : "initial"
    );
  }
}
