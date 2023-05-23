export function showSavingDialog(
  title: string = "salvando",
  description: string = "NÃO feche esta janela!"
) {
  removeSavingDialog();

  const div = document.createElement("div");
  div.id = "saving-dialog";
  const img = document.createElement("img");
  img.src = "/img/sprites/losango.svg";
  img.alt = "";
  div.appendChild(img);
  const p1 = document.createElement("p");
  p1.className = "hooge";
  p1.textContent = title;
  div.appendChild(p1);
  const p2 = document.createElement("p");
  p2.className = "arial";
  p2.textContent = description;
  div.appendChild(p2);

  document.body.appendChild(div);
}

export function removeSavingDialog() {
  const div = document.getElementById("saving-dialog");
  if (div) {
    document.body.removeChild(div);
  }
}
