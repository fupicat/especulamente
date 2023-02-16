const today = new Date();

export const isNatal = today.getDate() === 25 && today.getMonth() === 11;
export const isAnoNovo = today.getDate() === 31 && today.getMonth() === 11;
export const isHalloween = today.getDate() === 31 && today.getMonth() === 9;

export const specialDay =
  (isNatal && "natal") ||
  (isAnoNovo && "anonovo") ||
  (isHalloween && "halloween");
