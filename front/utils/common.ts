export const hexToRgb = (hex: string) =>
  /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.exec(hex)?.slice(1, 4).map(a => parseInt(a, 16)).join(',');
