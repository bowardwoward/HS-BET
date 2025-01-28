export const generateString = (length: number): string =>
  Array.from({ length }, () => Math.random().toString(36).charAt(2)).join('');
