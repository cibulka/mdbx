export function normalizeString(str: string) {
  return str
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function slugify(str: string): string {
  return str.replace(/[^a-z0-9_]+/gi, '-').toLocaleLowerCase();
}
