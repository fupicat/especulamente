export default function Marquee(selector: string, speed: number) {
  const parentSelector = document.querySelector(selector)!;
  const clone = parentSelector.innerHTML;
  const firstElement = parentSelector.children[0] as HTMLElement;
  let i = 0;

  parentSelector.insertAdjacentHTML("beforeend", clone);
  parentSelector.insertAdjacentHTML("beforeend", clone);

  setInterval(function () {
    firstElement.style.marginLeft = `-${i}px`;
    if (i > firstElement.clientWidth) {
      i = 0;
    }
    i = i + speed;
  }, 0);
}
